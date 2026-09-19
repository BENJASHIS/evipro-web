import { localizedMetadata } from '@/lib/localized-metadata'
import { T } from '@/app/components/Language'
import type { ReactElement } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { MembershipPlan, PlanAddon } from '@/lib/types'
import { MEMBERSHIP_PLAN_PUBLIC_COLUMNS, PLAN_ADDON_PUBLIC_COLUMNS } from '@/lib/db-columns'
import Link from 'next/link'
import Nav from '@/app/components/Nav'
import Badge from '@/app/components/ui/Badge'
import ConfiguradorEvipro from './ConfiguradorEvipro'
import ConfiguradorTurista from './ConfiguradorTurista'
import PlanCTA from './PlanCTA'
import LineaConsultas from './LineaConsultas'

const HERRAMIENTAS_MIEMBRO = [
  {
    nombre: 'Calculadora cannabinoide',
    estado: 'En preparación',
    texto: 'Para entender mg/ml, mg por gota, duración del frasco e inhalaciones calibradas.',
  },
  {
    nombre: 'Regen',
    estado: 'Miembros',
    texto: 'Autochequeo de entorno y desgaste cotidiano, con red de seguridad cuando hay señales de alerta.',
  },
  {
    nombre: 'Biblioteca EVIPro',
    estado: 'Miembros',
    texto: 'Guías, afiches y material educativo prudente, separado de la indicación médica.',
  },
  {
    nombre: 'Sorteos transparentes',
    estado: 'Miembros',
    texto: 'Tickets visibles, próximos sorteos y ganadores anteriores sin mezclar premios con promesas clínicas.',
  },
]

const TURISTA_INCLUYE = [
  'Consulta virtual antes o durante tu viaje',
  'Receta peruana solo si corresponde',
  'Apoyo con RENPUC',
  'Coordinación documentaria con farmacia autorizada',
]

export const generateMetadata = () => localizedMetadata('/planes',
  'Planes de consulta y membresía en cannabis medicinal · EVIPro',
  'Consulta médica de cannabis medicinal en Perú: evaluación, receta si corresponde, apoyo RENPUC y coordinación documentaria con farmacia autorizada. EVIPro no vende productos.')

function CheckList({ items, tone = 'brand' }: { items: (string | ReactElement)[]; tone?: 'brand' | 'yellow' | 'muted' }) {
  const color = {
    brand: 'text-brand',
    yellow: 'text-yellow-400',
    muted: 'text-faint',
  }[tone]
  return (
    <ul className="space-y-2 text-sm text-muted">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 leading-relaxed">
          <span className={`${color} shrink-0`}>✓</span>
          <span>{typeof item === 'string' ? <T>{item}</T> : item}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function PlanesPage() {
  const supabase = await createServerSupabaseClient()
  const [{ data: basePlans }, { data: addons }, { data: turistaPlans }] = await Promise.all([supabase
    .from('membership_plans').select(MEMBERSHIP_PLAN_PUBLIC_COLUMNS)
    .in('type', ['basica', 'evipro'])
    .order('price_soles', { ascending: true }).limit(50),
  supabase
    .from('plan_addons').select(PLAN_ADDON_PUBLIC_COLUMNS).eq('active', true)
    .order('price_soles', { ascending: true }).limit(50),
  supabase
    .from('membership_plans').select(MEMBERSHIP_PLAN_PUBLIC_COLUMNS)
    .in('type', ['turista_inicio', 'turista_plus'])
    .order('price_soles', { ascending: true }).limit(50)])

  const basica = (basePlans ?? []).find(p => p.type === 'basica') as MembershipPlan | undefined
  const eviproPlans = (basePlans ?? []).filter(p => p.type === 'evipro') as MembershipPlan[]

  return (
    <main className="public-page min-h-screen bg-ink text-white">
      <Nav />
      <header className="max-w-5xl mx-auto px-4 pt-16 pb-10">
        <Badge className="mb-4"><T>{"Planes y herramientas"}</T></Badge>
        <h1 className="text-4xl md:text-5xl font-light font-serif italic leading-tight mb-4 max-w-3xl"><T>{"Elige la ruta que sí corresponde a tu caso."}</T></h1>
        <p className="text-muted text-lg leading-relaxed max-w-2xl mb-8"><T>{"Consulta suelta, membresía para seguimiento o ruta turista. Cada camino deja claro qué incluye, qué no incluye y cuándo conviene activar herramientas para miembros."}</T></p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="#membresias"
            className="border border-brand/40 rounded-lg p-4 hover:border-brand transition-colors"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>{"Vivo en Perú"}</T></p>
            <p className="text-white"><T>{"Ver consultas y membresías de menos a más"}</T></p>
          </Link>
          <Link
            href="#turista"
            className="border border-yellow-400/40 rounded-lg p-4 bg-yellow-400/5 hover:border-yellow-400 transition-colors"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-2"><T>{"Estoy de viaje"}</T></p>
            <p className="text-white"><T>{"Preparar Plan Turista antes de llegar"}</T></p>
          </Link>
        </div>
      </header>

      <section className="border-y border-subtle bg-white/[0.02] px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-faint mb-2"><T>{"Valor de la membresía"}</T></p>
              <h2 className="text-2xl font-light"><T>{"Herramientas simples para entender y ordenar tu tratamiento"}</T></h2>
            </div>
            <Link href="/registro" className="text-sm font-mono text-brand hover:text-white transition-colors"><T>{"Crear cuenta →"}</T></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HERRAMIENTAS_MIEMBRO.map(item => (
              <article key={item.nombre} className="border border-subtle rounded-lg p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-light text-white"><T>{item.nombre}</T></h3>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-faint border border-subtle rounded px-2 py-1">
                    <T>{item.estado}</T>
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed"><T>{item.texto}</T></p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Ruta turista arriba: será foco de campañas y no debe quedar enterrada. */}
      <section id="turista" className="scroll-mt-24 border-b border-subtle px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <Badge className="mb-4 text-yellow-400"><T>{"Para visitantes"}</T></Badge>
              <h2 className="text-3xl md:text-4xl font-light font-serif italic leading-tight mb-4"><T>{"Plan Turista: prepara el procedimiento antes de viajar."}</T></h2>
              <p className="text-muted text-sm leading-relaxed mb-6"><T>{"Pensado para personas que visitan Perú y necesitan ordenar evaluación médica, documentación y coordinación con farmacia autorizada dentro del territorio peruano."}</T></p>
              <CheckList items={TURISTA_INCLUYE} tone="yellow" />
              <div className="border border-yellow-400/20 bg-yellow-400/5 rounded-lg p-4 mt-6">
                <p className="text-yellow-400 text-xs font-mono leading-relaxed"><T>{"EVIPro no vende, almacena ni dispensa productos de cannabis. La adquisición corresponde a farmacias autorizadas; cualquier traslado fuera del Perú es responsabilidad exclusiva del viajero conforme a las leyes aplicables."}</T></p>
              </div>
            </div>
            <ConfiguradorTurista plans={(turistaPlans ?? []) as MembershipPlan[]} />
          </div>
        </div>
      </section>

      <section id="membresias" className="scroll-mt-24 max-w-5xl mx-auto px-4 py-16">
        <Badge className="mb-4"><T>{"Pacientes en Perú"}</T></Badge>
        <h2 className="text-3xl md:text-4xl font-light font-serif italic mb-3"><T>{"Beneficios de menos a más"}</T></h2>
        <p className="text-muted text-sm leading-relaxed mb-8 max-w-2xl"><T>{"Empieza con una consulta si solo necesitas orientación. Activa una membresía cuando quieres seguimiento, herramientas, biblioteca, tickets y coordinación más ordenada."}</T></p>

        <div className="grid gap-4 mb-6 lg:grid-cols-3">
          <article className="public-panel border border-subtle rounded-lg p-6">
            <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3"><T>{"0 · Consulta suelta"}</T></p>
            <h3 className="text-xl font-light mb-2"><T>{"Para resolver si corresponde"}</T></h3>
            <p className="text-muted text-sm leading-relaxed mb-4"><T>{"Agenda una evaluación sin comprar membresía. Ideal si necesitas una primera opinión clínica antes de decidir continuidad."}</T></p>
            <p className="text-xs text-muted mb-5"><T>{"Tarifa regular: "}</T><LineaConsultas tarifa="regular" /></p>
            <PlanCTA href="/medicos" variant="secondary"><T>{"Agendar sin membresía →"}</T></PlanCTA>
          </article>

          {basica && (
            <article id="basica" className="public-panel scroll-mt-8 border border-subtle rounded-lg p-6 bg-white/[0.02]">
              <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3"><T>{"1 · Entrada al club"}</T></p>
              <h3 className="text-xl font-light mb-2"><T>{"Membresía Básica"}</T></h3>
              <p className="text-muted text-sm leading-relaxed mb-4"><T>{"Para apoyar la plataforma y acceder a beneficios livianos mientras decides si necesitas seguimiento más completo."}</T></p>
              <CheckList
                items={[
                  'Contenido para miembros',
                  <T key="tickets" values={{ count: basica.tickets_qty }}>{'{count} ticket de sorteo por periodo'}</T>,
                  'Consultas a tarifa Básica',
                ]}
                tone="muted"
              />
              <div className="flex items-end justify-between gap-4 border-t border-subtle mt-5 pt-4">
                <p className="text-2xl font-light">S/. {basica.price_soles}<span className="text-xs text-faint"><T>{"/mes"}</T></span></p>
                <div className="min-w-36">
                  <PlanCTA href={`/checkout?plan=${basica.id}`} variant="secondary"><T>{"Activar Básica →"}</T></PlanCTA>
                </div>
              </div>
            </article>
          )}

          <article id="evipro" className="public-panel scroll-mt-8 border border-brand/40 rounded-lg p-6 bg-brand/5">
            <p className="text-xs font-mono text-brand uppercase tracking-widest mb-3"><T>{"2 · Más útil para seguimiento"}</T></p>
            <h3 className="text-xl font-light mb-2"><T>{"Membresía EVIPro"}</T></h3>
            <p className="text-muted text-sm leading-relaxed mb-4"><T>{"Para pacientes que van a continuar: herramientas, descuentos fuertes, seguimiento y coordinación documentaria cuando el plan lo incluye."}</T></p>
            <CheckList
              items={[
                'Herramientas para miembros y calculadora cannabinoide en preparación',
                'Regen, biblioteca, mensajes y sorteos',
                'Apoyo RENPUC y farmacia autorizada si corresponde',
              ]}
            />
          </article>
        </div>

        <ConfiguradorEvipro plans={eviproPlans} addons={(addons ?? []) as PlanAddon[]} />

        <p className="text-xs text-faint font-mono mt-16 leading-relaxed max-w-2xl mx-auto text-center"><T>{"Sin membresía: "}</T><LineaConsultas tarifa="regular" /><T>{"; cada membresía la abarata. Cada consulta de seguimiento cuesta la mitad de la anterior: la 2ª, la mitad de la 1ª; la 3ª, la mitad de la 2ª. De la 3ª en adelante se queda en ese precio, que es el más bajo. Si pasan 90 días sin volver, la cuenta empieza de nuevo desde la 1ª. Miembro EVIPro que acaba de pagar o renovar: su próxima consulta arranca directo a mitad de precio. Visita a domicilio desde S/. 150 (según distancia)."}</T></p>
        <Link href="/medicos" className="inline-block mt-3 text-sm font-mono text-brand underline hover:text-white"><T>{"Agendar consulta sin membresía →"}</T></Link>

        <p className="text-center text-xs text-faint mt-6 font-mono"><T>{"Pagos procesados de forma segura por Mercado Pago · Cancela cuando quieras"}</T></p>
      </section>
    </main>
  )
}
