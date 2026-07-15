'use client'

import { useState, useTransition } from 'react'
import { redeemCredit, donateCredit } from './actions'

export function CreditActions({ slug, token, id }: { slug: string; token: string; id: string }) {
  const [pending, startTransition] = useTransition()
  const [err, setErr] = useState('')

  function act(fn: (s: string, t: string, i: string) => Promise<{ ok: boolean; error?: string }>) {
    setErr('')
    startTransition(async () => {
      const r = await fn(slug, token, id)
      if (!r.ok) setErr(r.error ?? 'Error')
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act(redeemCredit)}
        disabled={pending}
        className="text-xs font-mono px-2.5 py-1 rounded bg-brand-deep hover:bg-brand-mid text-white transition-colors disabled:opacity-50"
      >
        Marcar canjeada
      </button>
      <button
        onClick={() => act(donateCredit)}
        disabled={pending}
        title="Libera el crédito del miembro y lo marca para el sorteo"
        className="text-xs font-mono px-2.5 py-1 rounded border border-subtle text-faint hover:text-white transition-colors disabled:opacity-50"
      >
        Mandar a sorteo
      </button>
      {err && <span className="text-xs text-red-400 font-mono">{err}</span>}
    </div>
  )
}
