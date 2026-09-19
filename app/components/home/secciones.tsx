import { T } from '@/app/components/Language'
import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { DOCTORS } from '@/lib/doctors'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import { escaleraReserva, precioReferencia } from '@/lib/consulta-pricing'
import {
  HERO, INDICACIONES_PORTADA, PARA_QUE_NO, PREGUNTAS, PASOS_PRIMERA_CONSULTA,
  OTRAS_ESPECIALIDADES, ESPECIALIDADES_PROXIMAS, MEDICO, RENPUC_NOMBRE, WHATSAPP, MEMBRESIA,
  EVIDENCIA_PUBLICA,
} from '@/lib/home-content'

const AGENDAR = '/medicos/dr-jara/agendar'
const SECCION = 'home-section border-t border-subtle py-20 px-6'
const CAJA = 'max-w-6xl mx-auto'
const ROTULO = 'text-xs font-mono text-faint uppercase tracking-widest mb-6'

/** Envuelve cada aparición de «RENPUC» en un <abbr> con el nombre completo.
 *  Se hace aquí y no en el contenido porque el nombre oficial es kilométrico y
 *  no cabe en la tarjeta; el <abbr> lo enseña al pasar el mouse y los lectores
 *  de pantalla lo leen. Sin casos especiales por índice: cualquier texto que
 *  lleve la sigla queda cubierto, hoy y cuando se añada otro. */
function conAbbr(texto: string): ReactNode[] {
  return texto.split('RENPUC').flatMap((parte, i) =>
    i === 0
      ? [parte]
      : [
          <abbr key={i} title={RENPUC_NOMBRE} className="no-underline">RENPUC</abbr>,
          parte,
        ],
  )
}

export function Hero() {
  return (
    <section className="home-hero max-w-6xl mx-auto px-6 pt-20 pb-16">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <Badge className="mb-6"><T>{HERO.etiqueta}</T></Badge>
          <h1 className="home-title font-light font-serif mb-6"><T>{HERO.titulo}</T><br /><T>{HERO.titulo2}</T></h1>
          <p className="text-muted text-lg leading-relaxed max-w-xl mb-8"><T>{HERO.subtitulo}</T></p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" href="/planes#membresias"><T>{"Conocer las membresías →"}</T></Button>
            <Button variant="outline" href="/medicos"><T>{"Buscar una consulta →"}</T></Button>
          </div>
          <p className="text-muted text-sm mt-5"><T>{"Puedes consultar sin membresía o apoyar sin ser paciente."}</T></p>
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <span className="text-muted text-sm"><T>{HERO.escribir}</T></span>
            <Button variant="outline" href={`https://wa.me/51${WHATSAPP}`} className="px-5 py-2">WhatsApp</Button>
          </div>
          <Link href="/planes#turista" className="inline-block text-sm text-brand mt-6 underline"><T>{"¿Visitas Perú? Conoce el Plan Turista →"}</T></Link>
        </div>
        <div className="lg:col-span-5">
          <p className="text-brand text-xs font-mono tracking-widest uppercase mb-5"><T>{"El equipo detrás de EVIPro"}</T></p>
          <div className="grid grid-cols-2 gap-4">
            {DOCTORS.map(doctor => (
              <Link key={doctor.slug} href={`/medicos/${doctor.slug}`} className="group min-w-0">
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-[5rem] bg-white/5">
                  <Image src={doctor.photo} alt={doctor.name} fill priority sizes="(min-width: 1024px) 220px, 45vw" className="object-cover object-[center_18%]" />
                </div>
                <h2 className="text-base mt-4 leading-snug group-hover:text-brand">{doctor.name}</h2>
                <p className="text-brand text-xs font-mono mt-2">CMP {doctor.cmp}</p>
                <p className="text-muted text-xs mt-2"><T>{doctor.location}</T> · <T>{doctor.modality}</T></p>
                <span className="inline-block text-sm mt-3 underline underline-offset-4"><T>{"Ver perfil →"}</T></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ParaQueSi() {
  return (
    <section className={SECCION}>
      <div className={CAJA}>
        <h2 className={ROTULO}><T>{"Para qué sí"}</T></h2>
        <div className="grid md:grid-cols-2 gap-4">
          {INDICACIONES_PORTADA.map(i => (
            <div
              key={i.titulo}
              className={`border border-subtle rounded-lg p-5 ${i.anchoCompleto ? 'md:col-span-2' : ''}`}
            >
              <h3 className="text-base font-light mb-1">{i.titulo}</h3>
              <p className="text-muted text-sm leading-relaxed">{i.matiz}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ParaQueNo() {
  return (
    <section className={`${SECCION} bg-white/[0.02]`}>
      <div className={CAJA}>
        <p className={ROTULO}><T>{"Para qué no"}</T></p>
        <h2 className="text-2xl font-light font-serif italic mb-3">{PARA_QUE_NO.titulo}</h2>
        <p className="text-muted leading-relaxed max-w-2xl">{PARA_QUE_NO.texto}</p>
      </div>
    </section>
  )
}

export function EvidenciaLimites() {
  return (
    <section className={SECCION}>
      <div className={CAJA}>
        <p className={ROTULO}><T>{"Evidencia y límites"}</T></p>
        <h2 className="text-2xl font-light font-serif italic mb-3"><T>{"No todo paciente necesita cannabis."}</T></h2>
        <p className="text-muted leading-relaxed max-w-2xl mb-8"><T>{"La consulta decide si corresponde, qué riesgos revisar y cuándo buscar otra ruta. Estas fuentes públicas orientan el criterio clínico."}</T></p>
        <div className="grid md:grid-cols-2 gap-4">
          {EVIDENCIA_PUBLICA.map(item => (
            <article key={item.titulo} className="border border-subtle rounded-lg p-5">
              <h3 className="text-base font-light mb-1">{item.titulo}</h3>
              <p className="text-muted text-sm leading-relaxed mb-3">{item.resumen}</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-brand hover:text-white transition-colors"
              >
                {item.fuente} →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Preguntas() {
  return (
    <section className={SECCION}>
      <div className={CAJA}>
        <h2 className={ROTULO}><T>{"Lo que todos preguntan"}</T></h2>
        <dl className="divide-y divide-subtle">
          {PREGUNTAS.map(q => (
            <div key={q.p} className="py-4">
              <dt className="font-light mb-1">{conAbbr(q.p)}</dt>
              <dd className="text-muted text-sm leading-relaxed">{q.r}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export function QuienTeAtiende() {
  return <section className={SECCION}><div className={CAJA}><h2 className={ROTULO}><T>{"Atención con un profesional responsable"}</T></h2><p className="text-muted max-w-2xl leading-relaxed"><T>{"Conoce la formación, las áreas de atención y la modalidad de cada médico antes de elegir tu consulta."}</T></p><Link href="/medicos" className="inline-block mt-5 text-brand underline"><T>{"Conocer al equipo médico →"}</T></Link></div></section>
}

export function PrimeraConsulta() {
  return (
    <section className={SECCION}>
      <div className={CAJA}>
        <h2 className={ROTULO}><T>{"Cómo es la primera consulta"}</T></h2>
        <div className="grid md:grid-cols-2 gap-4">
          {PASOS_PRIMERA_CONSULTA.map(p => (
            <div key={p.n} className="border border-subtle rounded-lg p-5">
              <h3 className="text-base font-light mb-1">
                {p.n} · {conAbbr(p.titulo)}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{conAbbr(p.texto)}</p>
            </div>
          ))}
        </div>
        <p className="text-faint text-xs mt-5"><T>{"Presencial:"}</T>{escaleraReserva('presencial')}<T>{" · Virtual: "}</T>{escaleraReserva('virtual')}
        </p>
      </div>
    </section>
  )
}

export function OtrasEspecialidades() {
  return (
    <section className={SECCION}>
      <div className={CAJA}>
        <h2 className={ROTULO}><T>{"También atendemos"}</T></h2>
        <p className="text-muted leading-relaxed">
          <T>{OTRAS_ESPECIALIDADES.join(' · ')}</T>{' '}
          <span className="text-faint">
            (+ <T>{ESPECIALIDADES_PROXIMAS.join(' y ').toLowerCase()}</T><T>{", pronto)"}</T></span>
        </p>
      </div>
    </section>
  )
}

export function Membresia({ desde, basica }: { desde: number | null; basica: number | null }) {
  return (
    <section id="comunidad" className="home-modalities px-6 py-20" aria-labelledby="comunidad-titulo">
      <div className={CAJA}>
        <p className="text-xs font-mono uppercase tracking-widest mb-5"><T>{"Forma parte de EVIPro"}</T></p>
        <h2 id="comunidad-titulo" className="text-3xl md:text-5xl font-serif mb-6"><T>{"Una comunidad."}</T><br /><T>{"Distintas formas de participar."}</T></h2>
        <p className="max-w-2xl leading-relaxed mb-10"><T>{"Elige según lo que buscas: apoyar el proyecto o sumar beneficios para la continuidad de tu atención. Revisa lo que incluye cada plan antes de activarlo."}</T></p>
        <div className="grid md:grid-cols-2 gap-10">
          <article className="border-t border-current/25 pt-6">
            <p className="text-xs uppercase tracking-widest mb-3"><T>{"Para apoyar"}</T></p>
            <h3 className="text-2xl font-serif mb-3"><T>{"Membresía Básica"}</T></h3>
            <p className="leading-relaxed mb-5"><T>{"Una forma de apoyar la plataforma y acceder al contenido y a los beneficios del plan. No necesitas estar en tratamiento."}</T></p>
            {basica !== null && <p className="text-2xl font-serif mb-5">S/{basica} <span className="text-sm font-sans"><T>{"al mes"}</T></span></p>}
            <Link href="/planes#basica" className="inline-block underline"><T>{"Ver precio y beneficios de Básica →"}</T></Link>
          </article>
          <article className="border-t border-current/25 pt-6">
            <p className="text-xs uppercase tracking-widest mb-3"><T>{"Para dar continuidad"}</T></p>
            <h3 className="text-2xl font-serif mb-3"><T>{"Membresía EVIPro"}</T></h3>
            <p className="leading-relaxed mb-5"><T>{MEMBRESIA.texto}</T><T>{". Las consultas se cobran según la tarifa del plan."}</T></p>
            {desde !== null && <p className="text-2xl font-serif mb-5"><T>{"Desde S/"}</T>{desde} <span className="text-sm font-sans"><T>{"al mes"}</T></span></p>}
            <Link href="/planes#evipro" className="inline-block underline"><T>{"Comparar opciones EVIPro →"}</T></Link>
          </article>
        </div>
        <p className="text-sm border-t border-current/25 pt-6 mt-10"><T>{"Los sorteos son un beneficio adicional según el plan y las condiciones de cada sorteo. La membresía no garantiza un premio ni un resultado médico."}</T></p>
      </div>
    </section>
  )
}

export function Participar() {
  const caminos = [
    { titulo: 'Soy médico o profesional', texto: 'Propón atención, educación o una colaboración desde tu área. Evaluaremos tu experiencia y el alcance de tu propuesta.', enlace: 'Presentar mi propuesta' },
    { titulo: 'Represento una organización', texto: 'Conversemos sobre alianzas o propuestas de patrocinio. Cada colaboración requiere evaluación y un acuerdo de alcance.', enlace: 'Proponer una colaboración' },
  ]
  return <section className={SECCION}><div className={CAJA}><p className={ROTULO}><T>{"Construyamos juntos"}</T></p><h2 className="text-3xl md:text-4xl font-serif mb-10"><T>{"También puedes aportar lo que sabes."}</T></h2><div className="grid md:grid-cols-2 gap-10">{caminos.map(c => <article key={c.titulo} className="border-t border-subtle pt-6"><h3 className="text-xl mb-3"><T>{c.titulo}</T></h3><p className="text-muted leading-relaxed mb-5"><T>{c.texto}</T></p><Link href="/aliados#propuesta" className="text-brand underline"><T>{c.enlace}</T> →</Link></article>)}</div><p className="text-muted text-sm mt-10"><T>{"El apoyo y los patrocinios no determinan las recomendaciones médicas. Los aliados actuales se presentan por separado."}</T></p><Link href="/aliados" className="inline-block text-brand mt-4 underline"><T>{"Conocer a los aliados →"}</T></Link></div></section>
}

export function Modalidades() {
  return (
    <section id="modalidades" className="home-modalities px-6 py-20" aria-labelledby="modalidades-titulo">
      <div className={CAJA}>
        <p className="text-xs font-mono uppercase tracking-widest mb-5"><T>{"Atención médica"}</T></p>
        <div className="grid md:grid-cols-2 gap-6 mb-12 items-end">
          <h2 id="modalidades-titulo" className="text-3xl md:text-5xl font-serif leading-tight"><T>{"En Cusco."}</T><br /><T>{"O desde donde estés."}</T></h2>
          <p className="leading-relaxed max-w-md"><T>{"Consulta de cannabis medicinal con evaluación individual. La prescripción depende del criterio médico y de tu situación clínica."}</T></p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {(['presencial', 'virtual'] as const).map(modalidad => (
            <article key={modalidad} className="border-t border-current/25 pt-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <h3 className="text-2xl"><T>{modalidad === 'presencial' ? 'Consulta presencial' : 'Consulta online'}</T></h3>
                <p className="text-3xl font-serif">S/{precioReferencia(modalidad)}</p>
              </div>
              <p className="text-sm mt-3 mb-6"><T>{modalidad === 'presencial' ? MEDICO.direccion : 'Teleconsulta para pacientes en Perú.'}</T></p>
              <p className="text-xs mb-6"><T>{"Primera consulta · tarifa regular, sin membresía"}</T></p>
              <Link href={AGENDAR} className="inline-flex min-h-12 items-center border border-current rounded-full px-6 text-sm hover:bg-black/5"><T>{"Agendar "}</T><T>{modalidad === 'presencial' ? 'en Cusco' : 'online'}</T> <span aria-hidden="true" className="ml-6">↗</span></Link>
            </article>
          ))}
        </div>
        <Link href="/consulta-cannabis-medicinal" className="inline-block mt-10 underline underline-offset-4 text-sm"><T>{"Ver qué incluye la consulta y las tarifas de seguimiento"}</T></Link>
      </div>
    </section>
  )
}
export function CierreConsulta() {
  return <section className="px-6 py-20 border-t border-subtle"><div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8"><div><p className="text-brand text-xs font-mono uppercase tracking-widest mb-4"><T>{"EVIPro · Cusco y online"}</T></p><h2 className="text-3xl md:text-5xl font-serif"><T>{"Empecemos por escucharte."}</T></h2></div><Button href={AGENDAR} variant="outline" className="text-center"><T>{"Reservar mi consulta →"}</T></Button></div></section>
}
