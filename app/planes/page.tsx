import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { MembershipPlan, PlanAddon } from '@/lib/types'
import { PERIOD_LABELS } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/app/components/Nav'
import Badge from '@/app/components/ui/Badge'
import ConfiguradorEvipro from './ConfiguradorEvipro'

type TuristaType = 'turista_inicio' | 'turista_plus'

const PLAN_IMAGES: Record<TuristaType, { src: string | null; placeholder: string }> = {
  turista_inicio: { src: '/images/planes/turista-inicio.jpg', placeholder: 'from-amber-950 to-ink' },
  turista_plus:   { src: '/images/planes/turista-plus.jpg',   placeholder: 'from-violet-950 to-ink' },
}

const PLAN_LABELS: Record<TuristaType, { name: string; description: string; highlight: string; receta: string }> = {
  turista_inicio: {
    name: 'Plan Turista Inicio',
    description: 'Para visitantes que inician tratamiento con cannabis medicinal en Perú',
    highlight: 'Consulta virtual completa · RENPUC nuevo candidato · Coordinación con farmacia magistral',
    receta: 'Incluye receta simple, triple o especial según tu caso',
  },
  turista_plus: {
    name: 'Plan Turista Plus',
    description: 'Para visitantes que ya usan cannabis y revalidan su tratamiento',
    highlight: 'Consulta express · Revalidación receta extranjera · Coordinación con farmacia magistral',
    receta: 'Incluye receta simple, triple o especial según tu caso',
  },
}

export default async function PlanesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: basePlans } = await supabase
    .from('membership_plans').select('*')
    .in('type', ['basica', 'evipro'])
    .order('price_soles', { ascending: true })
  const { data: addons } = await supabase
    .from('plan_addons').select('*').eq('active', true)
    .order('price_soles', { ascending: true })
  const { data: turistaPlans } = await supabase
    .from('membership_plans').select('*')
    .in('type', ['turista_inicio', 'turista_plus'])
    .order('price_soles', { ascending: true })

  const basica = (basePlans ?? []).find(p => p.type === 'basica') as MembershipPlan | undefined
  const eviproPlans = (basePlans ?? []).filter(p => p.type === 'evipro') as MembershipPlan[]

  const byType = (turistaPlans ?? []).reduce<Record<string, MembershipPlan[]>>((acc, plan) => {
    (acc[plan.type] ??= []).push(plan)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Badge className="mb-4">Membresías</Badge>
        <h1 className="text-4xl font-light font-serif italic mb-4">Elige tu plan de salud</h1>
        <p className="text-muted mb-8 max-w-xl">Tres opciones simples: apoya la página, arma tu membresía completa, o viaja.</p>

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

        {/* Ruta 1: Básica / Apoyo (tarjeta simple) */}
        {basica && (
          <div className="border border-subtle rounded-lg p-6 mb-6 bg-white/[0.02] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-light mb-1">Membresía Básica</h2>
              <p className="text-muted text-sm">Contenido + 1 ticket de sorteo. Para apoyar la página.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-light mb-2">S/. {basica.price_soles}<span className="text-xs text-faint">/mes</span></p>
              <Link href={`/checkout?plan=${basica.id}`} className="inline-block border border-subtle hover:border-brand rounded px-4 py-2 text-sm transition-colors">Suscribirme →</Link>
            </div>
          </div>
        )}

        {/* Ruta 2: EVIPro (configurador) */}
        <div className="mb-16">
          <ConfiguradorEvipro plans={eviproPlans} addons={(addons ?? []) as PlanAddon[]} />
        </div>

        {/* Ruta 3: Planes Turista */}
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
            {(['turista_inicio', 'turista_plus'] as TuristaType[]).map(type => {
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
                    <p className="text-brand text-xs font-mono mb-1">✓ {info.highlight}</p>
                    <p className="text-faint text-xs font-mono mb-6">✓ {info.receta}</p>
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
