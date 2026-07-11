export const MAX_CANCEL_REASON = 300

export type BookingState = 'cancelled' | 'confirmed' | 'pending_confirm' | 'unpaid'

export function bookingStatus(b: {
  confirmed_at: string | null
  cancelled_at: string | null
  paid: boolean
  payment_method: string | null
}): BookingState {
  if (b.cancelled_at) return 'cancelled'
  if (b.confirmed_at) return 'confirmed'
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
