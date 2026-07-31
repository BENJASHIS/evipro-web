'use client'
import { useState } from 'react'

const RASTREADOR_SHALOM = 'https://shalom.com.pe/rastrea-tu-envio'

/** Número de guía con copiar y enlace al rastreador de Shalom.
 *
 *  A propósito NO hay integración: Shalom no publica API oficial y los
 *  wrappers de terceros piden la clave por WhatsApp — no se mete a un tercero
 *  entre el paciente y su tratamiento por ahorrarle un pegado. Aquí solo viaja
 *  un código de courier que escribe el propio consultorio. */
export default function Guia({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <span className="text-xs text-muted font-mono">Guía:</span>
      <span className="text-xs text-white font-mono">{codigo}</span>
      <button
        type="button"
        onClick={copiar}
        className="text-xs font-mono text-brand hover:underline"
      >
        {copiado ? '✓ copiado' : 'copiar'}
      </button>
      <a
        href={RASTREADOR_SHALOM}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-mono text-brand hover:underline"
      >
        rastrear en Shalom →
      </a>
    </div>
  )
}
