import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const doctorSlug = searchParams.get('doctor_slug')

  if (!doctorSlug) {
    return NextResponse.json({ error: 'doctor_slug required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('counseling_bookings')
    .select('slot_date, slot_time')
    .eq('doctor_slug', doctorSlug)
    .eq('modality', 'video')
    .gte('slot_date', today)
    .not('slot_date', 'is', null)
    .not('slot_time', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const booked = (data ?? []).map(r => `${r.slot_date}T${r.slot_time}`)
  return NextResponse.json({ booked })
}
