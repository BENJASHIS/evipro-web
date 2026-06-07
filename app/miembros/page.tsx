import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const PLAN_NAMES: Record<string, string> = {
  express: 'Plan Express', cannabis: 'Plan Cannabis', integral: 'Plan Integral'
}
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: 'Activa',                   color: 'text-[#7bc96f]' },
  pending:   { label: 'Pendiente de activación',  color: 'text-yellow-400' },
  past_due:  { label: 'Pago pendiente',           color: 'text-red-400' },
  cancelled: { label: 'Cancelada',                color: 'text-gray-500' },
}

export default async function MiembrosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*, membership_plans(*)').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
  ])

  const plan = subscription?.membership_plans as Record<string, unknown> | undefined

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-[#7bc96f] mb-2">Dashboard</p>
      <h1 className="text-3xl font-light font-serif italic mb-8">
        Bienvenido, {profile?.full_name?.split(' ')[0] ?? 'miembro'}
      </h1>

      {!subscription ? (
        <div className="border border-white/10 rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-4">No tienes una membresía activa.</p>
          <Link href="/planes" className="text-[#7bc96f] underline text-sm">Ver planes →</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="border border-white/10 rounded-lg p-6">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Tu membresía</p>
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <h2 className="text-xl font-light">{PLAN_NAMES[plan?.type as string] ?? 'Plan'}</h2>
              <span className={`text-sm font-mono ${STATUS_LABELS[subscription.status]?.color ?? 'text-white'}`}>
                {STATUS_LABELS[subscription.status]?.label ?? subscription.status}
              </span>
            </div>
            {subscription.period_end && (
              <p className="text-xs text-gray-500 mt-2 font-mono">
                Próximo cobro: {new Date(subscription.period_end).toLocaleDateString('es-PE')}
              </p>
            )}
          </div>

          {plan && (
            <div className="border border-white/10 rounded-lg p-6">
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Tus beneficios</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {Number(plan.discount_virtual_pct) > 0 && (
                  <li>✓ Consulta virtual: <span className="text-white font-light">
                    S/. {Math.round(70 * (1 - Number(plan.discount_virtual_pct) / 100))}
                    <span className="text-gray-500 line-through ml-2">S/. 70</span>
                  </span></li>
                )}
                {Number(plan.discount_presencial_pct) > 0 && (
                  <li>✓ Consulta presencial: <span className="text-white font-light">
                    S/. {Math.round(100 * (1 - Number(plan.discount_presencial_pct) / 100))}
                    <span className="text-gray-500 line-through ml-2">S/. 100</span>
                  </span></li>
                )}
                {Boolean(plan.includes_prescription) && <li>✓ Receta digital incluida</li>}
                {Boolean(plan.includes_renpuc_support) && <li>✓ Apoyo con registro RENPUC</li>}
                {Boolean(plan.includes_pharmacy_coord) && <li>✓ Coordinación con farmacia magistral</li>}
                <li>✓ Prioridad en emergencias cannábicas 24/7</li>
              </ul>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
