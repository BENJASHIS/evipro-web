import { createServiceClient } from '@/lib/supabase-server'
import { DOCTORS } from '@/lib/doctors'
import { MODALITY_LABELS } from '@/lib/counseling'
import type { Modality } from '@/lib/counseling'
import { CONSULTA_MODALITY_LABELS, type ModalidadReserva } from '@/lib/consulta-pricing'
import { verifyDoctorPortalToken } from '@/lib/doctor-portal'
import { notFound } from 'next/navigation'
import { bookingStatus, type BookingState } from '@/lib/bookings'
import { CREDIT_STATUS_LABEL, CREDIT_VALID_DAYS, type CreditStatus } from '@/lib/credits'
import { BookingActions } from './BookingActions'
import { CreditActions } from './CreditActions'
import { GiftCreditButton } from './GiftCreditButton'

interface Booking {
  id: string
  user_id: string | null
  modality: Modality | ModalidadReserva
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
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
}

const STATUS_LABEL: Record<BookingState, { text: string; color: string }> = {
  cancelled:       { text: 'Cancelada',            color: 'text-faint line-through' },
  confirmed:       { text: 'Confirmada',           color: 'text-brand' },
  pending_confirm: { text: 'Pendiente confirmar',  color: 'text-yellow-400' },
  unpaid:          { text: 'Sin pago',             color: 'text-faint' },
}

const ALL_MODALITY_LABELS: Record<string, string> = { ...MODALITY_LABELS, ...CONSULTA_MODALITY_LABELS }
const MODALIDADES_CONSULTA = ['presencial', 'virtual', 'domicilio']

export default async function ReservasPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { slug } = await params
  const { token } = await searchParams
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) notFound()

  // Portal con datos de pacientes (PII): requiere token válido por médico.
  // notFound() (404) en vez de redirect para no revelar la existencia del portal.
  if (!verifyDoctorPortalToken(slug, token)) notFound()

  const supabase = createServiceClient()
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: upcoming } = await supabase
    .from('counseling_bookings')
    .select('*')
    .eq('doctor_slug', slug)
    .is('cancelled_at', null)
    .gte('slot_date', today)
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true })

  const { data: messagingPending } = await supabase
    .from('counseling_bookings')
    .select('*')
    .eq('doctor_slug', slug)
    // domicilio es una consulta sin horario fijo (slot_date null), igual que messaging/whatsapp:
    // no aparece en `upcoming` (que filtra por slot_date), así que debe listarse aquí.
    .in('modality', ['messaging', 'whatsapp', 'domicilio'])
    .is('confirmed_at', null)
    .is('cancelled_at', null)
    .gte('created_at', thirtyDaysAgo + 'T00:00:00Z')
    .order('created_at', { ascending: false })

  const { data: recent } = await supabase
    .from('counseling_bookings')
    .select('*')
    .eq('doctor_slug', slug)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: credits } = await supabase
    .from('consultation_credits')
    .select('id, code, member_name, status, created_at')
    .eq('minted_by_slug', slug)
    .order('created_at', { ascending: false })
    .limit(30)

  const allPending = [
    ...(upcoming ?? []),
    ...(messagingPending ?? []).filter(m =>
      !(upcoming ?? []).some(u => u.id === m.id)
    ),
  ] as Booking[]

  return (
    <main className="min-h-screen bg-ink text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-1">Portal médico</p>
        <h1 className="text-2xl font-light font-serif italic mb-1">{doctor.name}</h1>
        <p className="text-faint text-sm font-mono mb-10">CMP {doctor.cmp}</p>

        {/* Pendientes de atender */}
        <section className="mb-10">
          <p className="text-xs font-mono uppercase tracking-widest text-muted mb-4">
            Próximas / pendientes ({allPending.length})
          </p>

          {allPending.length === 0 && (
            <p className="text-faint text-sm font-mono">Sin reservas pendientes.</p>
          )}

          <div className="space-y-3">
            {allPending.map(b => {
              const status = STATUS_LABEL[bookingStatus(b)]
              const waMsg = encodeURIComponent(
                `Hola ${b.patient_name}, soy ${doctor.name} de EVIPro.\n` +
                `Confirmo tu ${MODALIDADES_CONSULTA.includes(b.modality) ? 'cita' : 'sesión de consejería'} (${ALL_MODALITY_LABELS[b.modality] ?? b.modality}).\n` +
                (b.slot_date ? `📅 ${b.slot_date} a las ${b.slot_time}\n` : '') +
                `Ref: ${b.id.slice(0, 8)}`
              )
              const waLink = `https://wa.me/51${b.patient_phone.replace(/\D/g, '')}?text=${waMsg}`

              return (
                <div key={b.id} className="border border-subtle rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-white text-sm font-medium">{b.patient_name}</p>
                        <span className={`text-xs font-mono ${status.color}`}>{status.text}</span>
                      </div>
                      <p className="text-muted text-xs font-mono mb-1">
                        {ALL_MODALITY_LABELS[b.modality] ?? b.modality}
                        {b.slot_date ? ` · ${b.slot_date} ${b.slot_time}` : ''}
                        {' · '}
                        {b.price_soles === 0 ? 'Gratis' : `S/. ${b.price_soles}`}
                        {b.is_first_session ? ' (1ra sesión)' : ''}
                      </p>
                      {b.patient_note && (
                        <p className="text-faint text-xs italic mt-1">&ldquo;{b.patient_note}&rdquo;</p>
                      )}
                      <p className="text-faint text-xs font-mono mt-1">📱 {b.patient_phone}</p>
                    </div>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-brand-deep hover:bg-brand-mid text-white text-xs font-mono px-3 py-1.5 rounded transition-colors"
                    >
                      Confirmar por WA →
                    </a>
                  </div>
                  <BookingActions slug={slug} token={token!} id={b.id} userId={b.user_id} memberName={b.patient_name} />
                </div>
              )
            })}
          </div>
        </section>

        {/* Créditos de consulta gratis */}
        <section className="mb-10">
          <p className="text-xs font-mono uppercase tracking-widest text-muted mb-1">
            Créditos de consulta gratis ({credits?.length ?? 0})
          </p>
          <p className="text-faint text-xs font-mono mb-4">
            Se acuñan con &ldquo;🎁 Dar consulta gratis&rdquo; en una reserva. Válidos ~{CREDIT_VALID_DAYS} días.
          </p>
          {!credits?.length ? (
            <p className="text-faint text-sm font-mono">Aún no has dado ninguna consulta gratis.</p>
          ) : (
            <div className="space-y-2">
              {credits.map(c => {
                const label = CREDIT_STATUS_LABEL[c.status as CreditStatus]
                return (
                  <div key={c.id} className="border border-subtle rounded-lg p-3 flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-mono text-brand">{c.code}</span>
                        {' · '}{c.member_name}
                      </p>
                      <p className="text-xs text-faint font-mono">
                        {new Date(c.created_at).toLocaleDateString('es-PE')} · <span className={label.color}>{label.text}</span>
                      </p>
                    </div>
                    {c.status === 'active' && <CreditActions slug={slug} token={token!} id={c.id} />}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Últimas 5 reservas */}
        {(recent ?? []).length > 0 && (
          <section>
            <p className="text-xs font-mono uppercase tracking-widest text-muted mb-4">
              Últimas reservas
            </p>
            <div className="space-y-2">
              {(recent as Booking[]).map(b => {
                const status = STATUS_LABEL[bookingStatus(b)]
                return (
                  <div className="flex items-center justify-between border-b border-subtle py-2 gap-4" key={b.id}>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{b.patient_name}</p>
                      <p className="text-xs text-faint font-mono">
                        {ALL_MODALITY_LABELS[b.modality] ?? b.modality}
                        {b.slot_date ? ` · ${b.slot_date}` : ''}
                        {' · '}
                        {b.price_soles === 0 ? 'Gratis' : `S/. ${b.price_soles}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-mono ${status.color}`}>{status.text}</span>
                      <GiftCreditButton slug={slug} token={token!} userId={b.user_id} memberName={b.patient_name} />
                    </div>
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
