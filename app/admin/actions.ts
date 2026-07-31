'use server'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
import { computePeriodEnd } from '@/lib/billing'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Las server actions se exponen como endpoints POST y NO heredan el gate de
// app/admin/layout.tsx. Cada una debe verificar admin por su cuenta.
async function requireAdmin() {
  const { data: { user } } = await (await createServerSupabaseClient()).auth.getUser()
  if (!isAdminUser(user)) throw new Error('No autorizado')
}

export async function activateSubscription(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const nombre = (formData.get('nombre') as string) || 'Suscriptor'
  const supabase = createServiceClient()
  const { data: subRow } = await supabase
    .from('subscriptions')
    .select('membership_plans(period)')
    .eq('id', id)
    .single()
  const planRow = (Array.isArray(subRow?.membership_plans) ? subRow?.membership_plans[0] : subRow?.membership_plans) as { period: import('@/lib/types').PlanPeriod } | null
  const now = new Date()
  const periodEnd = computePeriodEnd(planRow?.period ?? 'mensual', now)
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      started_at: now.toISOString(),
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(`No se pudo activar: ${error.message}`)
  revalidatePath('/admin')
  redirect(`/admin?ok=${encodeURIComponent(nombre)}`)
}

export async function dismissSubscription(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const nombre = (formData.get('nombre') as string) || 'Suscriptor'
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', id)
  if (error) throw new Error(`No se pudo descartar: ${error.message}`)
  revalidatePath('/admin')
  redirect(`/admin?dismissed=${encodeURIComponent(nombre)}`)
}

export async function confirmBooking(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const supabase = createServiceClient()
  await supabase
    .from('counseling_bookings')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/admin/consejeria')
}

const ESTADOS_PROPUESTA = ['nueva', 'contestada', 'archivada'] as const

export async function cambiarEstadoPropuesta(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  if (!ESTADOS_PROPUESTA.includes(status as typeof ESTADOS_PROPUESTA[number])) {
    throw new Error('Estado invalido')
  }
  const { error } = await createServiceClient()
    .from('partnership_proposals')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(`No se pudo actualizar: ${error.message}`)
  revalidatePath('/admin/propuestas')
}


const ESTADOS_FARMACIA = ['pending', 'coordinated', 'shipped', 'delivered'] as const

/** Avanza una solicitud de farmacia y guarda el número de guía de Shalom.
 *
 *  La guía es un código del courier, no un dato clínico: se teclea aquí y el
 *  paciente lo ve para rastrear en la web de Shalom. No hay integración con
 *  terceros a propósito — no sale ningún dato del paciente hacia afuera. */
export async function actualizarSolicitudFarmacia(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const guia = ((formData.get('tracking_info') as string) || '').trim()

  if (!ESTADOS_FARMACIA.includes(status as typeof ESTADOS_FARMACIA[number])) {
    throw new Error('Estado invalido')
  }
  if (guia.length > 60) throw new Error('Numero de guia demasiado largo')

  const { error } = await createServiceClient()
    .from('pharmacy_requests')
    .update({
      status,
      tracking_info: guia || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(`No se pudo actualizar: ${error.message}`)
  revalidatePath('/admin')
}
