'use client'

import { useId, useRef, useState } from 'react'
import { T, interpolar, useLanguage } from '@/app/components/Language'
import {
  TEMPERATURAS, type Temperatura, constanteTHCA, fraccionTHCARestante,
  CASI_CERO_MEDIDO, PERDIDA_TOTAL_110_PCT, FUENTE_WANG, formatoPorcentaje,
} from '@/lib/educacion/descarboxilacion'
import VisorMolecula, { BotonPantallaCompleta } from './VisorMolecula'

// Gráfico 0–60 min × 0–100 % en unidades del viewBox; se escala al ancho disponible (360 px incluidos).
const ANCHO = 260, ALTO = 160, IZQ = 36, DER = 8, ARR = 16, ABA = 22
const W = ANCHO - IZQ - DER, H = ALTO - ARR - ABA
const x = (min: number) => IZQ + (min / 60) * W
const y = (fraccion: number) => ARR + (1 - fraccion) * H

function Curva({ temp, minutos, pct }: { temp: Temperatura; minutos: number; pct: string }) {
  const { locale, t } = useLanguage()
  const { k, origen } = constanteTHCA(temp)
  const casiCero = CASI_CERO_MEDIDO[temp]
  const f = (min: number) => fraccionTHCARestante(temp, min)
  const linea = Array.from({ length: 61 }, (_, m) => `${m ? 'L' : 'M'}${x(m).toFixed(1)},${y(f(m)).toFixed(1)}`).join('')
  // «modelo» va a la derecha del cruce del 50 % (zona libre sobre la curva); si no cruza en 60 min, bajo el final.
  const mitad = Math.LN2 / (k * 60)
  const rotulo = mitad <= 60
    ? { x: x(mitad) + 6, y: y(0.5) + 4, anchor: 'start' as const }
    : { x: x(60) - 6, y: y(f(60)) + 15, anchor: 'end' as const }
  const resumen = `${interpolar(t('Gráfico del modelo de primer orden a {temp} °C ({constante}): THCA que queda de 0 a 60 min; ahora, {min} min y {pct}.'),
    { temp, constante: t(origen === 'medido' ? 'constante medida (Tabla 2)' : 'constante estimada (Arrhenius)'), min: minutos, pct })} ${
    casiCero !== undefined ? interpolar(t('En el estudio, casi cero a los {n} min'), { n: casiCero }) : t('En el estudio no se completó en 60 min')}.`
  const halo = { paintOrder: 'stroke' as const, strokeWidth: 3 }

  return <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={resumen} className="mt-4 w-full max-w-md h-auto" fontSize={11}>
    {[0, 0.5, 1].map(v => <g key={v}>
      <line x1={IZQ} x2={IZQ + W} y1={y(v)} y2={y(v)} className="stroke-subtle" />
      <text x={IZQ - 4} y={y(v) + 3} textAnchor="end" className="fill-faint">{formatoPorcentaje(v * 100, locale)}</text>
    </g>)}
    <line x1={IZQ} x2={IZQ} y1={ARR} y2={y(0)} className="stroke-strong" />
    <line x1={IZQ} x2={IZQ + W} y1={y(0)} y2={y(0)} className="stroke-strong" />
    {[0, 30, 60].map(m => <text key={m} x={x(m)} y={ALTO - 6} textAnchor={m ? (m === 60 ? 'end' : 'middle') : 'start'} className="fill-faint">{m === 60 ? '60 min' : m}</text>)}
    <path d={linea} fill="none" strokeWidth={2} className="stroke-brand" />
    <text x={rotulo.x} y={rotulo.y} textAnchor={rotulo.anchor} style={halo} className="fill-muted stroke-ink">
      {origen === 'medido' ? <T>modelo</T> : <T>modelo · constante estimada</T>}
    </text>
    <line x1={x(minutos)} x2={x(minutos)} y1={ARR} y2={y(0)} strokeDasharray="3 3" className="stroke-muted" />
    <circle cx={x(minutos)} cy={y(f(minutos))} r={4} strokeWidth={2} className="fill-ink stroke-brand" />
    <text x={x(minutos)} y={ARR - 5} textAnchor={minutos < 10 ? 'start' : minutos > 50 ? 'end' : 'middle'} className="fill-muted">{minutos} min</text>
    {casiCero !== undefined && <>
      <circle cx={x(casiCero)} cy={y(f(casiCero))} r={4.5} strokeWidth={2} className="fill-white stroke-ink" />
      <text x={x(casiCero) + 8} y={y(f(casiCero)) - 6} style={halo} className="fill-white stroke-ink"><T>medido</T></text>
    </>}
  </svg>
}

export default function SimuladorCalor() {
  const { locale, t } = useLanguage()
  const id = useId()
  const seccion = useRef<HTMLElement>(null)
  const [temp, setTemp] = useState<Temperatura>(110)
  const [minutos, setMinutos] = useState(0)

  const restante = fraccionTHCARestante(temp, minutos) * 100
  const pct = formatoPorcentaje(restante, locale, restante < 10 ? 1 : 0)
  const { origen } = constanteTHCA(temp)
  const casiCero = CASI_CERO_MEDIDO[temp]
  const mayoriaTHCA = restante >= 50

  return <section ref={seccion} className="border border-subtle rounded p-5 sm:p-6 [&:fullscreen]:bg-ink [&:fullscreen]:overflow-auto">
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <p id={`${id}-temp`} className="text-xs font-mono uppercase tracking-widest text-brand mb-3"><T>Temperatura (°C)</T></p>
        <div role="radiogroup" aria-labelledby={`${id}-temp`} className="flex flex-wrap gap-2 mb-6">
          {TEMPERATURAS.map(valor => <label key={valor} className={`px-3 py-2 rounded border text-sm cursor-pointer focus-within:ring-2 focus-within:ring-brand ${valor === temp ? 'border-brand text-brand font-semibold' : 'border-subtle text-muted'}`}>
            <input type="radio" name={`${id}-t`} value={valor} checked={valor === temp} onChange={() => setTemp(valor)} className="sr-only" />
            {valor === temp && <span aria-hidden="true">● </span>}{valor} °C
          </label>)}
        </div>
        <label htmlFor={`${id}-min`} className="block text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>Tiempo (min)</T></label>
        <div className="flex items-center gap-3 mb-6">
          <input id={`${id}-min`} type="range" min={0} max={60} step={1} value={minutos} aria-valuetext={`${minutos} min`}
            onChange={e => setMinutos(Number(e.target.value))} className="flex-1 accent-brand" />
          <span className="text-sm font-mono w-12 text-right">{minutos}</span>
        </div>
        <p className="text-2xl font-serif" aria-live="polite"><T values={{ pct }}>{'THCA que queda: {pct}'}</T></p>
        <p className="mt-1 text-xs text-muted"><T>calculado con un modelo de primer orden</T></p>
        <p className="mt-2 text-sm text-muted">
          <span className="border border-subtle rounded px-2 py-0.5 text-xs font-mono">{origen === 'medido' ? <T>constante medida (Tabla 2)</T> : <T>constante estimada (Arrhenius)</T>}</span>
        </p>
        {casiCero !== undefined
          ? <p className="mt-3 text-sm text-muted"><T values={{ n: casiCero }}>{'En el estudio, casi cero a los {n} min'}</T></p>
          : <p className="mt-3 text-sm text-muted"><T>En el estudio no se completó en 60 min</T></p>}
        <Curva temp={temp} minutos={minutos} pct={pct} />
      </div>
      <VisorMolecula
        molecula={mayoriaTHCA ? 'thca' : 'thc'}
        resaltar={mayoriaTHCA ? 'acido' : undefined}
        etiquetaResaltado={mayoriaTHCA ? t('grupo ácido · sale CO₂') : undefined}
      />
    </div>
    <div className="border-l-2 border-brand bg-brand/5 p-4 mt-6 text-sm text-muted leading-6 space-y-2">
      <p><T>Condiciones del estudio: extractos de cannabis en horno al vacío, sin oxígeno ni luz.</T></p>
      <p><T values={{ pct: formatoPorcentaje(100 - PERDIDA_TOTAL_110_PCT, locale) }}>{'A 110 °C, cerca de {pct} se recuperó como THC.'}</T></p>
      <p><T values={{ cita: FUENTE_WANG.cita, pmid: FUENTE_WANG.pmid }}>{'Fuente: {cita}, PMID {pmid}.'}</T> <a href={FUENTE_WANG.url} target="_blank" rel="noopener noreferrer" className="text-brand underline"><T>Ver el estudio</T></a></p>
    </div>
    <BotonPantallaCompleta objetivo={seccion} />
  </section>
}
