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
  const { data, error } = await supabase
    .from('counseling_bookings')
    .select('id')
    .eq('doctor_slug', doctor_slug)
    .eq('patient_phone', phone)
    .limit(1)

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ is_first: data.length === 0 })
}
