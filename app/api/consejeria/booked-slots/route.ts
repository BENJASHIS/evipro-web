import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { DOCTORS } from '@/lib/doctors'
import { agendaDe } from '@/lib/booking-validation'
import { fechasDesde, hoyEnLima, ocupadosEnGoogle } from '@/lib/google-calendar'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

// Cubre de sobra los 7 días de atención que ofrece el formulario (mar–vie ≈ 2 semanas).
const DIAS_GOOGLE = 21

export async function GET(request: Request) {
  // Cada consulta llama a Google: el límite evita que alguien agote la cuota.
  const limit = checkRateLimit(request, { namespace: 'api:booked-slots', limit: 30, windowMs: 60_000 })
  if (!limit.ok) return rateLimitResponse(limit)

  const { searchParams } = new URL(request.url)
  const doctorSlug = searchParams.get('doctor_slug')
  const doctor = DOCTORS.find(d => d.slug === doctorSlug)

  if (!doctorSlug || !doctor) {
    return NextResponse.json({ error: 'doctor_slug required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const today = new Date().toISOString().split('T')[0]

  const [{ data, error }, enGoogle] = await Promise.all([
    supabase
      .from('counseling_bookings')
      .select('slot_date, slot_time')
      .eq('doctor_slug', doctorSlug)
      .gte('slot_date', today)
      .not('slot_date', 'is', null)
      .not('slot_time', 'is', null)
      // Cancelar libera el turno (índice parcial de la migración 024).
      .is('cancelled_at', null),
    ocupadosEnGoogle(doctorSlug, fechasDesde(hoyEnLima(), DIAS_GOOGLE), agendaDe(doctor).schedule),
  ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // slot_time es `time` (HH:MM:SS); el formulario compara con HH:MM.
  const booked = new Set([...(data ?? []).map(r => `${r.slot_date}T${String(r.slot_time).slice(0, 5)}`), ...enGoogle])
  return NextResponse.json({ booked: [...booked] })
}
