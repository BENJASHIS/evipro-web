'use client'
import { useMemo, useState } from 'react'
import type { MembershipPlan, PlanAddon, PlanPeriod } from '@/lib/types'
import { PERIOD_LABELS } from '@/lib/types'
import { computeCartTotal } from '@/lib/billing'
import PlanCTA from './PlanCTA'

const PERIODS: PlanPeriod[] = ['mensual', 'trimestral', 'semestral']

/** `plans` = solo filas EVIPro (una por período). `addons` = módulos activos. */
export default function ConfiguradorEvipro({ plans, addons }: { plans: MembershipPlan[]; addons: PlanAddon[] }) {
  const [period, setPeriod] = useState<PlanPeriod>('mensual')
  const [selected, setSelected] = useState<Set<string>>(new Set()) // addon slugs

  const plan = useMemo(() => plans.find(p => p.period === period), [plans, period])
  const periodAddons = useMemo(() => addons.filter(a => a.period === period), [addons, period])
  const chosenAddons = periodAddons.filter(a => selected.has(a.slug))
  const total = computeCartTotal(
    Number(plan?.price_soles ?? 0),
    chosenAddons.map(a => Number(a.price_soles)),
  )
  const addonIds = chosenAddons.map(a => a.id).join(',')

  function toggle(slug: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  return (
    <div className="border border-brand/40 rounded-lg p-6 bg-white/[0.02]">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-2xl font-light">Membresía EVIPro</h2>
        <span className="text-xs font-mono text-brand uppercase tracking-widest">Recomendado</span>
      </div>
      <p className="text-muted text-sm mb-6">Descuentos de consulta, receta, RENPUC y contenido. Suma los especialistas que necesites.</p>

      {/* Duración */}
      <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3">1 · Duración</p>
      <div className="flex flex-wrap gap-3 mb-6">
        {PERIODS.map(p => {
          if (!plans.some(pl => pl.period === p)) return null
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`border rounded px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${period === p ? 'border-brand text-white' : 'border-subtle text-muted hover:border-white/40'}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          )
        })}
      </div>

      {/* Módulos */}
      {periodAddons.length > 0 && (
        <>
          <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3">2 · Especialistas (opcional)</p>
          <div className="grid gap-3 mb-6">
            {periodAddons.map(a => (
              <label key={a.id} className="flex items-center justify-between border border-subtle rounded p-3 cursor-pointer hover:border-white/40">
                <span className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={selected.has(a.slug)} onChange={() => toggle(a.slug)} />
                  {a.label}
                </span>
                <span className="text-white">+ S/. {a.price_soles}</span>
              </label>
            ))}
          </div>
        </>
      )}

      {/* Total + CTA */}
      <div className="flex items-center justify-between border-t border-subtle pt-4">
        <span className="text-sm text-muted">Total {PERIOD_LABELS[period].toLowerCase()}</span>
        {plan
          ? <span className="text-3xl font-light">S/. {total}</span>
          : <span className="text-sm text-faint">No disponible por ahora</span>}
      </div>
      {plan && (
        <div className="mt-4">
          <PlanCTA href={`/checkout?plan=${plan.id}${addonIds ? `&addons=${addonIds}` : ''}`} variant="primary">
            Suscribirme →
          </PlanCTA>
        </div>
      )}
    </div>
  )
}
