'use client'

import { useState, useTransition } from 'react'
import { confirmBooking, cancelBooking, mintCredit } from './actions'

export function BookingActions(
  { slug, token, id, userId, memberName }:
  { slug: string; token: string; id: string; userId: string | null; memberName: string },
) {
  const [pending, startTransition] = useTransition()
  const [showCancel, setShowCancel] = useState(false)
  const [reason, setReason] = useState('')
  const [err, setErr] = useState('')
  const [gifted, setGifted] = useState(false)

  function onGift() {
    setErr('')
    startTransition(async () => {
      const r = await mintCredit(slug, token, userId!, memberName)
      if (r.ok) setGifted(true)
      else setErr(r.error ?? 'Error')
    })
  }

  function onConfirm() {
    setErr('')
    startTransition(async () => {
      const r = await confirmBooking(slug, token, id)
      if (!r.ok) setErr(r.error ?? 'Error')
    })
  }

  function onCancel() {
    setErr('')
    startTransition(async () => {
      const r = await cancelBooking(slug, token, id, reason)
      if (r.ok) { setShowCancel(false); setReason('') }
      else setErr(r.error ?? 'Error')
    })
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={pending}
          className="text-xs font-mono px-3 py-1.5 rounded bg-brand-deep hover:bg-brand-mid text-white transition-colors disabled:opacity-50"
        >
          Confirmar
        </button>
        <button
          onClick={() => setShowCancel(v => !v)}
          disabled={pending}
          className="text-xs font-mono px-3 py-1.5 rounded border border-subtle text-faint hover:text-white transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        {userId && (
          gifted ? (
            <span className="text-xs font-mono px-3 py-1.5 text-brand">🎁 Consulta gratis dada</span>
          ) : (
            <button
              onClick={onGift}
              disabled={pending}
              title="Acuña 1 crédito de consulta gratis para este miembro"
              className="text-xs font-mono px-3 py-1.5 rounded border border-brand/40 text-brand hover:bg-brand/10 transition-colors disabled:opacity-50"
            >
              🎁 Dar consulta gratis
            </button>
          )
        )}
      </div>
      {showCancel && (
        <div className="flex gap-2">
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Motivo de la cancelación"
            className="flex-1 bg-transparent border border-subtle rounded px-2 py-1 text-xs text-white"
          />
          <button
            onClick={onCancel}
            disabled={pending || !reason.trim()}
            className="text-xs font-mono px-3 py-1.5 rounded bg-red-900/60 hover:bg-red-800 text-white transition-colors disabled:opacity-50"
          >
            Confirmar cancelación
          </button>
        </div>
      )}
      {err && <p className="text-xs text-red-400 font-mono">{err}</p>}
    </div>
  )
}
