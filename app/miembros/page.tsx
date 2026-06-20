import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const PLAN_NAMES: Record<string, string> = {
  express:        'Plan Express',
  esencial:       'Plan Esencial',
  cannabis:       'Plan Cannabis',
  integral:       'Plan Integral',
  turista_inicio: 'Plan Turista Inicio',
  turista_plus:   'Plan Turista Plus',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: 'Activa',                  color: 'text-brand' },
  pending:   { label: 'Pendiente de activación', color: 'text-yellow-400' },
  past_due:  { label: 'Pago pendiente',          color: 'text-red-400' },
  cancelled: { label: 'Cancelada',               color: 'text-faint' },
}

export default async function MiembrosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('subscriptions')
      .select('*, membership_plans(*)')
      .eq('user_id', user.id)
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const isAdmin = isAdminUser(user)
  const plan = subscription?.membership_plans as Record<string, unknown> | undefined
  const isActive = subscription?.status === 'active'
  const planType = plan?.type as string | undefined

  const hasCannabisEmergency = planType === 'cannabis' || planType === 'integral'
  const hasTickets = Number(plan?.tickets_qty ?? 0) > 0
  const virtualPrice = Number(plan?.discount_virtual_pct ?? 0) > 0
    ? Math.round(70 * (1 - Number(plan!.discount_virtual_pct) / 100))
    : null
  const presencialPrice = Number(plan?.discount_presencial_pct ?? 0) > 0
    ? Math.round(100 * (1 - Number(plan!.discount_presencial_pct) / 100))
    : null

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2">Dashboard</p>
      <h1 className="text-3xl font-light font-serif italic mb-8">
        Bienvenido, {profile?.full_name?.split(' ')[0] ?? 'miembro'}
      </h1>

      {!subscription && !isAdmin ? (
        <div className="border border-subtle rounded-lg p-8 text-center">
          <p className="text-muted mb-4">No tienes una membresía activa.</p>
          <Link href="/planes" className="bg-brand-deep hover:bg-brand-mid text-white px-6 py-2 rounded font-mono text-sm transition-colors">
            Ver planes →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">

          {/* Modo admin: vista previa sin membresía */}
          {isAdmin && !isActive && (
            <div className="border border-brand/30 bg-brand/5 rounded-lg p-4">
              <p className="text-brand text-sm">
                Modo admin · vista previa del área de miembro (sin membresía activa).
              </p>
            </div>
          )}

          {/* Estado de membresía */}
          {subscription && (
          <div className="border border-subtle rounded-lg p-6">
            <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3">Tu membresía</p>
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
              <h2 className="text-xl font-light">{PLAN_NAMES[planType ?? ''] ?? 'Plan'}</h2>
              <span className={`text-sm font-mono ${STATUS_LABELS[subscription.status]?.color ?? 'text-white'}`}>
                {STATUS_LABELS[subscription.status]?.label ?? subscription.status}
              </span>
            </div>
            {!isActive && (
              <p className="text-xs text-yellow-400 font-mono mt-2">
                Tu pago fue recibido. El equipo EVIPro activará tu cuenta en breve.
              </p>
            )}
            {subscription.period_end && (
              <p className="text-xs text-faint mt-2 font-mono">
                Próximo cobro: {new Date(subscription.period_end).toLocaleDateString('es-PE')}
              </p>
            )}
          </div>
          )}

          {/* Beneficios */}
          {plan && isActive && (
            <div className="border border-subtle rounded-lg p-6">
              <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3">Tus beneficios</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {virtualPrice !== null && (
                  <li>✓ Consulta virtual de seguimiento:
                    <span className="text-white font-light ml-1">S/. {virtualPrice}</span>
                    <span className="text-faint line-through ml-2 text-xs">S/. 70</span>
                  </li>
                )}
                {presencialPrice !== null && (
                  <li>✓ Consulta presencial:
                    <span className="text-white font-light ml-1">S/. {presencialPrice}</span>
                    <span className="text-faint line-through ml-2 text-xs">S/. 100</span>
                  </li>
                )}
                {Boolean(plan.includes_prescription) && <li>✓ Receta digital incluida</li>}
                {Boolean(plan.includes_renpuc_support) && <li>✓ Apoyo con registro RENPUC</li>}
                {Boolean(plan.includes_pharmacy_coord) && <li>✓ Coordinación con farmacia magistral</li>}
                {hasCannabisEmergency && <li>✓ Prioridad en emergencias cannábicas 24/7</li>}
                {hasTickets && (
                  <li>✓ <span className="text-yellow-400">{Number(plan.tickets_qty)} ticket{Number(plan.tickets_qty) > 1 ? 's' : ''} de sorteo por periodo</span></li>
                )}
              </ul>
            </div>
          )}

          {/* Accesos rápidos */}
          {(isActive || isAdmin) && (
            <div className="border border-subtle rounded-lg p-6">
              <p className="text-xs font-mono text-faint uppercase tracking-widest mb-4">Accesos rápidos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/consejeria"
                  className="flex items-center gap-3 p-4 border border-subtle rounded hover:border-brand/50 transition-colors group"
                >
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="text-sm text-white group-hover:text-brand transition-colors">Consejería médica</p>
                    <p className="text-xs text-faint font-mono">Agenda una sesión</p>
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
                    <p className="text-sm text-white group-hover:text-brand transition-colors">WhatsApp EVIPro</p>
                    <p className="text-xs text-faint font-mono">942 185 939</p>
                  </div>
                </a>
                <Link
                  href="/medicos"
                  className="flex items-center gap-3 p-4 border border-subtle rounded hover:border-brand/50 transition-colors group"
                >
                  <span className="text-2xl">👨‍⚕️</span>
                  <div>
                    <p className="text-sm text-white group-hover:text-brand transition-colors">Equipo médico</p>
                    <p className="text-xs text-faint font-mono">Ver perfiles</p>
                  </div>
                </Link>
                <a
                  href="mailto:consulta@evipro.pe"
                  className="flex items-center gap-3 p-4 border border-subtle rounded hover:border-brand/50 transition-colors group"
                >
                  <span className="text-2xl">✉️</span>
                  <div>
                    <p className="text-sm text-white group-hover:text-brand transition-colors">Soporte</p>
                    <p className="text-xs text-faint font-mono">consulta@evipro.pe</p>
                  </div>
                </a>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
