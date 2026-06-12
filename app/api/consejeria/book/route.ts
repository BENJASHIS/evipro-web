import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Modality } from '@/lib/counseling'

interface BookingBody {
  doctor_slug: string
  modality: Modality
  slot_date?: string | null
  slot_time?: string | null
  patient_name: string
  patient_phone: string
  patient_note?: string | null
  is_first_session: boolean
  price_soles: number
  paid: boolean
  payment_method: 'culqi' | 'yape' | 'free'
  culqi_order_id?: string | null
}

export async function POST(req: NextRequest) {
  const body = await req.json() as BookingBody
  const { doctor_slug, modality, patient_name, patient_phone, is_first_session, price_soles, paid, payment_method } = body

  if (!doctor_slug || !modality || !patient_name || !patient_phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('counseling_bookings')
    .insert({
      doctor_slug,
      modality,
      slot_date: body.slot_date ?? null,
      slot_time: body.slot_time ?? null,
      patient_name,
      patient_phone,
      patient_note: body.patient_note ?? null,
      is_first_session,
      price_soles,
      paid,
      payment_method,
      culqi_order_id: body.culqi_order_id ?? null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ booking_id: data.id })
}
