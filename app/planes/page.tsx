import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { MembershipPlan, PlanAddon } from '@/lib/types'
import Link from 'next/link'
import Nav from '@/app/components/Nav'
import Badge from '@/app/components/ui/Badge'
import ConfiguradorEvipro from './ConfiguradorEvipro'
import ConfiguradorTurista from './ConfiguradorTurista'
import PlanCTA from './PlanCTA'
import LineaConsultas from './LineaConsultas'

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

  return (
    <main className="min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Badge className="mb-4">Membresías</Badge>
        <h1 className="text-4xl font-light font-serif italic mb-4">Elige tu plan de salud</h1>
        <p className="text-muted mb-8 max-w-xl">Tres opciones simples: apoya la página, arma tu membresía completa, o viaja.</p>

        {/* Ruta 1: Básica / Apoyo */}
        {basica && (
          <div className="border border-subtle rounded-lg p-6 mb-6 bg-white/[0.02] flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-light mb-1">Membresía Básica</h2>
              <p className="text-muted text-sm mb-2">Contenido + 1 ticket de sorteo. Para apoyar la página.</p>
              <p className="text-xs text-muted">Consultas a precio regular: <LineaConsultas esMiembro={false} /></p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-light mb-2">S/. {basica.price_soles}<span className="text-xs text-faint">/mes</span></p>
              <PlanCTA href={`/checkout?plan=${basica.id}`} variant="secondary">Suscribirme →</PlanCTA>
            </div>
          </div>
        )}

        {/* Ruta 2: EVIPro (configurador) */}
        <div className="mb-16">
          <ConfiguradorEvipro plans={eviproPlans} addons={(addons ?? []) as PlanAddon[]} />
        </div>

        {/* Ruta 3: Turista (configurador) */}
        <div className="border-t border-subtle pt-16">
          <Badge className="mb-4">Para visitantes</Badge>
          <h2 className="text-3xl font-light mb-2">Planes Turista</h2>
          <p className="text-muted text-sm mb-4 max-w-xl">
            Con plan de 15 días recomendamos comprar al menos 7 días antes de llegar.
            Con plan de 30 días, mínimo 5 días de anticipación.
          </p>

          {/* Aviso legal territorial */}
          <div className="border border-yellow-400/20 bg-yellow-400/5 rounded-lg p-4 mb-8 max-w-2xl">
            <p className="text-yellow-400 text-xs font-mono leading-relaxed">
              EVIPro opera exclusivamente en territorio peruano. Podemos orientarte sobre restricciones
              en tu país de destino si lo solicitas, pero el transporte del producto fuera del Perú
              es responsabilidad exclusiva del viajero conforme a las leyes de su país.
            </p>
          </div>

          <ConfiguradorTurista plans={(turistaPlans ?? []) as MembershipPlan[]} />
        </div>

        <p className="text-xs text-faint font-mono mt-16 leading-relaxed max-w-2xl mx-auto text-center">
          La reconsulta cuesta la mitad de la primera; de la 3ª consulta en adelante, el piso.
          Reinicia si pasan 90 días sin volver. Miembro que acaba de pagar/renovar: su próxima consulta arranca
          directo a mitad de precio. Visita a domicilio desde S/. 150 (según distancia).
        </p>
        <Link href="/reservar" className="inline-block mt-3 text-sm font-mono text-brand underline hover:text-white">
          Agendar consulta sin membresía →
        </Link>

        <p className="text-center text-xs text-faint mt-6 font-mono">
          Pagos procesados de forma segura por Mercado Pago · Cancela cuando quieras
        </p>
      </div>
    </main>
  )
}
