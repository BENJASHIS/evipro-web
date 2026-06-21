import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { Modality } from '@/lib/counseling'
import { MODALITY_LABELS } from '@/lib/counseling'
import { createMPPreference, describeMPError } from '@/lib/mercadopago'

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
  payment_method: 'mercadopago' | 'yape' | 'free'
  mp_preference_id?: string | null
}

export async function POST(req: NextRequest) {
  const body = await req.json() as BookingBody
  const { doctor_slug, modality, patient_name, patient_phone, is_first_session, price_soles, paid, payment_method } = body

  if (!doctor_slug || !modality || !patient_name || !patient_phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Acceso server-side con service-role: counseling_bookings tiene RLS activado
  // y deny-by-default; solo el service-role (o un admin autenticado) puede escribir.
  const supabase = createServiceClient()

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
      mp_preference_id: body.mp_preference_id ?? null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
  }

  const booking_id: string = data.id

  // For paid bookings via Mercado Pago, create preference and return init_point
  if (payment_method === 'mercadopago' && price_soles > 0) {
    try {
      const pref = await createMPPreference({
        items: [{
          title: `EVIPro Consejería · ${MODALITY_LABELS[modality]}`,
          unit_price: price_soles,
          quantity: 1,
        }],
        payer_email: 'paciente@evipro.pe',
        external_reference: `consejeria:${booking_id}`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/consejeria/pago-ok?booking=${booking_id}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/consejeria/pago-error?booking=${booking_id}`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/consejeria/pago-pendiente?booking=${booking_id}`,
        },
        metadata: { booking_id, doctor_slug, modality },
      })

      const preference_id = pref.id ?? ''
      const init_point = pref.init_point ?? ''

      if (preference_id) {
        await supabase
          .from('counseling_bookings')
          .update({ mp_preference_id: preference_id })
          .eq('id', booking_id)
      }

      return NextResponse.json({ booking_id, init_point, preference_id })
    } catch (err) {
      const msg = describeMPError(err)
      console.error('[consejeria/book] error creando preferencia:', JSON.stringify(err), msg)
      return NextResponse.json({ error: 'Error creando preferencia de pago: ' + msg }, { status: 500 })
    }
  }

  return NextResponse.json({ booking_id })
}
