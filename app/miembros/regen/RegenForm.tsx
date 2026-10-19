'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { T, useLanguage } from '@/app/components/Language'
import { ESCALA, supportFlagsFor, type Ambito, type Resultado } from '@/lib/regen'
import { saveRegenEvaluacion } from './regen-actions'
import { RegenResult, RegenSupport } from './RegenResults'

export function RegenForm({ ambitos }: { ambitos: Ambito[] }) {
  const { t } = useLanguage()
  const [valores, setValores] = useState<Record<string, number>>({})
  const [paso, setPaso] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [pending, startTransition] = useTransition()
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [paso, resultado])

  const actual = ambitos[paso]
  const total = ambitos.reduce((n, a) => n + a.preguntas.length, 0)
  const raw = Object.entries(valores).map(([preguntaId, valor]) => ({ preguntaId, valor }))
  const completeStep = actual.preguntas.every(p => Object.hasOwn(valores, p.id))
  const support = supportFlagsFor(raw).length > 0

  function next() {
    setErr('')
    if (!completeStep) return
    if (paso < ambitos.length - 1) { setPaso(paso + 1); return }
    startTransition(async () => {
      try {
        const response = await saveRegenEvaluacion(raw)
        if (response.ok) { setResultado(response.resultado); setSaved(response.saved) }
        else setErr(response.error)
      } catch {
        setErr('No se pudo completar la evaluación. Tus respuestas siguen aquí; vuelve a intentarlo.')
      }
    })
  }

  if (resultado) return <section className="mt-8">
    <h2 tabIndex={-1} ref={heading} className="font-serif text-2xl mb-3"><T>Tu resumen de reflexión</T></h2>
    <p className="text-sm text-muted mb-5"><T>Regen usa preguntas propias y no es una escala clínica validada. Un resultado bajo no descarta dificultades ni situaciones de riesgo.</T></p>
    <p role={saved ? 'status' : 'alert'} className="text-sm text-muted mb-6">
      <T>{saved ? 'Resumen guardado en tu historial.' : 'Puedes leer tu resumen, pero no se pudo guardar en el historial.'}</T>
    </p>
    <RegenResult resultado={resultado} />
    <button type="button" className="border border-subtle rounded px-5 py-3 text-sm mt-6"
      onClick={() => { setResultado(null); setValores({}); setPaso(0); setErr('') }}><T>Empezar otra reflexión</T></button>
  </section>

  return <div className="mt-8 space-y-6">
    <p className="text-sm text-muted"><T>Piensa en las últimas dos semanas. Elige la frecuencia que mejor describa tu experiencia; no hay respuestas correctas o incorrectas.</T></p>
    <div>
      <p className="text-xs text-muted mb-2" aria-live="polite"><T values={{ paso: paso + 1, total: ambitos.length, respuestas: raw.length, preguntas: total }}>{'Ámbito {paso} de {total} · {respuestas} de {preguntas} respuestas'}</T></p>
      <progress max={total} value={raw.length} aria-label={t('Progreso de respuestas')} aria-valuenow={raw.length} className="w-full h-2 accent-brand" />
    </div>
    <h2 tabIndex={-1} ref={heading} className="font-serif text-2xl"><T>{actual.nombre}</T></h2>
    {actual.preguntas.map(pregunta => <fieldset key={pregunta.id} className="border-t border-subtle pt-5" disabled={pending}>
      <legend className="text-base pr-3"><T>{pregunta.texto}</T></legend>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
        {ESCALA.map((label, value) => <label key={value} className={`flex gap-2 items-center text-sm border rounded px-3 py-3 cursor-pointer ${valores[pregunta.id] === value ? 'border-brand bg-brand/10' : 'border-subtle'}`}>
          <input type="radio" name={pregunta.id} value={value} checked={valores[pregunta.id] === value}
            onChange={() => setValores(previous => ({ ...previous, [pregunta.id]: value }))} />
          <T>{label}</T>
        </label>)}
      </div>
    </fieldset>)}
    {support && <RegenSupport />}
    {err && <p role="alert" className="text-sm text-red-300"><T>{err}</T></p>}
    <div className="flex flex-wrap gap-3 pt-3">
      {paso > 0 && <button type="button" disabled={pending} className="border border-subtle rounded px-5 py-3 text-sm disabled:opacity-50" onClick={() => setPaso(paso - 1)}><T>← Anterior</T></button>}
      <button type="button" onClick={next} disabled={!completeStep || pending}
        className="bg-brand text-black rounded px-5 py-3 text-sm disabled:opacity-50">
        <T>{pending ? 'Preparando resumen…' : paso < ambitos.length - 1 ? 'Siguiente ámbito →' : 'Ver mi resumen'}</T>
      </button>
    </div>
    {!completeStep && <p className="text-xs text-muted"><T>Responde las cuatro preguntas de este ámbito para continuar. Puedes volver al anterior sin perder tus respuestas.</T></p>}
  </div>
}
