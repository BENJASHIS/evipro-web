'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { T, useLanguage } from '@/app/components/Language'
import { MOLECULAS, rutaPng, rutaSdf, type MoleculaId } from '@/lib/educacion/moleculas'
import { atomosAcido, atomosAnilloOxigeno, atomosHidroxiloFenol } from '@/lib/educacion/resaltado'

const NARANJA = '#ff9f0a'
const RESALTADO = { acido: atomosAcido, anillo: atomosAnilloOxigeno, hidroxilos: atomosHidroxiloFenol }
// 3Dmol escucha estos eventos en su canvas con preventDefault: sin cortarlos, atrapa el desplazamiento de la página.
const EVENTOS_DESPLAZAMIENTO = ['wheel', 'touchstart', 'touchmove']

type Props = { molecula: MoleculaId; resaltar?: keyof typeof RESALTADO; etiquetaResaltado?: string; alto?: number }
type Visor3D = { clear(): void; spin(eje: 'y' | false, velocidad?: number): void; getCanvas(): HTMLCanvasElement }

// Solo libera un contexto propio del lienzo. Con OffscreenCanvas, 3Dmol comparte un único contexto WebGL entre
// visores y pinta su lienzo con 'bitmaprenderer': ahí getContext('webgl*') devuelve null y el compartido no se toca.
function perderContexto(gl: unknown) {
  (gl as { getExtension?: (n: string) => { loseContext?: () => void } | null } | null)
    ?.getExtension?.('WEBGL_lose_context')?.loseContext?.()
}

let webgl: boolean | undefined
function hayWebGL() {
  if (webgl === undefined) try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    perderContexto(gl)
    webgl = !!gl
  } catch { webgl = false }
  return webgl
}

const sinSuscripcion = () => () => {}
export function BotonPantallaCompleta({ objetivo }: { objetivo: RefObject<HTMLElement | null> }) {
  const disponible = useSyncExternalStore(sinSuscripcion,
    () => typeof document.documentElement.requestFullscreen === 'function', () => false)
  if (!disponible) return null
  return <button type="button" className="mt-2 text-xs text-brand underline"
    onClick={() => { Promise.resolve(objetivo.current?.requestFullscreen()).catch(() => {}) }}>
    <T>Pantalla completa</T>
  </button>
}

// key: al cambiar de molécula o resaltado se reinicia todo (canvas y respaldo)
export default function VisorMolecula(props: Props) {
  return <Visor key={`${props.molecula}:${props.resaltar ?? ''}`} {...props} />
}

function Visor({ molecula, resaltar, etiquetaResaltado, alto = 320 }: Props) {
  const { locale } = useLanguage()
  const raiz = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLDivElement>(null)
  const dedo = useRef(false)
  const [respaldo, setRespaldo] = useState(false)
  const [girarConDedo, setGirarConDedo] = useState(false)
  const nombre = MOLECULAS[molecula].nombre[locale]

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !hayWebGL()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- detección de capacidades solo posible en cliente
      setRespaldo(true)
      return
    }
    const contenedor = lienzo.current
    const quieto = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let vivo = true
    let cargando = false
    let visible = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let visor: Visor3D | undefined
    // 3Dmol re-renderiza cada 25 ms mientras gira: solo gira en pantalla.
    const girar = () => visor?.spin(visible && !quieto ? 'y' : false, 0.4)
    // En captura, antes que 3Dmol: la rueda siempre desplaza la página; el dedo también, salvo «Girar con el dedo».
    const cederPagina = (e: Event) => { if (e.type === 'wheel' || !dedo.current) e.stopPropagation() }
    EVENTOS_DESPLAZAMIENTO.forEach(t => contenedor?.addEventListener(t, cederPagina, { capture: true, passive: true }))
    const obs = new IntersectionObserver(async entradas => {
      visible = !!entradas[entradas.length - 1]?.isIntersecting
      girar()
      if (!visible || cargando) return
      cargando = true
      timer = setTimeout(() => vivo && setRespaldo(true), 8000)
      try {
        const mod = await import('3dmol')
        const $3Dmol = 'createViewer' in mod ? mod : (mod as unknown as { default: typeof mod }).default
        const resp = await fetch(rutaSdf(molecula))
        if (!resp.ok) throw new Error('sdf')
        const sdf = await resp.text()
        if (!vivo || !lienzo.current) return
        const v = $3Dmol.createViewer(lienzo.current, { backgroundColor: 'rgba(0,0,0,0)' })
        visor = v
        const modelo = v.addModel(sdf, 'sdf')
        const atomos = modelo.selectedAtoms({}) as { index: number; elem: string; bonds: number[] }[]
        const simples = atomos.map(a => ({ elem: a.elem, bonds: a.bonds }))
        const marcados = resaltar ? RESALTADO[resaltar](simples) : []
        const idx = (pos: number[]) => pos.map(p => atomos[p].index)
        v.setStyle({}, { stick: { radius: 0.16 }, sphere: { scale: 0.22 } })
        v.setStyle({ elem: 'H' }, {})
        if (marcados.length) v.setStyle({ index: idx(marcados) }, { stick: { radius: 0.2, color: NARANJA }, sphere: { scale: 0.32, color: NARANJA } })
        v.zoomTo(); v.zoom(1.6); v.render()
        girar()
        clearTimeout(timer)
      } catch { if (vivo) setRespaldo(true) }
    })
    if (raiz.current) obs.observe(raiz.current)
    return () => {
      vivo = false; clearTimeout(timer); obs.disconnect()
      EVENTOS_DESPLAZAMIENTO.forEach(t => contenedor?.removeEventListener(t, cederPagina, { capture: true }))
      visor?.spin(false); visor?.clear()
      const c = visor?.getCanvas()
      perderContexto(c?.getContext('webgl2') ?? c?.getContext('webgl'))
      contenedor?.replaceChildren()
    }
  }, [molecula, resaltar])

  const resumen = `${nombre} · ${MOLECULAS[molecula].formula}`
  const conEtiqueta = !!(resaltar && etiquetaResaltado)
  return (
    <div ref={raiz} className="rounded border border-subtle p-3 [&:fullscreen]:bg-ink [&:fullscreen]:overflow-auto">
      {respaldo ? (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={rutaPng(molecula)} alt={nombre} className="max-w-full bg-white rounded" style={{ maxHeight: alto }} />
        </div>
      ) : (
        <div ref={lienzo} role="img" aria-label={conEtiqueta ? `${resumen}. ${etiquetaResaltado}` : resumen}
          className="relative w-full [:fullscreen_&]:h-[70vh]!" style={{ height: alto }} />
      )}
      <p className="mt-2 text-sm text-muted">{resumen}</p>
      {/* El punto naranja solo tiene sentido sobre el 3D; la imagen 2D no lleva nada naranja. */}
      {conEtiqueta && <p className="mt-2 text-sm">{!respaldo && <span aria-hidden="true" style={{ color: NARANJA }}>● </span>}{etiquetaResaltado}</p>}
      {!respaldo && <div className="flex flex-wrap gap-x-4">
        <button type="button" aria-pressed={girarConDedo} className="mt-2 text-xs text-brand underline pointer-fine:hidden"
          onClick={() => { dedo.current = !girarConDedo; setGirarConDedo(!girarConDedo) }}>
          {girarConDedo && <span aria-hidden="true">✓ </span>}<T>Girar con el dedo</T>
        </button>
        <BotonPantallaCompleta objetivo={raiz} />
      </div>}
    </div>
  )
}
