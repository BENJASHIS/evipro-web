'use client'
import { useMemo, useState } from 'react'
import type { MembershipPlan, PlanPeriod } from '@/lib/types'
import { PERIOD_LABELS } from '@/lib/types'
import PlanCTA from './PlanCTA'

type TuristaType = 'turista_inicio' | 'turista_plus'

const TIPOS: { key: TuristaType; label: string }[] = [
  { key: 'turista_inicio', label: 'Primera vez' },
  { key: 'turista_plus', label: 'Ya tengo tratamiento' },
]

/** `plans` = filas turista_inicio + turista_plus. Mismo patrón que ConfiguradorEvipro,
 *  con "tipo Inicio/Plus" en lugar de add-ons. Turista no suma módulos. */
export default function ConfiguradorTurista({ plans }: { plans: MembershipPlan[] }) {
  const [tipo, setTipo] = useState<TuristaType>('turista_inicio')
  const [period, setPeriod] = useState<PlanPeriod>('quincenal')

  const tipoPlans = useMemo(() => plans.filter(p => p.type === tipo), [plans, tipo])
  const periods = useMemo(
    () => (['quincenal', 'mensual'] as PlanPeriod[]).filter(p => tipoPlans.some(pl => pl.period === p)),
    [tipoPlans],
  )
  const plan = useMemo(() => tipoPlans.find(p => p.period === period), [tipoPlans, period])

  return (
    <div className="border border-subtle rounded-lg p-6 bg-white/[0.02]">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-2xl font-light">Plan Turista</h3>
        <span className="text-xs font-mono text-faint uppercase tracking-widest">100% virtual</span>
      </div>
      <p className="text-muted text-sm mb-6">Reserva desde tu país. Consulta virtual, RENPUC y coordinación con farmacia magistral.</p>

      {/* Tipo */}
      <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3">1 · ¿Tu situación?</p>
      <div className="flex flex-wrap gap-3 mb-6">
        {TIPOS.map(t => {
          if (!plans.some(p => p.type === t.key)) return null
          return (
            <button
              key={t.key}
              onClick={() => setTipo(t.key)}
              className={`border rounded px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${tipo === t.key ? 'border-brand text-white' : 'border-subtle text-muted hover:border-white/40'}`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Duración */}
      <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3">2 · Duración</p>
      <div className="flex flex-wrap gap-3 mb-6">
        {periods.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`border rounded px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${period === p ? 'border-brand text-white' : 'border-subtle text-muted hover:border-white/40'}`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Total + CTA (o empty-state honesto) */}
      <div className="flex items-center justify-between border-t border-subtle pt-4">
        <span className="text-sm text-muted">Total</span>
        {plan
          ? <span className="text-3xl font-light">S/. {plan.price_soles}</span>
          : <span className="text-sm text-faint">No disponible para esta duración</span>}
      </div>
      {plan && (
        <div className="mt-4">
          <PlanCTA href={`/checkout?plan=${plan.id}`} variant="secondary">Reservar →</PlanCTA>
        </div>
      )}

      {period === 'quincenal' && plan && (
        <p className="text-xs text-yellow-400 font-mono mt-4 leading-relaxed">
          Plan quincenal: el delivery (3-5 días hábiles) puede no completarse antes de tu salida.
          Si el producto no llega a tiempo, se reembolsa el costo del medicamento.
        </p>
      )}
    </div>
  )
}
