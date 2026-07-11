'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyDoctorPortalToken } from '@/lib/doctor-portal'
import { validateCancelReason } from '@/lib/bookings'

type ActionResult = { ok: boolean; error?: string }

export async function confirmBooking(slug: string, token: string, id: string): Promise<ActionResult> {
  if (!verifyDoctorPortalToken(slug, token)) return { ok: false, error: 'No autorizado' }
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('counseling_bookings')
    .update({ confirmed_at: new Date().toISOString(), cancelled_at: null, cancel_reason: null })
    .eq('id', id)
    .eq('doctor_slug', slug)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/medicos/${slug}/reservas`)
  return { ok: true }
}

export async function cancelBooking(slug: string, token: string, id: string, rawReason: unknown): Promise<ActionResult> {
  if (!verifyDoctorPortalToken(slug, token)) return { ok: false, error: 'No autorizado' }
  const v = validateCancelReason(rawReason)
  if (!v.ok) return { ok: false, error: v.error }
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('counseling_bookings')
    .update({ cancelled_at: new Date().toISOString(), cancel_reason: v.reason, confirmed_at: null })
    .eq('id', id)
    .eq('doctor_slug', slug)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/medicos/${slug}/reservas`)
  return { ok: true }
}
