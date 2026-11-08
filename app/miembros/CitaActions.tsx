'use client'
import { T, useLanguage } from '@/app/components/Language'

import { useState, useTransition } from 'react'
import { cancelMyBooking } from './citas-actions'

export function CitaActions({ id }: { id: string }) {
  const { t } = useLanguage()
  const [pending, startTransition] = useTransition()
  const [showCancel, setShowCancel] = useState(false)
  const [reason, setReason] = useState('')
  const [err, setErr] = useState('')

  function onCancel() {
    setErr('')
    startTransition(async () => {
      const r = await cancelMyBooking(id, reason)
      if (r.ok) { setShowCancel(false); setReason('') }
      else setErr(r.error ?? 'Error')
    })
  }

  return (
    <div className="mt-2">
      {!showCancel && (
        <button
          onClick={() => setShowCancel(true)}
          disabled={pending}
          className="text-xs font-mono px-3 py-1.5 rounded border border-subtle text-faint hover:text-white transition-colors disabled:opacity-50"
        >
          <T>Cancelar cita</T>
        </button>
      )}
      {showCancel && (
        <div className="flex flex-col gap-2">
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder={t("Motivo de la cancelación")}
            className="bg-transparent border border-subtle rounded px-2 py-1 text-xs text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={pending || !reason.trim()}
              className="text-xs font-mono px-3 py-1.5 rounded bg-red-900/60 hover:bg-red-800 text-white transition-colors disabled:opacity-50"
            >
              <T>Confirmar cancelación</T>
            </button>
            <button
              onClick={() => { setShowCancel(false); setErr('') }}
              disabled={pending}
              className="text-xs font-mono px-3 py-1.5 rounded border border-subtle text-faint hover:text-white transition-colors disabled:opacity-50"
            >
              <T>Volver</T>
            </button>
          </div>
          {err && <p className="text-xs text-red-400 font-mono"><T>{err}</T></p>}
        </div>
      )}
    </div>
  )
}
