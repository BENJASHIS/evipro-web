'use client'

import { useEffect, useRef, useState } from 'react'
import { T, useLanguage } from '@/app/components/Language'
import { MOLECULAS, rutaPng, rutaSdf, type MoleculaId } from '@/lib/educacion/moleculas'
import { atomosAcido, atomosAnilloOxigeno } from '@/lib/educacion/resaltado'

const NARANJA = '#ff9f0a'

type Props = { molecula: MoleculaId; resaltar?: 'acido' | 'anillo'; etiquetaResaltado?: string; alto?: number }

function hayWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export default function VisorMolecula({ molecula, resaltar, etiquetaResaltado, alto = 320 }: Props) {
  const { locale } = useLanguage()
  const raiz = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLDivElement>(null)
  const [respaldo, setRespaldo] = useState(false)
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const nombre = MOLECULAS[molecula].nombre[locale]

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- detección de capacidades solo posible en cliente
    setPantallaCompleta(typeof document.documentElement.requestFullscreen === 'function')
    if (typeof IntersectionObserver === 'undefined' || !hayWebGL()) { setRespaldo(true); return }
    let vivo = true
    let timer: ReturnType<typeof setTimeout> | undefined
    let visor: { clear: () => void } | undefined
    const obs = new IntersectionObserver(async ([entrada]) => {
      if (!entrada?.isIntersecting) return
      obs.disconnect()
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
        const marcados = resaltar === 'acido' ? atomosAcido(simples) : resaltar === 'anillo' ? atomosAnilloOxigeno(simples) : []
        const idx = (pos: number[]) => pos.map(p => atomos[p].index)
        v.setStyle({}, { stick: { radius: 0.16 }, sphere: { scale: 0.22 } })
        v.setStyle({ elem: 'H' }, {})
        if (marcados.length) v.setStyle({ index: idx(marcados) }, { stick: { radius: 0.2, color: NARANJA }, sphere: { scale: 0.32, color: NARANJA } })
        v.zoomTo(); v.zoom(1.6); v.render()
        if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) v.spin('y', 0.4)
        clearTimeout(timer)
      } catch { if (vivo) setRespaldo(true) }
    })
    if (raiz.current) obs.observe(raiz.current)
    return () => { vivo = false; clearTimeout(timer); obs.disconnect(); visor?.clear() }
  }, [molecula, resaltar])

  return (
    <div ref={raiz} className="rounded border border-subtle p-3">
      {respaldo ? (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={rutaPng(molecula)} alt={nombre} className="max-w-full bg-white rounded" style={{ maxHeight: alto }} />
          <p className="text-sm text-muted">{nombre} · {MOLECULAS[molecula].formula}</p>
        </div>
      ) : (
        <>
          <div ref={lienzo} className="relative w-full" style={{ height: alto }} />
          {resaltar && etiquetaResaltado && (
            <p className="mt-2 text-sm"><span style={{ color: NARANJA }}>●</span> {etiquetaResaltado}</p>
          )}
          {pantallaCompleta && (
            <button type="button" className="mt-2 text-xs text-brand underline" onClick={() => raiz.current?.requestFullscreen()}>
              <T>Pantalla completa</T>
            </button>
          )}
        </>
      )}
    </div>
  )
}
