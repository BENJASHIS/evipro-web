// Reglas del pago al reservar con Yape y Plin
// (docs/superpowers/specs/2026-11-01-pago-reserva-yape-plin-design.md).
// Las rutas, el webhook de Mercado Pago y el panel del médico pasan por aquí.
import type { createServiceClient } from '@/lib/supabase-server'
import { MOTIVO_SIN_TURNO, MOTIVO_VENCIDA } from '@/lib/bookings'
import { confirmarEvento } from '@/lib/google-calendar'
import { DOCTORS, type Doctor } from '@/lib/doctors'

export type ServiceClient = ReturnType<typeof createServiceClient>
export type MedioReporte = 'yape' | 'plin' | 'paypal' | 'codigo'

/** Número de operación (solo dígitos; en PayPal, letras y números) o código de crédito `EVI-XXXXXXXX`; null si no es válido. */
export function normalizarReferencia(medio: MedioReporte, texto: string): string | null {
  if (medio === 'codigo') {
    const codigo = texto.trim().toUpperCase()
    return /^EVI-[A-HJ-NP-Z2-9]{8}$/.test(codigo) ? codigo : null
  }
  const limpio = texto.replace(/[\s-]/g, '').toUpperCase()
  if (medio === 'paypal') return /^[A-Z0-9]{6,20}$/.test(limpio) ? limpio : null
  return /^\d{4,20}$/.test(limpio) ? limpio : null
}

/**
 * Cancela las reservas de ese médico cuyo plazo de pago venció sin pago ni número de operación.
 * Sin cron (Vercel Hobby): se llama al leer turnos, al reservar, al reportar y al abrir el panel.
 */
export async function liberarVencidas(supabase: ServiceClient, doctorSlug: string, ahora: Date = new Date()): Promise<void> {
  const iso = ahora.toISOString()
  const { error } = await supabase
    .from('counseling_bookings')
    .update({ cancelled_at: iso, cancel_reason: MOTIVO_VENCIDA })
    .eq('doctor_slug', doctorSlug)
    .is('cancelled_at', null)
    .is('confirmed_at', null)
    .eq('paid', false)
    .is('payment_reported_at', null)
    .lt('pago_hasta', iso)
  if (error) console.error('[pago-reserva] liberar vencidas falló', doctorSlug, error.message)
}

export interface ReservaConPago {
  id: string
  doctor_slug: string
  patient_name: string
  modality: string
  slot_date: string | null
  slot_time: string | null
  price_soles: number
  paid: boolean
  payment_method: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  pago_hasta: string | null
  payment_reported_at: string | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Reserva de un médico con pago al reservar, leída después de liberar las vencidas de ese médico
 * (así su estado ya es el real). null si el id no es válido, no existe o el médico no cobra al reservar.
 */
export async function leerReservaConPago(
  supabase: ServiceClient, id: string | null,
): Promise<{ reserva: ReservaConPago; doctor: Doctor } | null> {
  if (!id || !UUID.test(id)) return null
  const leer = async () => (await supabase
    .from('counseling_bookings')
    .select('id, doctor_slug, patient_name, modality, slot_date, slot_time, price_soles, paid, payment_method, confirmed_at, cancelled_at, cancel_reason, pago_hasta, payment_reported_at')
    .eq('id', id)
    .maybeSingle()).data as ReservaConPago | null
  const primera = await leer()
  const doctor = DOCTORS.find(d => d.slug === primera?.doctor_slug)
  if (!primera || !doctor?.pagoAlReservar) return null
  await liberarVencidas(supabase, doctor.slug)
  const reserva = await leer()
  return reserva ? { reserva, doctor } : null
}

type ResultadoConfirmar = { ok: true; sinTurno: boolean } | { ok: false; error: string }

/**
 * Marca la reserva pagada y confirmada. Revive una reserva vencida si su turno sigue libre;
 * si otro ya lo tomó, la deja pagada sin turno y con devolución pendiente.
 * Nunca revive una reserva que canceló Carlos.
 */
export async function confirmarPago(
  supabase: ServiceClient,
  id: string,
  datos: { monto?: number; referencia?: string | null; medio?: 'yape' | 'plin' | 'paypal' | 'mercadopago' | 'free'; mpPaymentId?: string },
  soloMedico?: string,
): Promise<ResultadoConfirmar> {
  let consulta = supabase
    .from('counseling_bookings')
    .select('id, doctor_slug, patient_name, modality, slot_date, slot_time, price_soles, cancelled_at, cancel_reason')
    .eq('id', id)
  if (soloMedico) consulta = consulta.eq('doctor_slug', soloMedico)
  const { data: reserva } = await consulta.maybeSingle()
  if (!reserva) return { ok: false, error: 'No encontrado' }
  const pago: Record<string, unknown> = { paid: true, amount_received: datos.monto ?? reserva.price_soles }
  if (datos.referencia) pago.payment_reference = datos.referencia
  if (datos.medio) pago.payment_method = datos.medio
  if (datos.mpPaymentId) pago.mp_payment_id = datos.mpPaymentId

  if (reserva.cancelled_at && reserva.cancel_reason !== MOTIVO_VENCIDA) {
    // Carlos la canceló. Si igual llegó un pago con tarjeta (el paciente estaba en Mercado Pago),
    // no se pierde: queda pagada, sin turno y con devolución pendiente.
    if (!datos.mpPaymentId) return { ok: false, error: 'Reserva cancelada' }
    const { error: e } = await supabase.from('counseling_bookings').update({ ...pago, refund_pending: true }).eq('id', id)
    if (e) return { ok: false, error: e.message }
    return { ok: true, sinTurno: true }
  }

  const { error } = await supabase
    .from('counseling_bookings')
    .update({ ...pago, confirmed_at: new Date().toISOString(), cancelled_at: null, cancel_reason: null })
    .eq('id', id)
  if (error?.code === '23505' && error.message.includes('counseling_bookings_slot_unique')) {
    const { error: e2 } = await supabase
      .from('counseling_bookings')
      .update({ ...pago, refund_pending: true, cancel_reason: MOTIVO_SIN_TURNO })
      .eq('id', id)
    if (e2) return { ok: false, error: e2.message }
    return { ok: true, sinTurno: true }
  }
  if (error?.code === '23505') return { ok: false, error: 'Ese número de operación ya se usó en otra reserva' }
  if (error) return { ok: false, error: error.message }

  await confirmarEvento({
    id: reserva.id, doctor_slug: reserva.doctor_slug, patient_name: reserva.patient_name,
    modality: reserva.modality, slot_date: reserva.slot_date, slot_time: reserva.slot_time,
  }).catch(() => {})
  return { ok: true, sinTurno: false }
}
