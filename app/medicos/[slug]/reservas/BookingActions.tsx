'use client'

import { useState, useTransition } from 'react'
import { confirmBooking, cancelBooking, confirmarPagoReserva, cambiarFecha } from './actions'
import { GiftCreditButton } from './GiftCreditButton'

export function BookingActions(
  { slug, token, id, userId, memberName, cobra = false, precio, soloPago = false, horario = [] }:
  {
    slug: string; token: string; id: string; userId: string | null; memberName: string
    // Pago al reservar: «Confirmar pago» con monto recibido y número de operación opcional.
    cobra?: boolean; precio?: number; soloPago?: boolean
    // Cambiar fecha: horas de la agenda del médico (el servidor valida el día y que esté libre).
    horario?: string[]
  },
) {
  const [pending, startTransition] = useTransition()
  const [showCancel, setShowCancel] = useState(false)
  const [reason, setReason] = useState('')
  const [err, setErr] = useState('')
  const [monto, setMonto] = useState(precio === undefined ? '' : String(precio))
  const [referencia, setReferencia] = useState('')
  const [aviso, setAviso] = useState('')
  const [showFecha, setShowFecha] = useState(false)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')

  function onCambiarFecha() {
    setErr('')
    startTransition(async () => {
      const r = await cambiarFecha(slug, token, id, fecha, hora)
      if (r.ok) setShowFecha(false)
      else setErr(r.error ?? 'Error')
    })
  }

  function onConfirmPago() {
    setErr('')
    setAviso('')
    startTransition(async () => {
      const r = await confirmarPagoReserva(slug, token, id, monto, referencia)
      if (!r.ok) setErr(r.error ?? 'Error')
      else if (r.sinTurno) setAviso('Ese turno ya lo tomó otro: quedó en devoluciones pendientes.')
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
      {cobra && (
        <div className="flex gap-2 flex-wrap items-center">
          <label className="text-xs font-mono text-faint">
            S/{' '}
            <input value={monto} onChange={e => setMonto(e.target.value)} inputMode="decimal" aria-label="Monto recibido"
              className="w-20 bg-transparent border border-subtle rounded px-2 py-1 text-xs text-white" />
          </label>
          <input value={referencia} onChange={e => setReferencia(e.target.value)} placeholder="N.º de operación (opcional)"
            className="flex-1 min-w-40 bg-transparent border border-subtle rounded px-2 py-1 text-xs text-white" />
          <button
            onClick={onConfirmPago}
            disabled={pending}
            className="text-xs font-mono px-3 py-1.5 rounded bg-brand-deep hover:bg-brand-mid text-white transition-colors disabled:opacity-50"
          >
            Confirmar pago
          </button>
        </div>
      )}
      {!soloPago && (
      <div className="flex gap-2">
        {!cobra && (
        <button
          onClick={onConfirm}
          disabled={pending}
          className="text-xs font-mono px-3 py-1.5 rounded bg-brand-deep hover:bg-brand-mid text-white transition-colors disabled:opacity-50"
        >
          Confirmar
        </button>
        )}
        <button
          onClick={() => setShowCancel(v => !v)}
          disabled={pending}
          className="text-xs font-mono px-3 py-1.5 rounded border border-subtle text-faint hover:text-white transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        {cobra && (
          <button
            onClick={() => setShowFecha(v => !v)}
            disabled={pending}
            className="text-xs font-mono px-3 py-1.5 rounded border border-subtle text-faint hover:text-white transition-colors disabled:opacity-50"
          >
            Cambiar fecha
          </button>
        )}
        <GiftCreditButton slug={slug} token={token} userId={userId} memberName={memberName} />
      </div>
      )}
      {showFecha && (
        <div className="flex gap-2 flex-wrap">
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} aria-label="Fecha nueva"
            className="bg-transparent border border-subtle rounded px-2 py-1 text-xs text-white" />
          <select value={hora} onChange={e => setHora(e.target.value)} aria-label="Hora nueva"
            className="bg-ink border border-subtle rounded px-2 py-1 text-xs text-white">
            <option value="">Hora</option>
            {horario.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <button
            onClick={onCambiarFecha}
            disabled={pending || !fecha || !hora}
            className="text-xs font-mono px-3 py-1.5 rounded bg-brand-deep hover:bg-brand-mid text-white transition-colors disabled:opacity-50"
          >
            Mover reserva
          </button>
        </div>
      )}
      {aviso && <p className="text-xs text-yellow-400 font-mono">{aviso}</p>}
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
