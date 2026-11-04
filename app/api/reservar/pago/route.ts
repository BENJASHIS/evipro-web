import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { bookingStatus, MOTIVO_VENCIDA } from '@/lib/bookings'
import { crearEventoTentativo } from '@/lib/google-calendar'
import { leerReservaConPago, normalizarReferencia, type MedioReporte } from '@/lib/pago-reserva'

const MEDIOS: MedioReporte[] = ['yape', 'plin', 'codigo']

/** Lo que necesita la pantalla de pago. Sin nombre ni teléfono del paciente. */
export async function GET(req: NextRequest) {
  // Holgado: la pantalla consulta al abrir y hasta 10 veces al volver de pagar con tarjeta.
  const limit = checkRateLimit(req, { namespace: 'api:reservar-pago-get', limit: 60, windowMs: 10 * 60 * 1000 })
  if (!limit.ok) return rateLimitResponse(limit)
  const leida = await leerReservaConPago(createServiceClient(), req.nextUrl.searchParams.get('reserva'))
  if (!leida) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  const { reserva: r, doctor } = leida
  return NextResponse.json({
    estado: bookingStatus(r),
    vencida: r.cancel_reason === MOTIVO_VENCIDA,
    // Cancelada pero pagada: pagó con tarjeta cuando el turno ya no estaba (devolución pendiente).
    pagada: r.paid,
    slot_date: r.slot_date,
    slot_time: r.slot_time?.slice(0, 5) ?? null,
    modality: r.modality,
    monto: r.price_soles,
    pago_hasta: r.pago_hasta,
    medios: Object.keys(doctor.pagoAlReservar!.qr),
    whatsapp: doctor.whatsapp,
  })
}

/** El paciente avisa que pagó: número de operación de Yape/Plin o código de consulta gratis. */
export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req, { namespace: 'api:reservar-pago', limit: 10, windowMs: 10 * 60 * 1000 })
  if (!limit.ok) return rateLimitResponse(limit)

  let body: { reserva?: string; medio?: MedioReporte; referencia?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }
  const medio = body.medio
  if (!medio || !MEDIOS.includes(medio)) return NextResponse.json({ error: 'Medio inválido' }, { status: 400 })
  const referencia = normalizarReferencia(medio, String(body.referencia ?? ''))
  if (!referencia) {
    return NextResponse.json({ error: medio === 'codigo' ? 'Código inválido' : 'Número de operación inválido' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!/^[0-9a-f-]{36}$/i.test(body.reserva ?? '')) return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  const leida = await leerReservaConPago(supabase, body.reserva ?? null)
  if (!leida) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  const { reserva: r } = leida
  if (r.cancelled_at && r.cancel_reason === MOTIVO_VENCIDA) {
    return NextResponse.json({ error: 'Tu turno venció. Si ya pagaste, escríbenos por WhatsApp con tu número de operación' }, { status: 410 })
  }
  if (bookingStatus(r) !== 'pending_payment') {
    return NextResponse.json({ error: 'La reserva ya no está pendiente de pago' }, { status: 409 })
  }
  if (medio === 'codigo') {
    // Solo un crédito que existe y sigue activo aparta el turno; Carlos lo canjea al confirmar.
    const { data: credito } = await supabase
      .from('consultation_credits')
      .select('id')
      .eq('code', referencia)
      .eq('status', 'active')
      .maybeSingle()
    if (!credito) return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
  }

  const { error } = await supabase
    .from('counseling_bookings')
    .update({
      payment_method: medio === 'codigo' ? 'free' : medio,
      payment_reference: referencia,
      payment_reported_at: new Date().toISOString(),
      // El crédito de consulta gratis cubre la consulta; Carlos lo canjea al confirmar.
      ...(medio === 'codigo' ? { price_soles: 0 } : {}),
    })
    .eq('id', r.id)
  if (error?.code === '23505') {
    return NextResponse.json({ error: medio === 'codigo' ? 'Ese código ya se usó en otra reserva' : 'Ese número de operación ya se usó en otra reserva' }, { status: 409 })
  }
  if (error) {
    console.error('[reservar/pago] db error:', error.message)
    return NextResponse.json({ error: 'No se pudo guardar el pago' }, { status: 500 })
  }

  await crearEventoTentativo({
    id: r.id, doctor_slug: r.doctor_slug, patient_name: r.patient_name,
    modality: r.modality, slot_date: r.slot_date, slot_time: r.slot_time,
  }).catch(() => {})
  return NextResponse.json({ ok: true })
}
