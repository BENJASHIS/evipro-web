import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import type { ContentMinPlan } from '@/lib/types'

const TYPE_LABELS = { article: 'Artículo', video: 'Video', guide: 'Guía' }
const TYPE_ICONS  = { article: '📄', video: '🎥', guide: '📋' }

const PLAN_NAMES: Record<string, string> = {
  express:        'Plan Express',
  esencial:       'Plan Esencial',
  cannabis:       'Plan Cannabis',
  integral:       'Plan Integral',
  turista_inicio: 'Plan Turista Inicio',
  turista_plus:   'Plan Turista Plus',
}

// Jerarquía: null/express < cannabis < integral
const PLAN_LEVEL: Record<string, number> = {
  express: 1, esencial: 1, turista_inicio: 1, turista_plus: 1,
  cannabis: 2,
  integral: 3,
}

const MIN_PLAN_LEVEL: Record<ContentMinPlan, number> = {
  express: 1, cannabis: 2, integral: 3,
}

function canAccess(userPlan: string | undefined, minPlan: ContentMinPlan | null): boolean {
  if (!minPlan) return true
  const userLevel = PLAN_LEVEL[userPlan ?? ''] ?? 0
  return userLevel >= MIN_PLAN_LEVEL[minPlan]
}

export default async function ContenidoPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: items }, { data: subscription }] = await Promise.all([
    supabase
      .from('content')
      .select('*')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('*, membership_plans(type)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
  ])

  const planType = (subscription?.membership_plans as Record<string, string> | null)?.type

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2">Biblioteca</p>
      <h1 className="text-3xl font-light font-serif italic mb-2">Contenido exclusivo</h1>
      {planType && (
        <p className="text-xs font-mono text-faint mb-8">
          Tu plan: <span className="text-white">{PLAN_NAMES[planType] ?? planType}</span>
        </p>
      )}

      {!items?.length ? (
        <div className="border border-subtle rounded-lg p-8 text-center">
          <p className="text-muted text-sm">
            Próximamente — estamos preparando contenido exclusivo para miembros.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map(item => {
            const accessible = canAccess(planType, item.min_plan as ContentMinPlan | null)
            const reqPlan    = item.min_plan ? PLAN_NAMES[item.min_plan] ?? item.min_plan : null

            return (
              <div key={item.id}
                className={`border rounded-lg p-6 transition-colors ${
                  accessible
                    ? 'border-subtle hover:border-strong'
                    : 'border-subtle opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TYPE_ICONS[item.content_type as keyof typeof TYPE_ICONS]}</span>
                    <span className="text-xs font-mono text-faint uppercase tracking-widest">
                      {TYPE_LABELS[item.content_type as keyof typeof TYPE_LABELS]}
                    </span>
                  </div>
                  {reqPlan && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded border border-subtle text-faint">
                      {reqPlan}
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-light mb-2">{item.title}</h2>

                {accessible ? (
                  <>
                    <p className="text-muted text-sm leading-relaxed">{item.body}</p>
                    <p className="text-xs text-faint font-mono mt-4">
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString('es-PE')
                        : ''}
                    </p>
                  </>
                ) : (
                  <div className="relative">
                    <p className="text-faint text-sm leading-relaxed blur-sm select-none">
                      {item.body?.slice(0, 120)}...
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs text-yellow-400 font-mono">
                        🔒 Requiere {reqPlan}
                      </span>
                      <a href="/planes"
                        className="text-xs font-mono text-brand hover:underline">
                        Actualizar plan →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
