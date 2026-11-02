import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { bookingStatus } from '@/lib/bookings'
import { createMPPreference, describeMPError } from '@/lib/mercadopago'
import { CONSULTA_MODALITY_LABELS, type ModalidadReserva } from '@/lib/consulta-pricing'
import { leerReservaConPago } from '@/lib/pago-reserva'

/** Pago con tarjeta para pacientes del extranjero. En Perú se paga por Yape o Plin directo. */
export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req, { namespace: 'api:reservar-mp', limit: 10, windowMs: 10 * 60 * 1000 })
  if (!limit.ok) return rateLimitResponse(limit)

  let body: { reserva?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }
  const leida = await leerReservaConPago(createServiceClient(), body.reserva ?? null)
  if (!leida) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  const { reserva: r } = leida
  if (bookingStatus(r) !== 'pending_payment') {
    return NextResponse.json({ error: 'La reserva ya no está pendiente de pago' }, { status: 409 })
  }

  const vuelta = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/medicos/${r.doctor_slug}/agendar?reserva=${r.id}`
  try {
    const pref = await createMPPreference({
      items: [{
        title: `EVIPro · Consulta ${CONSULTA_MODALITY_LABELS[r.modality as ModalidadReserva] ?? r.modality}`,
        unit_price: r.price_soles,
        quantity: 1,
      }],
      payer_email: 'paciente@evipro.pe',
      external_reference: `reserva:${r.id}`,
      back_urls: { success: vuelta, failure: vuelta, pending: vuelta },
      metadata: { booking_id: r.id, doctor_slug: r.doctor_slug },
    })
    return NextResponse.json({ init_point: pref.init_point ?? '' })
  } catch (err) {
    console.error('[reservar/mercadopago] error creando preferencia:', describeMPError(err))
    return NextResponse.json({ error: 'No se pudo abrir el pago con tarjeta' }, { status: 500 })
  }
}
