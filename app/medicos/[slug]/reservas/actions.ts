'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyDoctorPortalToken } from '@/lib/doctor-portal'
import { validateCancelReason } from '@/lib/bookings'
import { generateCreditCode } from '@/lib/credits'
import { COUNSELING_BOOKING_CALENDAR_COLUMNS } from '@/lib/db-columns'
import { cancelarEvento, confirmarEvento, moverEvento, ocupadosEnGoogle } from '@/lib/google-calendar'
import { DOCTORS } from '@/lib/doctors'
import { slotValido } from '@/lib/booking-validation'
import { confirmarPago } from '@/lib/pago-reserva'

type ActionResult = { ok: boolean; error?: string }

export async function confirmBooking(slug: string, token: string, id: string): Promise<ActionResult> {
  if (!verifyDoctorPortalToken(slug, token)) return { ok: false, error: 'No autorizado' }
  const supabase = createServiceClient()
  const { data: reserva, error } = await supabase
    .from('counseling_bookings')
    .update({ confirmed_at: new Date().toISOString(), cancelled_at: null, cancel_reason: null })
    .eq('id', id)
    .eq('doctor_slug', slug)
    .select(COUNSELING_BOOKING_CALENDAR_COLUMNS)
    .maybeSingle()
  if (error) return { ok: false, error: error.message }
  if (reserva) await confirmarEvento(reserva).catch(() => {})
  revalidatePath(`/medicos/${slug}/reservas`)
  return { ok: true }
}

// Confirmar el pago de una reserva con pago al reservar: tanto si el paciente mandó su número de
// operación como si Carlos vio el pago primero en su app. Revive una reserva vencida si su turno sigue libre.
export async function confirmarPagoReserva(
  slug: string, token: string, id: string, rawMonto: unknown, rawReferencia: unknown,
): Promise<ActionResult & { sinTurno?: boolean }> {
  if (!verifyDoctorPortalToken(slug, token)) return { ok: false, error: 'No autorizado' }
  const textoMonto = String(rawMonto ?? '').trim().replace(',', '.')
  const monto = textoMonto === '' ? undefined : Number(textoMonto)
  if (monto !== undefined && (!Number.isFinite(monto) || monto < 0 || monto > 10000)) return { ok: false, error: 'Monto inválido' }
  const referencia = String(rawReferencia ?? '').trim() || null
  if (referencia && referencia.length > 40) return { ok: false, error: 'Número de operación inválido' }

  const r = await confirmarPago(createServiceClient(), id, { monto, referencia }, slug)
  if (!r.ok) return r
  revalidatePath(`/medicos/${slug}/reservas`)
  return { ok: true, sinTurno: r.sinTurno }
}

// Cambiar la fecha de una reserva sin volver a cobrar (regla: con menos de 24 h, una sola vez;
// el panel muestra cuántas veces cambió y decide Carlos). Una reserva pagada con devolución
// pendiente (incluida la pagada sin turno) revive en la fecha nueva.
export async function cambiarFecha(slug: string, token: string, id: string, fecha: string, hora: string): Promise<ActionResult> {
  if (!verifyDoctorPortalToken(slug, token)) return { ok: false, error: 'No autorizado' }
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor || !slotValido(doctor, fecha, hora)) return { ok: false, error: 'Horario no disponible' }
  const ocupado = 'Ese horario ya fue reservado. Elige otro.'
  if ((await ocupadosEnGoogle(slug, [fecha], [hora])).includes(`${fecha}T${hora}`)) return { ok: false, error: ocupado }

  const supabase = createServiceClient()
  const { data: reserva } = await supabase
    .from('counseling_bookings')
    .select('id, doctor_slug, patient_name, modality, confirmed_at, payment_reported_at, cancelled_at, refund_pending, reschedule_count')
    .eq('id', id)
    .eq('doctor_slug', slug)
    .maybeSingle()
  if (!reserva) return { ok: false, error: 'No encontrado' }
  const revive = !!reserva.cancelled_at && reserva.refund_pending
  if (reserva.cancelled_at && !revive) return { ok: false, error: 'Reserva cancelada' }

  const { error } = await supabase
    .from('counseling_bookings')
    .update({
      slot_date: fecha, slot_time: hora, reschedule_count: (reserva.reschedule_count ?? 0) + 1,
      ...(revive ? { cancelled_at: null, cancel_reason: null, confirmed_at: new Date().toISOString(), refund_pending: false } : {}),
    })
    .eq('id', id)
  if (error?.code === '23505') return { ok: false, error: ocupado }
  if (error) return { ok: false, error: error.message }

  // Solo hay evento si el paciente avisó su pago o la reserva está confirmada.
  if (revive || reserva.confirmed_at || reserva.payment_reported_at) {
    await moverEvento({
      id, doctor_slug: slug, patient_name: reserva.patient_name, modality: reserva.modality, slot_date: fecha, slot_time: hora,
    }, revive || reserva.confirmed_at ? 'confirmed' : 'tentative')
  }
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
  await cancelarEvento({ id, doctor_slug: slug }).catch(() => {})
  revalidatePath(`/medicos/${slug}/reservas`)
  return { ok: true }
}
