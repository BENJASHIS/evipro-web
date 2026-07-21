'use client'
import { useMemo, useState } from 'react'
import type { MembershipPlan, PlanAddon, PlanPeriod } from '@/lib/types'
import { PERIOD_LABELS } from '@/lib/types'
import { computeCartTotal } from '@/lib/billing'
import PlanCTA from './PlanCTA'

const PERIODS: PlanPeriod[] = ['mensual', 'trimestral', 'semestral']
// Precios base de consulta sin membresía (mismos del bloque "Sin membresía" en /planes).
const BASE_VIRTUAL = 70
const BASE_PRESENCIAL = 100

/** `plans` = solo filas EVIPro (una por período). `addons` = módulos activos. */
export default function ConfiguradorEvipro({ plans, addons }: { plans: MembershipPlan[]; addons: PlanAddon[] }) {
  const [period, setPeriod] = useState<PlanPeriod>('mensual')
  const [selected, setSelected] = useState<Set<string>>(new Set()) // addon slugs

  const plan = useMemo(() => plans.find(p => p.period === period), [plans, period])
  // Los descuentos/includes son iguales en toda duración EVIPro; una fila cualquiera sirve de referencia.
  const ref = plan ?? plans[0]
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
      <p className="text-muted text-sm mb-6">Suma los especialistas que necesites. Estos beneficios aplican en cada consulta que reserves:</p>

      {/* Beneficios: descuentos de consulta (se aplican solos al reservar) + qué incluye */}
      {ref && (
        <div className="border border-subtle rounded p-4 mb-6 bg-white/[0.02]">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm mb-3">
            {Number(ref.discount_virtual_pct) > 0 && (
              <span className="text-muted">
                Consulta virtual{' '}
                <span className="text-white font-medium ml-1">S/. {Math.round(BASE_VIRTUAL * (1 - Number(ref.discount_virtual_pct) / 100))}</span>
                <span className="text-faint line-through ml-1">S/. {BASE_VIRTUAL}</span>
              </span>
            )}
            {Number(ref.discount_presencial_pct) > 0 && (
              <span className="text-muted">
                Consulta presencial{' '}
                <span className="text-white font-medium ml-1">S/. {Math.round(BASE_PRESENCIAL * (1 - Number(ref.discount_presencial_pct) / 100))}</span>
                <span className="text-faint line-through ml-1">S/. {BASE_PRESENCIAL}</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono text-brand">
            {ref.includes_prescription && <span>✓ Receta incluida</span>}
            {ref.includes_renpuc_support && <span>✓ Apoyo RENPUC</span>}
            {ref.includes_pharmacy_coord && <span>✓ Coordinación farmacia</span>}
          </div>
        </div>
      )}

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
