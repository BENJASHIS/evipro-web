import { getLocale } from '@/lib/locale-server'
import { translate } from '@/lib/i18n'
import { T } from '@/app/components/Language'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { bookingStatus, canPatientCancel, type BookingState } from '@/lib/bookings'
import { MODALITY_LABELS } from '@/lib/counseling'
import { precioConsulta, PRECIOS_CONSULTA, tarifaDe } from '@/lib/consulta-pricing'
import { canUseMemberTools } from '@/lib/member-access'
import { CitaActions } from './CitaActions'

// Los cuatro primeros son planes retirados: siguen aquí porque hay
// suscripciones vivas compradas con esos nombres y el miembro tiene que
// seguir leyendo el suyo.
const PLAN_NAMES: Record<string, string> = {
  basica:         'Membresía Básica',
  evipro:         'Membresía EVIPro',
  acceso:         'Membresía Básica',
  express:        'Plan Express',
  esencial:       'Plan Esencial',
  cannabis:       'Plan Cannabis',
  integral:       'Plan Integral',
  turista_inicio: 'Plan Turista Inicio',
  turista_plus:   'Plan Turista Plus',
}


const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:           { label: 'Activa',                  color: 'text-brand' },
  awaiting_payment: { label: 'Verificando pago',        color: 'text-yellow-400' },
  pending:          { label: 'Pendiente de activación', color: 'text-yellow-400' },
  past_due:         { label: 'Pago pendiente',          color: 'text-red-400' },
  cancelled:        { label: 'Cancelada',               color: 'text-faint' },
}

const CITA_ESTADO: Record<BookingState, { label: string; color: string }> = {
  cancelled:       { label: 'Cancelada',      color: 'text-faint' },
  confirmed:       { label: 'Confirmada',     color: 'text-brand' },
  payment_to_verify: { label: 'Pago por verificar', color: 'text-yellow-400' },
  pending_payment: { label: 'Pendiente de pago', color: 'text-faint' },
  pending_confirm: { label: 'Por confirmar',  color: 'text-yellow-400' },
  unpaid:          { label: 'Pago pendiente', color: 'text-faint' },
}

export default async function MiembrosPage() {
  const locale = await getLocale()
  const t = (source: string) => translate(locale, source)
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: subscription }, { data: citas }, { data: credits }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase
      .from('subscriptions')
      .select('id, status, period_end, membership_plans(type, period, price_soles, tickets_qty, includes_prescription, includes_renpuc_support, includes_pharmacy_coord)')
      .eq('user_id', user.id)
      .in('status', ['active', 'pending', 'awaiting_payment'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('counseling_bookings')
      .select('id, modality, slot_date, slot_time, confirmed_at, cancelled_at, cancel_reason, price_soles, paid, payment_method, pago_hasta, payment_reported_at')
      .eq('user_id', user.id)
      .order('slot_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('consultation_credits')
      .select('id, code, created_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
  ])

  const isAdmin = isAdminUser(user)
  const plan = subscription?.membership_plans as Record<string, unknown> | undefined
  const isActive = subscription?.status === 'active'
  const memberToolsEnabled = canUseMemberTools({
    hasActiveMembership: isActive,
    adminPreview: isAdmin && !isActive,
  })
  const planType = plan?.type as string | undefined

  const hasTickets = Number(plan?.tickets_qty ?? 0) > 0
  // Los precios salen de la escalera (fuente única), no de un porcentaje
  // guardado en la fila del plan sobre un 70/100 tecleado a mano.
  const tarifa = tarifaDe(planType)
  const virtualPrice = tarifa === 'regular' ? null : precioConsulta('virtual', tarifa, 1)
  const presencialPrice = tarifa === 'regular' ? null : precioConsulta('presencial', tarifa, 1)

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>Dashboard</T></p>
      <h1 className="text-3xl font-light font-serif italic mb-8">
        <T values={{ name: profile?.full_name?.split(' ')[0] ?? t('miembro') }}>{'Bienvenido, {name}'}</T>
      </h1>

      {/* Mis citas */}
      <section className="border border-subtle rounded-lg p-6 mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-muted mb-4"><T>Mis citas</T></p>
        {(!citas || citas.length === 0) && (
          <p className="text-faint text-sm font-mono"><T>Aún no tienes citas. Agenda con tu médico.</T></p>
        )}
        <div className="space-y-3">
          {(citas ?? []).map(c => {
            const estado = CITA_ESTADO[bookingStatus(c)]
            return (
              <div key={c.id} className="border-b border-subtle pb-3 last:border-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white text-sm"><T>{MODALITY_LABELS[c.modality as keyof typeof MODALITY_LABELS]}</T></span>
                  <span className={`text-xs font-mono ${estado.color}`}><T>{estado.label}</T></span>
                </div>
                <p className="text-faint text-xs font-mono mt-1">
                  {c.slot_date ? `${c.slot_date}${c.slot_time ? ' ' + c.slot_time : ''}` : t('Sin fecha fija')}
                  {c.price_soles === 0 ? ` · ${t('Gratis')}` : ` · S/. ${c.price_soles}`}
                </p>
                {c.cancelled_at && c.cancel_reason && (
                  <p className="text-faint text-xs italic mt-1"><T>Motivo:</T> {c.cancel_reason}</p>
                )}
                {canPatientCancel(c)
                  ? <CitaActions id={c.id} />
                  : !c.cancelled_at && (!c.slot_date || c.slot_date >= new Date().toISOString().slice(0, 10)) && (
                    <p className="text-faint text-xs mt-1"><T>Para cancelar o cambiar la fecha, escríbenos por WhatsApp.</T></p>
                  )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Consultas gratis (perk de fidelidad) */}
      {(credits ?? []).length > 0 && (
        <section className="border border-brand/30 rounded-lg p-6 mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>🎁 Consulta gratis</T></p>
          <p className="text-sm text-white mb-3">
            <T values={{ count: credits!.length }}>{credits!.length === 1 ? 'Tienes una consulta gratis. Usa el código al reservar, o compártelo con quien lo necesite.' : 'Tienes {count} consultas gratis. Usa el código al reservar, o compártelo con quien lo necesite.'}</T>
          </p>
          <div className="flex flex-wrap gap-2">
            {credits!.map(c => (
              <span key={c.id} className="text-sm font-mono px-3 py-1.5 rounded border border-brand bg-brand/10 text-brand">
                {c.code}
              </span>
            ))}
          </div>
        </section>
      )}

      {!subscription && !isAdmin ? (
        <div className="border border-subtle rounded-lg p-8 text-center">
          <p className="text-muted mb-4"><T>No tienes una membresía activa.</T></p>
          <Link href="/planes" className="bg-brand-deep hover:bg-brand-mid text-white px-6 py-2 rounded font-mono text-sm transition-colors">
            <T>Ver planes →</T>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">

          {/* Modo admin: vista previa sin membresía */}
          {isAdmin && !isActive && (
            <div className="border border-brand/30 bg-brand/5 rounded-lg p-4">
              <p className="text-brand text-sm">
                <T>Modo admin · vista previa del área de miembro (sin membresía activa).</T>
              </p>
            </div>
          )}

          {/* Estado de membresía */}
          {subscription && (
          <div className="border border-subtle rounded-lg p-6">
            <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3"><T>Tu membresía</T></p>
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
              <h2 className="text-xl font-light"><T>{PLAN_NAMES[planType ?? ''] ?? 'Plan'}</T></h2>
              <span className={`text-sm font-mono ${STATUS_LABELS[subscription.status]?.color ?? 'text-white'}`}>
                <T>{STATUS_LABELS[subscription.status]?.label ?? subscription.status}</T>
              </span>
            </div>
            {!isActive && (
              <p className="text-xs text-yellow-400 font-mono mt-2">
                <T>Tu pago fue recibido. El equipo EVIPro activará tu cuenta en breve.</T>
              </p>
            )}
            {subscription.period_end && (
              <p className="text-xs text-faint mt-2 font-mono">
                <T>Vence el:</T> {new Date(subscription.period_end).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-PE')}
              </p>
            )}
          </div>
          )}

          {/* Beneficios */}
          {plan && isActive && (
            <div className="border border-subtle rounded-lg p-6">
              <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3"><T>Tus beneficios</T></p>
              <ul className="space-y-2 text-sm text-gray-300">
                {virtualPrice !== null && (
                  <li><T>✓ Consulta virtual de seguimiento:</T>
                    <span className="text-white font-light ml-1">S/. {virtualPrice}</span>
                    <span className="text-faint line-through ml-2 text-xs">S/. {PRECIOS_CONSULTA.virtual.regular[0]}</span>
                  </li>
                )}
                {presencialPrice !== null && (
                  <li><T>✓ Consulta presencial:</T>
                    <span className="text-white font-light ml-1">S/. {presencialPrice}</span>
                    <span className="text-faint line-through ml-2 text-xs">S/. {PRECIOS_CONSULTA.presencial.regular[0]}</span>
                  </li>
                )}
                {Boolean(plan.includes_prescription) && <li><T>✓ Receta si corresponde</T></li>}
                {Boolean(plan.includes_renpuc_support) && <li><T>✓ Apoyo con registro RENPUC</T></li>}
                {Boolean(plan.includes_pharmacy_coord) && <li><T>✓ Coordinación documentaria con farmacia autorizada</T></li>}
                {hasTickets && (
                  <li>✓ <span className="text-yellow-400"><T values={{ count: Number(plan.tickets_qty) }}>{Number(plan.tickets_qty) === 1 ? '{count} ticket de sorteo por periodo' : '{count} tickets de sorteo por periodo'}</T></span></li>
                )}
              </ul>
            </div>
          )}

          {memberToolsEnabled && (
            <Link
              href="/miembros/herramientas"
              className="block border border-brand/30 bg-brand/5 rounded-lg p-6 hover:border-brand/60 transition-colors group"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>Herramientas</T></p>
              <p className="text-sm text-white group-hover:text-brand transition-colors"><T>Panel de herramientas para miembros</T></p>
              <p className="text-xs text-faint font-mono mt-1">
                <T>Regen y calculadora cannabinoide disponibles para miembros activos.</T>
              </p>
            </Link>
          )}

          {/* Accesos rápidos */}
          {memberToolsEnabled && (
            <div className="border border-subtle rounded-lg p-6">
              <p className="text-xs font-mono text-faint uppercase tracking-widest mb-4"><T>Accesos rápidos</T></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/aliados"
                  className="flex items-center gap-3 p-4 border border-subtle rounded hover:border-brand/50 transition-colors group"
                >
                  <span className="text-2xl">🤝</span>
                  <div>
                    <p className="text-sm text-white group-hover:text-brand transition-colors"><T>Aliados</T></p>
                    <p className="text-xs text-faint font-mono"><T>Farmacia y centro aliados</T></p>
                  </div>
                </Link>
                <a
                  href="https://wa.me/51942185939"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-subtle rounded hover:border-brand/50 transition-colors group"
                >
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="text-sm text-white group-hover:text-brand transition-colors"><T>WhatsApp EVIPro</T></p>
                    <p className="text-xs text-faint font-mono">942 185 939</p>
                  </div>
                </a>
                <Link
                  href="/medicos"
                  className="flex items-center gap-3 p-4 border border-subtle rounded hover:border-brand/50 transition-colors group"
                >
                  <span className="text-2xl">👨‍⚕️</span>
                  <div>
                    <p className="text-sm text-white group-hover:text-brand transition-colors"><T>Equipo médico</T></p>
                    <p className="text-xs text-faint font-mono"><T>Ver perfiles</T></p>
                  </div>
                </Link>
                <a
                  href="mailto:consulta@evipro.pe"
                  className="flex items-center gap-3 p-4 border border-subtle rounded hover:border-brand/50 transition-colors group"
                >
                  <span className="text-2xl">✉️</span>
                  <div>
                    <p className="text-sm text-white group-hover:text-brand transition-colors"><T>Soporte</T></p>
                    <p className="text-xs text-faint font-mono">consulta@evipro.pe</p>
                  </div>
                </a>
                <Link
                  href="/miembros/mensajes?sugerir=1"
                  className="flex items-center gap-3 p-4 border border-subtle rounded hover:border-brand/50 transition-colors group"
                >
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-sm text-white group-hover:text-brand transition-colors"><T>¿Qué contenido te gustaría? Pídelo →</T></p>
                    <p className="text-xs text-faint font-mono"><T>Sugerir vía mensajería</T></p>
                  </div>
                </Link>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
