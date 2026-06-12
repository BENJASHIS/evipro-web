import { createClient } from '@supabase/supabase-js'
import { DOCTORS } from '@/lib/doctors'
import { MODALITY_LABELS } from '@/lib/counseling'
import type { Modality } from '@/lib/counseling'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Booking {
  id: string
  modality: Modality
  slot_date: string | null
  slot_time: string | null
  patient_name: string
  patient_phone: string
  patient_note: string | null
  is_first_session: boolean
  price_soles: number
  paid: boolean
  payment_method: string | null
  confirmed_at: string | null
  created_at: string
}

function statusLabel(b: Booking) {
  if (b.confirmed_at) return { text: 'Confirmada', color: 'text-[#7bc96f]' }
  if (b.paid || b.payment_method === 'free') return { text: 'Pendiente confirmar', color: 'text-yellow-400' }
  return { text: 'Sin pago', color: 'text-gray-500' }
}

export default async function ReservasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) notFound()

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: upcoming } = await supabase
    .from('counseling_bookings')
    .select('*')
    .eq('doctor_slug', slug)
    .gte('slot_date', today)
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true })

  const { data: messagingPending } = await supabase
    .from('counseling_bookings')
    .select('*')
    .eq('doctor_slug', slug)
    .in('modality', ['messaging', 'whatsapp'])
    .is('confirmed_at', null)
    .gte('created_at', thirtyDaysAgo + 'T00:00:00Z')
    .order('created_at', { ascending: false })

  const { data: recent } = await supabase
    .from('counseling_bookings')
    .select('*')
    .eq('doctor_slug', slug)
    .order('created_at', { ascending: false })
    .limit(5)

  const allPending = [
    ...(upcoming ?? []),
    ...(messagingPending ?? []).filter(m =>
      !(upcoming ?? []).some(u => u.id === m.id)
    ),
  ] as Booking[]

  return (
    <main className="min-h-screen bg-[#080a08] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-widest text-[#7bc96f] mb-1">Portal médico</p>
        <h1 className="text-2xl font-light font-serif italic mb-1">{doctor.name}</h1>
        <p className="text-gray-500 text-sm font-mono mb-10">CMP {doctor.cmp}</p>

        {/* Pendientes de atender */}
        <section className="mb-10">
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-4">
            Próximas / pendientes ({allPending.length})
          </p>

          {allPending.length === 0 && (
            <p className="text-gray-600 text-sm font-mono">Sin reservas pendientes.</p>
          )}

          <div className="space-y-3">
            {allPending.map(b => {
              const status = statusLabel(b)
              const waMsg = encodeURIComponent(
                `Hola ${b.patient_name}, soy ${doctor.name} de EVIPro.\n` +
                `Confirmo tu sesión de consejería (${MODALITY_LABELS[b.modality]}).\n` +
                (b.slot_date ? `📅 ${b.slot_date} a las ${b.slot_time}\n` : '') +
                `Ref: ${b.id.slice(0, 8)}`
              )
              const waLink = `https://wa.me/51${b.patient_phone.replace(/\D/g, '')}?text=${waMsg}`

              return (
                <div key={b.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-white text-sm font-medium">{b.patient_name}</p>
                        <span className={`text-xs font-mono ${status.color}`}>{status.text}</span>
                      </div>
                      <p className="text-gray-400 text-xs font-mono mb-1">
                        {MODALITY_LABELS[b.modality]}
                        {b.slot_date ? ` · ${b.slot_date} ${b.slot_time}` : ''}
                        {' · '}
                        {b.price_soles === 0 ? 'Gratis' : `S/. ${b.price_soles}`}
                        {b.is_first_session ? ' (1ra sesión)' : ''}
                      </p>
                      {b.patient_note && (
                        <p className="text-gray-500 text-xs italic mt-1">"{b.patient_note}"</p>
                      )}
                      <p className="text-gray-600 text-xs font-mono mt-1">📱 {b.patient_phone}</p>
                    </div>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-[#2d5a27] hover:bg-[#4a8c42] text-white text-xs font-mono px-3 py-1.5 rounded transition-colors"
                    >
                      Confirmar por WA →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Últimas 5 reservas */}
        {(recent ?? []).length > 0 && (
          <section>
            <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-4">
              Últimas reservas
            </p>
            <div className="space-y-2">
              {(recent as Booking[]).map(b => {
                const status = statusLabel(b)
                return (
                  <div key={b.id} className="flex items-center justify-between border-b border-white/5 py-2 gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{b.patient_name}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        {MODALITY_LABELS[b.modality]}
                        {b.slot_date ? ` · ${b.slot_date}` : ''}
                        {' · '}
                        {b.price_soles === 0 ? 'Gratis' : `S/. ${b.price_soles}`}
                      </p>
                    </div>
                    <span className={`text-xs font-mono shrink-0 ${status.color}`}>{status.text}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
