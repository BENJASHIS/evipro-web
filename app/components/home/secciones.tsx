import Link from 'next/link'
import type { ReactNode } from 'react'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import { escaleraReserva } from '@/lib/consulta-pricing'
import {
  HERO, INDICACIONES_PORTADA, PARA_QUE_NO, PREGUNTAS, PASOS_PRIMERA_CONSULTA,
  OTRAS_ESPECIALIDADES, ESPECIALIDADES_PROXIMAS, MEDICO, RENPUC_NOMBRE, WHATSAPP, MEMBRESIA,
  EVIDENCIA_PUBLICA,
} from '@/lib/home-content'

const AGENDAR = '/medicos/dr-jara/agendar'
const SECCION = 'border-t border-subtle py-14 px-6'
const CAJA = 'max-w-5xl mx-auto'
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
    <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
      <Badge className="mb-6">{HERO.etiqueta}</Badge>
      <h1 className="text-4xl md:text-5xl font-light font-serif italic leading-tight mb-6 max-w-2xl">
        {HERO.titulo}<br />{HERO.titulo2}
      </h1>
      <p className="text-muted text-lg mb-8 max-w-xl">{HERO.subtitulo}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary" href={AGENDAR}>Agendar consulta →</Button>
        <a
          href={`https://wa.me/51${WHATSAPP}`}
          className="text-muted text-sm hover:text-brand transition-colors"
        >
          o escríbenos por WhatsApp
        </a>
      </div>
      <p className="text-faint text-sm mt-8">{HERO.credenciales}</p>
    </section>
  )
}

export function ParaQueSi() {
  return (
    <section className={SECCION}>
      <div className={CAJA}>
        <h2 className={ROTULO}>Para qué sí</h2>
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
        <p className={ROTULO}>Para qué no</p>
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
        <p className={ROTULO}>Evidencia y límites</p>
        <h2 className="text-2xl font-light font-serif italic mb-3">
          No todo paciente necesita cannabis.
        </h2>
        <p className="text-muted leading-relaxed max-w-2xl mb-8">
          La consulta decide si corresponde, qué riesgos revisar y cuándo buscar otra ruta.
          Estas fuentes públicas orientan el criterio clínico.
        </p>
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
        <h2 className={ROTULO}>Lo que todos preguntan</h2>
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
  return (
    <section className={SECCION}>
      <div className={CAJA}>
        <h2 className={ROTULO}>Quién te atiende</h2>
        <h3 className="text-xl font-light mb-2">{MEDICO.nombre}</h3>
        <p className="text-muted text-sm leading-relaxed">
          {MEDICO.especialidades}<br />
          {MEDICO.credenciales}<br />
          {MEDICO.direccion}
        </p>
      </div>
    </section>
  )
}

export function PrimeraConsulta() {
  return (
    <section className={SECCION}>
      <div className={CAJA}>
        <h2 className={ROTULO}>Cómo es la primera consulta</h2>
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
        <p className="text-faint text-xs mt-5">
          Presencial: {escaleraReserva('presencial')} · Virtual: {escaleraReserva('virtual')}
        </p>
      </div>
    </section>
  )
}

export function OtrasEspecialidades() {
  return (
    <section className={SECCION}>
      <div className={CAJA}>
        <h2 className={ROTULO}>También atendemos</h2>
        <p className="text-muted leading-relaxed">
          {OTRAS_ESPECIALIDADES.join(' · ')}{' '}
          <span className="text-faint">
            (+ {ESPECIALIDADES_PROXIMAS.join(' y ').toLowerCase()}, pronto)
          </span>
        </p>
      </div>
    </section>
  )
}

export function Membresia({ desde }: { desde: number | null }) {
  return (
    <section className={`${SECCION} bg-white/[0.02]`}>
      <div className={CAJA}>
        <h2 className="text-2xl font-light font-serif italic mb-3">
          {MEMBRESIA.titulo}
        </h2>
        <p className="text-muted leading-relaxed max-w-2xl mb-6">
          {MEMBRESIA.texto}
          {desde !== null && <>, desde <span className="text-white">S/. {desde}</span> al mes</>}.
        </p>
        <Link
          href="/planes"
          className="inline-block border border-strong rounded px-6 py-2 font-mono text-sm hover:border-white/50 transition-colors"
        >
          {MEMBRESIA.cta} →
        </Link>
      </div>
    </section>
  )
}
