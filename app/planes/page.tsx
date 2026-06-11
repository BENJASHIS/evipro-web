import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { MembershipPlan, PlanType } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/app/components/Nav'

const PLAN_IMAGES: Record<PlanType, { src: string; placeholder: string }> = {
  express:        { src: '/images/planes/express.png',        placeholder: 'from-emerald-950 to-[#080a08]' },
  cannabis:       { src: '/images/planes/cannabis.png',       placeholder: 'from-green-950 to-[#080a08]' },
  integral:       { src: '/images/planes/integral.png',       placeholder: 'from-teal-950 to-[#080a08]' },
  turista_inicio: { src: '/images/planes/turista-inicio.png', placeholder: 'from-amber-950 to-[#080a08]' },
  turista_plus:   { src: '/images/planes/turista-plus.png',   placeholder: 'from-violet-950 to-[#080a08]' },
}

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
  turista_inicio: {
    name: 'Plan Turista Inicio',
    description: 'Para visitantes que inician tratamiento con cannabis medicinal en Perú',
    highlight: 'Consulta virtual completa · RENPUC nuevo candidato · Coordinación con farmacia magistral',
  },
  turista_plus: {
    name: 'Plan Turista Plus',
    description: 'Para visitantes que ya usan cannabis y revalidan su tratamiento',
    highlight: 'Consulta express · Revalidación receta extranjera · Coordinación con farmacia magistral',
  },
}

const PERIOD_LABELS: Record<string, string> = {
  quincenal: 'Quincenal (15 días)',
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
    <main className="min-h-screen bg-[#080a08] text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-xs tracking-widest text-[#7bc96f] uppercase mb-4 font-mono">Membresías</p>
        <h1 className="text-4xl font-light font-serif italic mb-4">Elige tu plan de salud</h1>
        <p className="text-gray-400 mb-16 max-w-xl">
          Accede a atención médica especializada en Cannabis Medicinal, Medicina de Altura y Salud Mental.
        </p>

        {/* Planes locales */}
        <div className="grid gap-12 mb-20">
          {(['express', 'cannabis', 'integral'] as PlanType[]).map(type => {
            const info = PLAN_LABELS[type]
            const img = PLAN_IMAGES[type]
            const typePlans = byType[type] ?? []
            return (
              <div key={type} className="border border-white/10 rounded-lg overflow-hidden">
                <div className={`relative w-full h-48 bg-gradient-to-br ${img.placeholder}`}>
                  <Image
                    src={img.src}
                    alt={info.name}
                    fill
                    className="object-cover opacity-80"

                  />
                </div>
                <div className="p-8">
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
                        <p className="text-xs text-gray-500 mt-3 group-hover:text-white transition-colors">
                          Suscribirme →
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Planes Turista */}
        <div className="border-t border-white/10 pt-16">
          <p className="text-xs tracking-widest text-[#7bc96f] uppercase mb-4 font-mono">Para visitantes</p>
          <h2 className="text-3xl font-light font-serif italic mb-2">Planes Turista</h2>
          <p className="text-gray-400 text-sm mb-4 max-w-xl">
            Reserva desde tu país — la consulta es 100% virtual. Con plan de 15 días recomendamos
            comprar al menos 7 días antes de llegar. Con plan de 30 días, mínimo 5 días de anticipación.
          </p>

          {/* Aviso legal */}
          <div className="border border-yellow-400/20 bg-yellow-400/5 rounded-lg p-4 mb-10 max-w-2xl">
            <p className="text-yellow-400 text-xs font-mono leading-relaxed">
              EVIPro opera exclusivamente en territorio peruano. Podemos orientarte sobre restricciones
              en tu país de destino si lo solicitas, pero el transporte del producto fuera del Perú
              es responsabilidad exclusiva del viajero conforme a las leyes de su país.
            </p>
          </div>

          <div className="grid gap-10">
            {(['turista_inicio', 'turista_plus'] as PlanType[]).map(type => {
              const info = PLAN_LABELS[type]
              const img = PLAN_IMAGES[type]
              const typePlans = byType[type] ?? []
              return (
                <div key={type} className="border border-white/10 rounded-lg overflow-hidden">
                  <div className={`relative w-full h-48 bg-gradient-to-br ${img.placeholder}`}>
                    <Image
                      src={img.src}
                      alt={info.name}
                      fill
                      className="object-cover opacity-80"
  
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-light mb-1">{info.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{info.description}</p>
                    <p className="text-[#7bc96f] text-xs font-mono mb-6">✓ {info.highlight}</p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm">
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
                          {plan.period === 'quincenal' && (
                            <p className="text-xs text-yellow-400 mt-1 font-mono">Ver aviso delivery</p>
                          )}
                          <p className="text-xs text-gray-500 mt-3 group-hover:text-white transition-colors">
                            Reservar →
                          </p>
                        </Link>
                      ))}
                    </div>
                    {typePlans.some(p => p.period === 'quincenal') && (
                      <p className="text-xs text-gray-500 font-mono mt-4 max-w-md">
                        Plan quincenal: el delivery (3-5 días hábiles) puede no completarse antes de tu salida.
                        Si el producto no llega a tiempo, se reembolsa el costo del medicamento.
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-16 font-mono">
          Pagos procesados de forma segura por Culqi · Cancela cuando quieras
        </p>
      </div>
    </main>
  )
}
