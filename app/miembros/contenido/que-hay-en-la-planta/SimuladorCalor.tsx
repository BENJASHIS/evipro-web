'use client'

import { useId, useState } from 'react'
import { T, useLanguage } from '@/app/components/Language'
import {
  TEMPERATURAS, type Temperatura, constanteTHCA, fraccionTHCARestante,
  CASI_CERO_MEDIDO, PERDIDA_TOTAL_110_PCT, FUENTE_WANG, formatoPorcentaje,
} from '@/lib/educacion/descarboxilacion'
import VisorMolecula from './VisorMolecula'

export default function SimuladorCalor() {
  const { locale, t } = useLanguage()
  const id = useId()
  const [temp, setTemp] = useState<Temperatura>(110)
  const [minutos, setMinutos] = useState(0)

  const restante = fraccionTHCARestante(temp, minutos) * 100
  const pct = formatoPorcentaje(restante, locale, restante < 10 ? 1 : 0)
  const { origen } = constanteTHCA(temp)
  const casiCero = CASI_CERO_MEDIDO[temp]
  const mayoriaTHCA = restante >= 50

  return <section className="border border-subtle rounded p-5 sm:p-6">
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <p id={`${id}-temp`} className="text-xs font-mono uppercase tracking-widest text-brand mb-3"><T>Temperatura (°C)</T></p>
        <div role="radiogroup" aria-labelledby={`${id}-temp`} className="flex flex-wrap gap-2 mb-6">
          {TEMPERATURAS.map(valor => <label key={valor} className={`px-3 py-2 rounded border text-sm cursor-pointer focus-within:ring-2 focus-within:ring-brand ${valor === temp ? 'border-brand text-brand' : 'border-subtle text-muted'}`}>
            <input type="radio" name={`${id}-t`} value={valor} checked={valor === temp} onChange={() => setTemp(valor)} className="sr-only" />
            {valor} °C
          </label>)}
        </div>
        <label htmlFor={`${id}-min`} className="block text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>Tiempo (min)</T></label>
        <div className="flex items-center gap-3 mb-6">
          <input id={`${id}-min`} type="range" min={0} max={60} step={1} value={minutos}
            onChange={e => setMinutos(Number(e.target.value))} className="flex-1 accent-brand" />
          <span className="text-sm font-mono w-12 text-right">{minutos}</span>
        </div>
        <p className="text-2xl font-serif" aria-live="polite"><T values={{ pct }}>{'THCA que queda: {pct}'}</T></p>
        <p className="mt-2 text-sm text-muted">
          <span className="border border-subtle rounded px-2 py-0.5 text-xs font-mono">{origen === 'medido' ? <T>medido</T> : <T>estimado</T>}</span>
        </p>
        {casiCero !== undefined
          ? <p className="mt-3 text-sm text-muted"><T values={{ n: casiCero }}>{'En el estudio, casi cero a los {n} min'}</T></p>
          : <p className="mt-3 text-sm text-muted"><T>En el estudio no se completó en 60 min</T></p>}
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
  </section>
}
