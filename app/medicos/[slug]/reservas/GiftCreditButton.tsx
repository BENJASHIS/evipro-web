'use client'

import { useState, useTransition } from 'react'
import { mintCredit } from './actions'

// Botón para acuñar una consulta gratis a un miembro desde una reserva suya.
// Solo aparece si la reserva está ligada a una cuenta (userId presente).
export function GiftCreditButton(
  { slug, token, userId, memberName }:
  { slug: string; token: string; userId: string | null; memberName: string },
) {
  const [pending, startTransition] = useTransition()
  const [gifted, setGifted] = useState(false)
  const [err, setErr] = useState('')

  if (!userId) return null
  if (gifted) return <span className="text-xs font-mono text-brand shrink-0">🎁 Dada</span>

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button
        onClick={() => {
          setErr('')
          startTransition(async () => {
            const r = await mintCredit(slug, token, userId, memberName)
            if (r.ok) setGifted(true)
            else setErr(r.error ?? 'Error')
          })
        }}
        disabled={pending}
        title="Acuña 1 crédito de consulta gratis para este miembro"
        className="text-xs font-mono px-3 py-1.5 rounded border border-brand/40 text-brand hover:bg-brand/10 transition-colors disabled:opacity-50"
      >
        🎁 Dar consulta gratis
      </button>
      {err && <span className="text-xs text-red-400 font-mono">{err}</span>}
    </div>
  )
}
