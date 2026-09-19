'use client'
import { T } from '@/app/components/Language'
import { useMemo, useState } from 'react'
import type { MembershipPlan, PlanAddon, PlanPeriod } from '@/lib/types'
import { PERIOD_LABELS } from '@/lib/types'
import { computeCartTotal } from '@/lib/billing'
import PlanCTA from './PlanCTA'
import LineaConsultas from './LineaConsultas'

const PERIODS: PlanPeriod[] = ['mensual', 'trimestral', 'semestral']

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
        <h2 className="text-2xl font-light"><T>{"Membresía EVIPro"}</T></h2>
        <span className="text-xs font-mono text-brand uppercase tracking-widest"><T>{"Recomendado"}</T></span>
      </div>
      <p className="text-muted text-sm mb-6"><T>{"Activa el panel de seguimiento para pacientes continuadores: herramientas para miembros, mensajes, biblioteca, sorteos y condiciones preferentes para consultas. Si corresponde, incluye apoyo RENPUC, receta y coordinación documentaria con farmacia autorizada."}</T></p>

      {/* Qué incluye EVIPro + precios de consulta de miembro */}
      {ref && (
        <div className="border border-subtle rounded p-4 mb-6 bg-white/[0.02]">
          <p className="text-xs text-muted mb-3"><T>{"Tus consultas como miembro: "}</T><LineaConsultas tarifa="evipro" /></p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono text-brand">
            <span><T>{"✓ Herramientas para miembros"}</T></span>
            <span><T>{"✓ Biblioteca y sorteos"}</T></span>
            {ref.includes_prescription && <span><T>{"✓ Receta si corresponde"}</T></span>}
            {ref.includes_renpuc_support && <span><T>{"✓ Apoyo RENPUC"}</T></span>}
            {ref.includes_pharmacy_coord && <span><T>{"✓ Coordinación con farmacia autorizada"}</T></span>}
          </div>
        </div>
      )}

      {/* Duración */}
      <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3"><T>{"1 · Duración"}</T></p>
      <div className="flex flex-wrap gap-3 mb-6">
        {PERIODS.map(p => {
          if (!plans.some(pl => pl.period === p)) return null
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`border rounded px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${period === p ? 'border-brand text-white' : 'border-subtle text-muted hover:border-white/40'}`}
            >
              <T>{PERIOD_LABELS[p]}</T>
            </button>
          )
        })}
      </div>

      {/* Módulos */}
      {periodAddons.length > 0 && (
        <>
          <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3"><T>{"2 · Especialistas (opcional)"}</T></p>
          <div className="grid gap-3 mb-6">
            {periodAddons.map(a => (
              <label key={a.id} className="flex items-center justify-between border border-subtle rounded p-3 cursor-pointer hover:border-white/40">
                <span className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={selected.has(a.slug)} onChange={() => toggle(a.slug)} />
                  <T>{a.label}</T>
                </span>
                <span className="text-white">+ S/. {a.price_soles}</span>
              </label>
            ))}
          </div>
        </>
      )}

      {/* Total + CTA */}
      <div className="flex items-center justify-between border-t border-subtle pt-4">
        <span className="text-sm text-muted">Total <T>{PERIOD_LABELS[period].toLowerCase()}</T></span>
        {plan
          ? <span className="text-3xl font-light">S/. {total}</span>
          : <span className="text-sm text-faint"><T>{"No disponible por ahora"}</T></span>}
      </div>
      {plan && (
        <div className="mt-4">
          <PlanCTA href={`/checkout?plan=${plan.id}${addonIds ? `&addons=${addonIds}` : ''}`} variant="primary"><T>{"Activar EVIPro →"}</T></PlanCTA>
        </div>
      )}
    </div>
  )
}
