export const MAX_CANCEL_REASON = 300

// Pago al reservar (docs/superpowers/specs/2026-11-01-pago-reserva-yape-plin-design.md).
export const PLAZO_PAGO_MS = 3_600_000
export const MOTIVO_VENCIDA = 'sin pago en 1 hora'
export const MOTIVO_SIN_TURNO = 'pagó sin turno'
export const POLITICA_CANCELACION_VERSION = '2026-11-01'
export const REGLA_CANCELACION =
  'Puedes cancelar o cambiar la fecha hasta 24 h antes; con menos de 24 h, solo cambiar la fecha una vez.'

export type BookingState =
  | 'cancelled' | 'confirmed' | 'payment_to_verify' | 'pending_payment' | 'pending_confirm' | 'unpaid'

export function bookingStatus(b: {
  confirmed_at: string | null
  cancelled_at: string | null
  paid: boolean
  payment_method: string | null
  pago_hasta?: string | null
  payment_reported_at?: string | null
}, ahora: Date = new Date()): BookingState {
  if (b.cancelled_at) return 'cancelled'
  if (b.confirmed_at) return 'confirmed'
  if (b.payment_reported_at) return 'payment_to_verify'
  if (b.pago_hasta && !b.paid && new Date(b.pago_hasta) >= ahora) return 'pending_payment'
  if (b.paid || b.payment_method === 'free') return 'pending_confirm'
  return 'unpaid'
}

export interface CancelReasonValidation {
  ok: boolean
  error?: string
  reason?: string
}

export function validateCancelReason(raw: unknown): CancelReasonValidation {
  if (typeof raw !== 'string') return { ok: false, error: 'Motivo inválido' }
  const reason = raw.trim()
  if (!reason) return { ok: false, error: 'El motivo no puede estar vacío' }
  if (reason.length > MAX_CANCEL_REASON) {
    return { ok: false, error: `El motivo no puede superar ${MAX_CANCEL_REASON} caracteres` }
  }
  return { ok: true, reason }
}

// Un miembro puede cancelar su cita si no está ya cancelada, el slot no pasó y sigue sin pagar:
// una pagada o con pago avisado se cancela o cambia por WhatsApp (regla de 24 h,
// devolución pendiente; la aplica Carlos en su panel).
// Granularidad por día (YYYY-MM-DD, comparación lexicográfica) para evitar
// problemas de zona horaria: el servidor corre en UTC, los slots son hora Perú;
// el día es la unidad segura. Cita del mismo día → cancelable.
export function canPatientCancel(
  b: { cancelled_at: string | null; slot_date: string | null; paid?: boolean; payment_reported_at?: string | null; confirmed_at?: string | null },
  today: string = new Date().toISOString().slice(0, 10),
): boolean {
  if (b.cancelled_at || b.paid || b.payment_reported_at) return false
  if (!b.slot_date) return true
  return b.slot_date >= today
}
