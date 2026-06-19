import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { MembershipPlan, PlanType } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/app/components/Nav'
import Badge from '@/app/components/ui/Badge'

const PLAN_IMAGES: Record<PlanType, { src: string | null; placeholder: string }> = {
  express:        { src: '/images/planes/express.jpg',        placeholder: 'from-emerald-950 to-ink' },
  esencial:       { src: '/images/planes/esencial.jpg',       placeholder: 'from-emerald-900 to-surface-2' },
  cannabis:       { src: '/images/planes/cannabis.jpg',       placeholder: 'from-green-950 to-ink' },
  integral:       { src: '/images/planes/integral.jpg',       placeholder: 'from-teal-950 to-ink' },
  turista_inicio: { src: '/images/planes/turista-inicio.jpg', placeholder: 'from-amber-950 to-ink' },
  turista_plus:   { src: '/images/planes/turista-plus.jpg',   placeholder: 'from-violet-950 to-ink' },
}

const PLAN_LABELS: Record<PlanType, { name: string; description: string; highlight: string }> = {
  express: {
    name: 'Plan Express',
    description: 'Puerta de entrada al cuidado médico especializado',
    highlight: '1 consulta virtual de 15 min incluida',
  },
  esencial: {
    name: 'Plan Esencial',
    description: 'Seguimiento y bienestar — un paso sobre Express',
    highlight: 'Consulta virtual seguimiento S/. 30 · 1 ticket de sorteo mensual',
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
    <main className="min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Badge className="mb-4">Membresías</Badge>
        <h1 className="text-4xl font-light font-serif italic mb-4">Elige tu plan de salud</h1>
        <p className="text-muted mb-8 max-w-xl">
          Accede a atención médica especializada en Cannabis Medicinal, Medicina de Altura, Salud del Adulto Mayor y Bienestar Integral.
        </p>

        {/* Tarifas de referencia sin membresía */}
        <div className="border border-subtle rounded-lg p-4 mb-16 bg-white/[0.02]">
          <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3">Sin membresía</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <span className="text-muted">Consulta virtual <span className="text-white font-light ml-1">S/. 70</span></span>
            <span className="text-muted">Consulta presencial <span className="text-white font-light ml-1">S/. 100</span></span>
            <span className="text-muted">Visita a domicilio <span className="text-white font-light ml-1">desde S/. 150</span></span>
          </div>
          <p className="text-xs text-faint font-mono mt-2">Con membresía pagas menos en cada consulta de seguimiento.</p>
        </div>

        {/* Planes locales */}
        <div className="grid gap-12 mb-20">
          {(['esencial', 'express', 'cannabis', 'integral'] as PlanType[]).map(type => {
            const info = PLAN_LABELS[type]
            const img = PLAN_IMAGES[type]
            const typePlans = byType[type] ?? []
            return (
              <div key={type} className="border border-subtle rounded-lg overflow-hidden">
                <div className={`relative w-full h-48 bg-gradient-to-br ${img.placeholder}`}>
                  {img.src && (
                    <Image
                      src={img.src}
                      alt={info.name}
                      fill
                      className="object-cover opacity-80"
                    />
                  )}
                </div>
                <div className="p-8">
                  <h2 className="text-2xl font-light mb-1">{info.name}</h2>
                  <p className="text-muted text-sm mb-2">{info.description}</p>
                  <p className="text-brand text-xs font-mono mb-4">✓ {info.highlight}</p>

                  {/* Precios de consulta con este plan */}
                  {typePlans[0] && (Number(typePlans[0].discount_virtual_pct) > 0 || Number(typePlans[0].discount_presencial_pct) > 0) && (
                    <div className="flex flex-wrap gap-4 mb-6 text-xs font-mono">
                      {Number(typePlans[0].discount_virtual_pct) > 0 && (
                        <span className="text-gray-300">
                          Virtual{' '}
                          <span className="text-white font-medium">
                            S/. {Math.round(70 * (1 - Number(typePlans[0].discount_virtual_pct) / 100))}
                          </span>
                          <span className="text-faint line-through ml-1">S/. 70</span>
                        </span>
                      )}
                      {Number(typePlans[0].discount_presencial_pct) > 0 && (
                        <span className="text-gray-300">
                          Presencial{' '}
                          <span className="text-white font-medium">
                            S/. {Math.round(100 * (1 - Number(typePlans[0].discount_presencial_pct) / 100))}
                          </span>
                          <span className="text-faint line-through ml-1">S/. 100</span>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {typePlans.map(plan => (
                      <Link
                        key={plan.id}
                        href={`/checkout?plan=${plan.id}`}
                        className="block border border-subtle hover:border-brand rounded p-4 text-center transition-colors group"
                      >
                        <p className="text-xs text-faint uppercase tracking-widest mb-2 font-mono">
                          {PERIOD_LABELS[plan.period]}
                        </p>
                        <p className="text-2xl font-light mb-1">S/. {plan.price_soles}</p>
                        <p className="text-xs text-faint mt-3 group-hover:text-white transition-colors">
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
        <div className="border-t border-subtle pt-16">
          <Badge className="mb-4">Para visitantes</Badge>
          <h2 className="text-3xl font-light font-serif italic mb-2">Planes Turista</h2>
          <p className="text-muted text-sm mb-4 max-w-xl">
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
                <div key={type} className="border border-subtle rounded-lg overflow-hidden">
                  <div className={`relative w-full h-48 bg-gradient-to-br ${img.placeholder}`}>
                    {img.src && (
                      <Image
                        src={img.src}
                        alt={info.name}
                        fill
                        className="object-cover opacity-80"
                      />
                    )}
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-light mb-1">{info.name}</h3>
                    <p className="text-muted text-sm mb-2">{info.description}</p>
                    <p className="text-brand text-xs font-mono mb-6">✓ {info.highlight}</p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm">
                      {typePlans.map(plan => (
                        <Link
                          key={plan.id}
                          href={`/checkout?plan=${plan.id}`}
                          className="block border border-subtle hover:border-brand rounded p-4 text-center transition-colors group"
                        >
                          <p className="text-xs text-faint uppercase tracking-widest mb-2 font-mono">
                            {PERIOD_LABELS[plan.period]}
                          </p>
                          <p className="text-2xl font-light mb-1">S/. {plan.price_soles}</p>
                          {plan.period === 'quincenal' && (
                            <p className="text-xs text-yellow-400 mt-1 font-mono">Ver aviso delivery</p>
                          )}
                          <p className="text-xs text-faint mt-3 group-hover:text-white transition-colors">
                            Reservar →
                          </p>
                        </Link>
                      ))}
                    </div>
                    {typePlans.some(p => p.period === 'quincenal') && (
                      <p className="text-xs text-faint font-mono mt-4 max-w-md">
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

        <p className="text-center text-xs text-faint mt-16 font-mono">
          Pagos procesados de forma segura por Mercado Pago · Cancela cuando quieras
        </p>
      </div>
    </main>
  )
}
