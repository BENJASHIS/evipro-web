'use client'

import { useState } from 'react'
import { T, useLanguage } from '@/app/components/Language'

export default function DudaForm() {
  const { t } = useLanguage()
  const [pregunta, setPregunta] = useState('')
  const [correo, setCorreo] = useState('')

  return <form className="space-y-5 max-w-2xl" onSubmit={event => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity() || !pregunta.trim()) return
    setCorreo(`mailto:consulta@evipro.pe?subject=${encodeURIComponent(t('Dudas del viajero · EVIPro'))}&body=${encodeURIComponent(pregunta.trim())}`)
  }}>
    <div>
      <label htmlFor="pregunta-viajero" className="block mb-2 text-sm"><T>Tu pregunta</T></label>
      <p id="pregunta-ayuda" className="text-muted text-sm mb-3"><T>Escribe una duda general. No incluyas diagnósticos, recetas, documentos ni datos de otras personas.</T></p>
      <textarea id="pregunta-viajero" required maxLength={1200} rows={4}
        aria-describedby="pregunta-ayuda" value={pregunta}
        onChange={event => { setPregunta(event.target.value); setCorreo('') }}
        className="w-full border border-subtle bg-surface rounded p-3 text-white" />
    </div>
    <label className="flex items-start gap-3 text-sm text-muted">
      <input type="checkbox" required className="mt-1" onChange={() => setCorreo('')} />
      <span><T>Entiendo que este espacio no atiende urgencias ni sustituye una consulta médica.</T></span>
    </label>
    <button type="submit" className="bg-brand text-black rounded px-6 py-3 text-sm hover:opacity-90"><T>Preparar correo</T></button>
    {correo && <div className="border-t border-subtle pt-5 space-y-3">
      <p role="status" className="text-sm text-muted"><T>Tu pregunta todavía no se ha enviado. Abre tu aplicación de correo, revisa el mensaje y envíalo.</T></p>
      <a href={correo} className="inline-block text-brand underline"><T>Abrir mi correo →</T></a>
    </div>}
    <p className="text-sm text-muted"><T>Si no tienes una aplicación de correo configurada, escribe directamente a</T>{' '}
      <a href="mailto:consulta@evipro.pe" className="text-brand underline">consulta@evipro.pe</a>.
    </p>
  </form>
}
