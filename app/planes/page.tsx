import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { MembershipPlan, PlanType } from '@/lib/types'
import Link from 'next/link'

const PLAN_LABELS: Record<PlanType, { name: string; description: string; highlight: string }> = {
  express: {
    name: 'Plan Express',
    description: 'Puerta de entrada al cuidado médico especializado',
    highlight: '1 consulta virtual de 15 min incluida',
  },
  cannabis: {
    name: 'Plan Cannabis',
    description: 'Para pacientes de cannabis medicinal con seguimiento',
    highlight: 'Emergencias cannábicas 24/7 · Receta incluida',
  },
  integral: {
    name: 'Plan Integral',
    description: 'Seguimiento completo presencial y virtual',
    highlight: 'Consulta virtual S/. 10 · Presencial S/. 40',
  },
}

const PERIOD_LABELS: Record<string, string> = {
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
}

export default async function PlanesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: plans } = await supabase
    .from('membership_plans')
    .select('*')
    .order('price_soles', { ascending: true })

  const byType = (plans ?? []).reduce<Record<string, MembershipPlan[]>>((acc, plan) => {
    if (!acc[plan.type]) acc[plan.type] = []
    acc[plan.type].push(plan)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-[#080a08] text-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs tracking-widest text-[#7bc96f] uppercase mb-4 font-mono">Membresías</p>
        <h1 className="text-4xl font-light font-serif italic mb-4">Elige tu plan de salud</h1>
        <p className="text-gray-400 mb-16 max-w-xl">
          Accede a atención médica especializada en Cannabis Medicinal, Medicina de Altura y Salud Mental.
        </p>

        <div className="grid gap-12">
          {(['express', 'cannabis', 'integral'] as PlanType[]).map(type => {
            const info = PLAN_LABELS[type]
            const typePlans = byType[type] ?? []
            return (
              <div key={type} className="border border-white/10 rounded-lg p-8">
                <h2 className="text-2xl font-light mb-1">{info.name}</h2>
                <p className="text-gray-400 text-sm mb-2">{info.description}</p>
                <p className="text-[#7bc96f] text-xs font-mono mb-6">✓ {info.highlight}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {typePlans.map(plan => (
                    <Link
                      key={plan.id}
                      href={`/checkout?plan=${plan.id}`}
                      className="block border border-white/10 hover:border-[#7bc96f] rounded p-4 text-center transition-colors group"
                    >
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono">
                        {PERIOD_LABELS[plan.period]}
                      </p>
                      <p className="text-2xl font-light mb-1">S/. {plan.price_soles}</p>
                      {plan.tickets_qty > 0 && (
                        <p className="text-xs text-[#7bc96f]">{plan.tickets_qty} tickets sorteo</p>
                      )}
                      <p className="text-xs text-gray-500 mt-3 group-hover:text-white transition-colors">
                        Suscribirme →
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-600 mt-12 font-mono">
          Pagos procesados de forma segura por Culqi · Cancela cuando quieras
        </p>
      </div>
    </main>
  )
}
