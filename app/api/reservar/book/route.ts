import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase-server'
import { esConvenio, precioConsulta, precioReferencia, tarifaDe, VISITA_MAX, type ModalidadReserva, type TarifaConsulta } from '@/lib/consulta-pricing'
import { validateBookingInput } from '@/lib/booking-validation'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { readTurnstileToken, verifyTurnstileToken } from '@/lib/turnstile'
import { ocupadosEnGoogle } from '@/lib/google-calendar'
import { DOCTORS } from '@/lib/doctors'
import { PLAZO_PAGO_MS, POLITICA_CANCELACION_VERSION } from '@/lib/bookings'
import { liberarVencidas } from '@/lib/pago-reserva'

interface ReservaBody {
  doctor_slug: string
  modality: ModalidadReserva
  slot_date?: string | null
  slot_time?: string | null
  patient_name: string
  patient_phone: string
  patient_note?: string | null
  consent?: boolean
  visit_number?: number
  /** Slug del aliado que manda al paciente (enlace ?convenio=); uno desconocido no cambia el precio. */
  convenio?: string
}

const MODALIDADES: ModalidadReserva[] = ['presencial', 'virtual', 'domicilio']

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req, { namespace: 'api:reservar-book', limit: 8, windowMs: 10 * 60 * 1000 })
  if (!limit.ok) return rateLimitResponse(limit)

  let body: ReservaBody
  try {
    body = await req.json() as ReservaBody
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }
  const { doctor_slug, modality, patient_name, patient_phone } = body

  if (!modality || !MODALIDADES.includes(modality)) {
    return NextResponse.json({ error: 'Modalidad inválida' }, { status: 400 })
  }
  const invalid = validateBookingInput({ doctor_slug, patient_name, patient_phone, patient_note: body.patient_note, consent: body.consent, slot_date: body.slot_date, slot_time: body.slot_time })
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })
  const turnstile = await verifyTurnstileToken(readTurnstileToken(body), req)
  if (!turnstile.ok) {
    return NextResponse.json({ error: turnstile.error }, { status: 403 })
  }

  // El paciente pudo cargar los horarios antes de que Carlos ocupara ese turno en Google.
  const { slot_date, slot_time } = body
  if (slot_date && slot_time && (await ocupadosEnGoogle(doctor_slug, [slot_date], [slot_time])).includes(`${slot_date}T${slot_time}`)) {
    return NextResponse.json({ error: 'Ese horario ya fue reservado. Elige otro.' }, { status: 409 })
  }

  const visita = body.visit_number ?? 1
  if (!Number.isInteger(visita) || visita < 1 || visita > VISITA_MAX) return NextResponse.json({ error: 'Visita inválida' }, { status: 400 })

  const supabase = createServiceClient()
  const authClient = await createServerSupabaseClient()
  const { data: { user } } = await authClient.auth.getUser()

  // Pago al reservar (Yape/Plin): solo médicos con QR y consultas con turno; domicilio sigue como antes.
  const cobra = !!DOCTORS.find(d => d.slug === doctor_slug)?.pagoAlReservar && modality !== 'domicilio' && !!slot_date && !!slot_time

  // Frontera de confianza: el precio se DERIVA en el servidor.
  // Sin pago al reservar: nominal de referencia y cobro manual (paid=false, payment_method='manual').
  const price_soles = cobra
    ? precioConsulta(modality as Exclude<ModalidadReserva, 'domicilio'>, user ? await tarifaDelUsuario(supabase, user.id) : 'regular', visita, false, body.convenio)
    : precioReferencia(modality, body.convenio)
  // Gratis (miembro en virtual desde la 5ª): nada que pagar; Carlos verifica la visita y confirma como siempre.
  const conPago = cobra && price_soles > 0
  const pago_hasta = conPago ? new Date(Date.now() + PLAZO_PAGO_MS).toISOString() : undefined
  if (cobra) await liberarVencidas(supabase, doctor_slug)

  const { data, error } = await supabase
    .from('counseling_bookings')
    .insert({
      doctor_slug,
      modality,
      slot_date: body.slot_date ?? null,
      slot_time: body.slot_time ?? null,
      patient_name,
      patient_phone,
      patient_note: body.patient_note ?? null,
      consent_at: new Date().toISOString(),
      is_first_session: true,
      price_soles,
      paid: false,
      payment_method: price_soles === 0 ? 'free' : 'manual',
      user_id: user?.id ?? null,
      convenio: esConvenio(body.convenio) ? body.convenio : null,
      ...(cobra ? { visit_number: visita } : {}),
      ...(conPago ? { pago_hasta, policy_version: POLITICA_CANCELACION_VERSION } : {}),
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ese horario ya fue reservado. Elige otro.' }, { status: 409 })
    }
    console.error('[reservar/book] db error:', error.message)
    return NextResponse.json({ error: 'No se pudo guardar la solicitud' }, { status: 500 })
  }
  // El evento de Google se crea al reportar el pago o al confirmar: una reserva que vence no deja eventos.
  if (conPago) return NextResponse.json({ booking_id: data.id, pago: { monto: price_soles, pago_hasta } })
  return NextResponse.json({ booking_id: data.id })
}

/** Tarifa de la membresía activa del usuario; regular si no tiene. */
async function tarifaDelUsuario(supabase: ReturnType<typeof createServiceClient>, userId: string): Promise<TarifaConsulta> {
  const { data } = await supabase
    .from('subscriptions')
    .select('membership_plans(type)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const plan = data?.membership_plans as { type?: string } | { type?: string }[] | null | undefined
  return tarifaDe(Array.isArray(plan) ? plan[0]?.type : plan?.type)
}
