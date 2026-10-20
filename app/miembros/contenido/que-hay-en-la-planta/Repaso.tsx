'use client'

import { useState } from 'react'
import { T, useLanguage } from '@/app/components/Language'
import type { Pregunta } from '@/lib/educacion/contenido-planta'

// Sin almacenamiento: las respuestas viven solo en el estado de la página.
export default function Repaso({ preguntas }: { preguntas: Pregunta[] }) {
  const { locale } = useLanguage()
  const [respuestas, setRespuestas] = useState<Record<string, number>>({})

  return <section className="border border-subtle rounded p-5 sm:p-6 space-y-8">
    <h2 className="text-xs font-mono uppercase tracking-widest text-brand"><T>Mini repaso</T></h2>
    {preguntas.map(pregunta => {
      const elegida = respuestas[pregunta.id]
      const respondida = elegida !== undefined
      return <div key={pregunta.id}>
        <p className="font-serif text-lg mb-3">{pregunta.enunciado[locale]}</p>
        <div className="flex flex-col gap-2">
          {pregunta.opciones.map((opcion, indice) => {
            const esElegida = elegida === indice
            const esCorrecta = pregunta.correcta === indice
            return <button key={indice} type="button" disabled={respondida}
              onClick={() => setRespuestas(previas => ({ ...previas, [pregunta.id]: indice }))}
              className={`text-left px-3 py-2 rounded border text-sm focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-default ${esElegida ? 'border-brand text-brand' : 'border-subtle text-muted'}`}>
              <span>{opcion[locale]}</span>
              {esElegida && <span className="ml-2 text-xs font-mono uppercase"><T>Tu respuesta</T></span>}
              {respondida && esCorrecta && <span className="ml-2 text-xs font-mono uppercase"><T>✓ Respuesta correcta</T></span>}
            </button>
          })}
        </div>
        <div role="status" aria-live="polite" className="mt-3 text-sm space-y-1">
          {respondida && <>
            <p className="font-medium">{elegida === pregunta.correcta ? <T>¡Correcto!</T> : <T>Esa no es correcta.</T>}</p>
            <p className="text-muted leading-6">{pregunta.explicacion[locale]}</p>
          </>}
        </div>
      </div>
    })}
  </section>
}
