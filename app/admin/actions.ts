'use server'
import { createServiceClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function activateSubscription(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = createServiceClient()
  await supabase
    .from('subscriptions')
    .update({ status: 'active', starts_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/admin')
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
