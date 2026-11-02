import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { bookingStatus } from '@/lib/bookings'
import type { MedioQR } from '@/lib/doctors'
import { leerReservaConPago } from '@/lib/pago-reserva'

const noEncontrado = () => NextResponse.json({ error: 'No encontrado' }, { status: 404 })

/**
 * QR de Yape o Plin del médico, solo para una reserva pendiente de pago o por verificar.
 * Las imágenes viven en el bucket privado `pagos-qr`: ninguna página pública las muestra.
 */
export async function GET(req: NextRequest) {
  const limit = checkRateLimit(req, { namespace: 'api:reservar-qr', limit: 60, windowMs: 60 * 1000 })
  if (!limit.ok) return rateLimitResponse(limit)

  const medio = req.nextUrl.searchParams.get('medio') as MedioQR | null
  const supabase = createServiceClient()
  const leida = await leerReservaConPago(supabase, req.nextUrl.searchParams.get('reserva'))
  const ruta = medio && leida?.doctor.pagoAlReservar?.qr[medio]
  if (!leida || !ruta) return noEncontrado()
  if (!['pending_payment', 'payment_to_verify'].includes(bookingStatus(leida.reserva))) return noEncontrado()

  const descarga = await supabase.storage.from('pagos-qr').download(ruta)
  if (descarga.error || !descarga.data) return noEncontrado()
  return new Response(descarga.data, {
    headers: {
      'Content-Type': descarga.data.type || 'image/png',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
