import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase-server'
import { precioReferencia, type ModalidadReserva } from '@/lib/consulta-pricing'
import { validateBookingInput } from '@/lib/booking-validation'

interface ReservaBody {
  doctor_slug: string
  modality: ModalidadReserva
  slot_date?: string | null
  slot_time?: string | null
  patient_name: string
  patient_phone: string
  patient_note?: string | null
}

const MODALIDADES: ModalidadReserva[] = ['presencial', 'virtual', 'domicilio']

export async function POST(req: NextRequest) {
  const body = await req.json() as ReservaBody
  const { doctor_slug, modality, patient_name, patient_phone } = body

  if (!modality || !MODALIDADES.includes(modality)) {
    return NextResponse.json({ error: 'Modalidad inválida' }, { status: 400 })
  }
  const invalid = validateBookingInput({ doctor_slug, patient_name, patient_phone, patient_note: body.patient_note })
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })

  // Frontera de confianza: el precio se DERIVA en el servidor (nominal de referencia).
  // Cobro manual: paid=false, payment_method='manual' — el médico cobra y aplica la escalera.
  const price_soles = precioReferencia(modality)

  const supabase = createServiceClient()
  const authClient = await createServerSupabaseClient()
  const { data: { user } } = await authClient.auth.getUser()

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
      is_first_session: true,
      price_soles,
      paid: false,
      payment_method: 'manual',
      user_id: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[reservar/book] db error:', error.message)
    return NextResponse.json({ error: 'No se pudo guardar la solicitud' }, { status: 500 })
  }
  return NextResponse.json({ booking_id: data.id })
}
