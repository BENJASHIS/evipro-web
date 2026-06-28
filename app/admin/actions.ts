'use server'
import { createServiceClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function activateSubscription(formData: FormData) {
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

export async function confirmBooking(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = createServiceClient()
  await supabase
    .from('counseling_bookings')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/admin/consejeria')
}
