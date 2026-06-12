import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json() as { doctor_slug?: string; phone?: string }
  const { doctor_slug, phone } = body

  if (!doctor_slug || !phone) {
    return NextResponse.json({ error: 'Missing doctor_slug or phone' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Count free sessions used this month
  const { count: monthCount } = await supabase
    .from('counseling_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_slug', doctor_slug)
    .eq('patient_phone', phone)
    .eq('payment_method', 'free')
    .gte('created_at', monthStart)

  // Find first session ever to determine if still in first month
  const { data: firstSession } = await supabase
    .from('counseling_bookings')
    .select('created_at')
    .eq('doctor_slug', doctor_slug)
    .eq('patient_phone', phone)
    .order('created_at', { ascending: true })
    .limit(1)

  const firstSessionDate = firstSession?.[0]?.created_at
  const isFirstMonth = !firstSessionDate || new Date(firstSessionDate) >= new Date(monthStart)

  const freeLimit = isFirstMonth ? 2 : 1
  const is_first = (monthCount ?? 0) < freeLimit

  return NextResponse.json({ is_first })
}
