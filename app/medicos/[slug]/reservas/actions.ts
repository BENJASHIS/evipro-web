'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyDoctorPortalToken } from '@/lib/doctor-portal'
import { validateCancelReason } from '@/lib/bookings'
import { generateCreditCode } from '@/lib/credits'

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

// Acuña un crédito de consulta gratis para el miembro dueño de una reserva.
// Solo reservas de miembros logueados (con user_id) pueden recibirlo.
export async function mintCredit(
  slug: string,
  token: string,
  userId: string,
  memberName: string,
): Promise<ActionResult> {
  if (!verifyDoctorPortalToken(slug, token)) return { ok: false, error: 'No autorizado' }
  if (!userId) return { ok: false, error: 'La reserva no está ligada a una cuenta de miembro' }
  const supabase = createServiceClient()
  const { error } = await supabase.from('consultation_credits').insert({
    code: generateCreditCode(),
    user_id: userId,
    member_name: memberName,
    minted_by_slug: slug,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/medicos/${slug}/reservas`)
  return { ok: true }
}

// Marca un crédito como canjeado o donado a sorteo. Solo el médico que lo
// acuñó, y solo si sigue activo (guard en SQL con .eq('status','active')).
async function setCreditStatus(
  slug: string, token: string, creditId: string, status: 'redeemed' | 'donated',
): Promise<ActionResult> {
  if (!verifyDoctorPortalToken(slug, token)) return { ok: false, error: 'No autorizado' }
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('consultation_credits')
    .update({ status, redeemed_at: status === 'redeemed' ? new Date().toISOString() : null })
    .eq('id', creditId)
    .eq('minted_by_slug', slug)
    .eq('status', 'active')
    .select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'El crédito ya no está activo' }
  revalidatePath(`/medicos/${slug}/reservas`)
  return { ok: true }
}

export async function redeemCredit(slug: string, token: string, creditId: string) {
  return setCreditStatus(slug, token, creditId, 'redeemed')
}
export async function donateCredit(slug: string, token: string, creditId: string) {
  return setCreditStatus(slug, token, creditId, 'donated')
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
