'use server'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
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
  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)
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
