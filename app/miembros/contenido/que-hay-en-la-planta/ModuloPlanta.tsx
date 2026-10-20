'use client'

import Link from 'next/link'
import { T, useLanguage } from '@/app/components/Language'
import { MOLECULAS, rutaPng, type MoleculaId } from '@/lib/educacion/moleculas'
import type { NivelModulo } from '@/lib/educacion/acceso-modulo'
import type { Fuente, Pregunta, Seccion, TipoAfirmacion } from '@/lib/educacion/contenido-planta'
import VisorMolecula from './VisorMolecula'
import SimuladorCalor from './SimuladorCalor'
import Repaso from './Repaso'

type Props = {
  nivel: Exclude<NivelModulo, 'sin_acceso'>
  secciones: Seccion[]
  preguntas: Pregunta[]
  fuentes: Fuente[]
  revision: { responsable: string; version: string | null }
  adminPreview: boolean
}

const ETIQUETA: Record<TipoAfirmacion, React.ReactNode> = {
  quimica: <T>Química</T>,
  personas: <T>Estudio en personas</T>,
  laboratorio: <T>Estudio de laboratorio o animales</T>,
  orientacion: <T>Orientación del equipo médico</T>,
}

function enlaceFuente(f: Fuente) {
  if (f.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${f.pmid}/`
  if (f.doi) return `https://doi.org/${f.doi}`
  return f.url
}

function Imagen2D({ id }: { id: MoleculaId }) {
  const { locale } = useLanguage()
  const m = MOLECULAS[id]
  return <figure className="border border-subtle rounded p-3 text-center">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={rutaPng(id)} alt={m.nombre[locale]} className="mx-auto h-40 w-auto max-w-full object-contain" />
    <figcaption className="text-sm mt-2">{m.nombre[locale]} <span className="font-mono text-xs text-faint">{m.formula}</span></figcaption>
  </figure>
}

function Visores({ seccion }: { seccion: Seccion }) {
  const { t } = useLanguage()
  switch (seccion.id) {
    case 'calor': return <SimuladorCalor />
    case 'arbol':
    case 'menores':
      return <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{seccion.moleculas.map(id => <Imagen2D key={id} id={id} />)}</div>
    case 'isomeros':
      return <div className="grid md:grid-cols-2 gap-4">
        <VisorMolecula molecula="thc" resaltar="anillo" etiquetaResaltado={t('anillo cerrado')} />
        <VisorMolecula molecula="cbd" resaltar="hidroxilos" etiquetaResaltado={t('anillo abierto')} />
      </div>
    default:
      return seccion.moleculas.length ? <div className="grid md:grid-cols-2 gap-4">
        {seccion.moleculas.map(id => <VisorMolecula key={id} molecula={id} />)}
      </div> : null
  }
}

function Bloque({ seccion }: { seccion: Seccion }) {
  const { locale } = useLanguage()
  return <section className="py-7">
    <h3 className="text-2xl font-serif mb-4">{seccion.titulo[locale]}</h3>
    <ul className="space-y-4 mb-6">
      {seccion.afirmaciones.map(a => <li key={a.id}>
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-1">{ETIQUETA[a.tipo]}</p>
        <p className="text-sm leading-6 text-muted max-w-2xl">{a[locale]}</p>
      </li>)}
    </ul>
    <Visores seccion={seccion} />
  </section>
}

export default function ModuloPlanta({ nivel, secciones, preguntas, fuentes, revision, adminPreview }: Props) {
  const seguridad = secciones.filter(s => s.parte === 'todos')
  const abiertas = secciones.filter(s => s.parte === 'abierta')
  const evipro = secciones.filter(s => s.parte === 'evipro')
  const { locale } = useLanguage()

  return <div>
    <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3"><T>Contenido</T></p>
    <h1 className="text-3xl sm:text-4xl font-serif mb-6"><T>¿Qué hay en la planta?</T></h1>
    {revision.version === null && <p className="border-l-2 border-brand p-4 text-brand text-sm mb-4"><T>Borrador · pendiente de revisión médica</T></p>}
    {adminPreview && <p className="border-l-2 border-brand p-4 text-brand text-sm mb-6"><T>Modo admin · vista previa del módulo.</T></p>}

    {seguridad.map(s => <aside key={s.id} className="border-l-2 border-brand bg-brand/5 p-5 mb-8">
      <h2 className="font-medium mb-3">{s.titulo[locale]}</h2>
      <ul className="space-y-3">
        {s.afirmaciones.map(a => <li key={a.id}>
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-1">{ETIQUETA[a.tipo]}</p>
          <p className="text-sm leading-6 text-muted">{a[locale]}</p>
        </li>)}
      </ul>
    </aside>)}

    {abiertas.length > 0 && <div className="divide-y divide-subtle">
      <h2 className="text-xs font-mono uppercase tracking-widest text-brand pb-3"><T>Lo que hueles y lo que ves</T></h2>
      {abiertas.map(s => <Bloque key={s.id} seccion={s} />)}
    </div>}

    {nivel === 'parcial' ? <div className="border border-subtle rounded p-6 mt-8 opacity-90">
      <h2 className="text-2xl font-serif mb-2"><T>Los cannabinoides</T></h2>
      <p className="text-sm text-muted mb-4"><T>Cómo cambian con el calor, qué los distingue y cómo se degradan, con moléculas en 3D y un simulador.</T></p>
      <Link href="/planes#membresias" className="inline-block text-brand underline py-2"><T>Ver Membresía EVIPro →</T></Link>
    </div> : evipro.length > 0 && <div className="divide-y divide-subtle mt-8">
      <h2 className="text-xs font-mono uppercase tracking-widest text-brand pb-3"><T>Los cannabinoides</T></h2>
      {evipro.map(s => <Bloque key={s.id} seccion={s} />)}
    </div>}

    <div className="mt-10"><Repaso preguntas={preguntas} /></div>

    <section className="mt-10 border-t border-subtle pt-6">
      <h2 className="text-xs font-mono uppercase tracking-widest text-brand mb-3"><T>Fuentes</T></h2>
      <ul className="space-y-1 text-sm text-muted">
        {fuentes.map(f => {
          const href = enlaceFuente(f)
          return <li key={f.cita}>{href
            ? <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{f.cita}</a>
            : f.cita}</li>
        })}
      </ul>
      {revision.version !== null && <p className="text-xs font-mono text-faint mt-6">
        <T values={{ responsable: revision.responsable, version: revision.version }}>{'Revisado por {responsable} · versión {version}'}</T>
      </p>}
    </section>
  </div>
}
