'use client'

import { useState, useTransition } from 'react'
import { ESCALA, RECURSOS_AYUDA, type Ambito, type AmbitoId, type Color, type Resultado } from '@/lib/regen'
import { saveRegenEvaluacion } from './regen-actions'

const COLOR_UI: Record<Color, { emoji: string; label: string; cls: string }> = {
  verde:    { emoji: '🟢', label: 'Sano',              cls: 'text-brand' },
  amarillo: { emoji: '🟡', label: 'Atención',          cls: 'text-yellow-400' },
  rojo:     { emoji: '🔴', label: 'Te está desgastando', cls: 'text-red-400' },
}

export function RegenForm({ ambitos }: { ambitos: Ambito[] }) {
  const [valores, setValores] = useState<Record<string, number>>({})
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [err, setErr] = useState('')
  const [pending, startTransition] = useTransition()

  const totalPreguntas = ambitos.reduce((n, a) => n + a.preguntas.length, 0)
  const completo = Object.keys(valores).length === totalPreguntas

  function onSubmit() {
    setErr('')
    const raw = Object.entries(valores).map(([preguntaId, valor]) => ({ preguntaId, valor }))
    startTransition(async () => {
      const r = await saveRegenEvaluacion(raw)
      if (r.ok) setResultado(r.resultado)
      else setErr(r.error)
    })
  }

  // --- Pantalla de seguridad: corta el score cuando hay bandera roja ---
  if (resultado?.safetyTriggered) {
    return (
      <section className="mt-6 rounded-lg border border-red-500/50 bg-red-950/30 p-5">
        <h2 className="text-lg font-semibold text-red-300">Antes de seguir, hablemos de ti</h2>
        <p className="text-sm text-white/90 mt-2">
          Algo de lo que marcaste sugiere que estás pasando por una situación seria.
          Esto va más allá de una app: habla con alguien de confianza o con un profesional.
          No estás solo/a.
        </p>
        <ul className="mt-4 space-y-2">
          {RECURSOS_AYUDA.map((r, i) => (
            <li key={i} className="text-sm">
              <span className="font-medium text-white">{r.nombre}</span>
              {' — '}<span className="font-mono text-brand">{r.contacto}</span>
              <div className="text-xs text-faint">{r.detalle}</div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  // --- Resultado normal: semáforo + consejos ---
  if (resultado) {
    return (
      <section className="mt-6 space-y-4">
        {ambitos.map(a => {
          const color = resultado.colores[a.id as AmbitoId]
          const ui = COLOR_UI[color]
          return (
            <div key={a.id} className="rounded-lg border border-subtle p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{a.nombre}</span>
                <span className={`text-sm font-mono ${ui.cls}`}>{ui.emoji} {ui.label}</span>
              </div>
              {resultado.consejos[a.id as AmbitoId].length > 0 && (
                <ul className="mt-3 list-disc pl-5 text-sm text-faint space-y-1">
                  {resultado.consejos[a.id as AmbitoId].map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              )}
            </div>
          )
        })}
        <button
          onClick={() => { setResultado(null); setValores({}) }}
          className="text-xs font-mono px-3 py-1.5 rounded border border-subtle text-faint hover:text-white transition-colors"
        >
          Volver a evaluar
        </button>
      </section>
    )
  }

  // --- Cuestionario ---
  return (
    <div className="mt-6 space-y-8">
      {ambitos.map(a => (
        <fieldset key={a.id}>
          <legend className="font-medium">{a.nombre}</legend>
          <div className="mt-3 space-y-4">
            {a.preguntas.map(p => (
              <div key={p.id}>
                <p className="text-sm">{p.texto}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ESCALA.map((etiqueta, valor) => (
                    <label key={valor} className="flex items-center gap-1 text-xs font-mono text-faint cursor-pointer">
                      <input
                        type="radio"
                        name={p.id}
                        checked={valores[p.id] === valor}
                        onChange={() => setValores(v => ({ ...v, [p.id]: valor }))}
                      />
                      {etiqueta}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      {err && <p className="text-sm text-red-400 font-mono">{err}</p>}
      <button
        onClick={onSubmit}
        disabled={!completo || pending}
        className="px-4 py-2 rounded bg-brand text-black font-medium disabled:opacity-50"
      >
        {pending ? 'Calculando…' : completo ? 'Ver mi resultado' : `Responde las ${totalPreguntas} preguntas`}
      </button>
    </div>
  )
}
