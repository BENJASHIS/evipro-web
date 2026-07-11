'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase-server'
import { validateCancelReason, canPatientCancel } from '@/lib/bookings'

type ActionResult = { ok: boolean; error?: string }

export async function cancelMyBooking(bookingId: string, rawReason: unknown): Promise<ActionResult> {
  const authClient = await createServerSupabaseClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado' }

  const v = validateCancelReason(rawReason)
  if (!v.ok) return { ok: false, error: v.error }

  const supabase = createServiceClient()
  const { data: booking, error: selErr } = await supabase
    .from('counseling_bookings')
    .select('cancelled_at, slot_date')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (selErr) return { ok: false, error: selErr.message }
  if (!booking) return { ok: false, error: 'No encontrado' }
  if (!canPatientCancel(booking)) return { ok: false, error: 'Esta cita ya no se puede cancelar' }

  const { error } = await supabase
    .from('counseling_bookings')
    .update({ cancelled_at: new Date().toISOString(), cancel_reason: v.reason, confirmed_at: null })
    .eq('id', bookingId)
    .eq('user_id', user.id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/miembros')
  return { ok: true }
}
