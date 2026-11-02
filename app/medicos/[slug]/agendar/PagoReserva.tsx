'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { T, useLanguage } from '@/app/components/Language'
import { REGLA_CANCELACION } from '@/lib/bookings'

type MedioQR = 'yape' | 'plin'
type Medio = MedioQR | 'codigo'
interface InfoPago {
  estado: string
  vencida: boolean
  slot_date: string | null
  slot_time: string | null
  modality: string
  monto: number
  pago_hasta: string | null
  medios: MedioQR[]
  whatsapp: string
}
const NOMBRE: Record<MedioQR, string> = { yape: 'Yape', plin: 'Plin' }
const wa = (numero: string, texto: string) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`

/**
 * Pantalla de pago de una reserva: QR de Yape/Plin (sin celular ni nombre del médico),
 * número de operación y aviso por WhatsApp. Diseño: docs/superpowers/specs/2026-11-01-pago-reserva-yape-plin-design.md.
 */
export default function PagoReserva({ reservaId, irA = url => window.location.assign(url) }: {
  reservaId: string
  irA?: (url: string) => void
}) {
  const { t } = useLanguage()
  const [info, setInfo] = useState<InfoPago | null | undefined>(undefined)
  const [medio, setMedio] = useState<Medio>('yape')
  const [referencia, setReferencia] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    fetch(`/api/reservar/pago?reserva=${reservaId}`)
      .then(r => (r.ok ? r.json() : null))
      .then(setInfo)
      .catch(() => setInfo(null))
  }, [reservaId])

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  if (info === undefined) return <p className="text-faint text-sm font-mono"><T>{"Cargando..."}</T></p>
  if (info === null) return <p className="text-muted text-sm"><T>{"No encontramos esta reserva."}</T></p>

  const cuando = `${info.slot_date ?? ''} ${info.slot_time ?? ''}`.trim()

  if (info.estado === 'confirmed') {
    return (
      <div className="text-center py-12">
        <p className="text-brand text-5xl mb-6">✓</p>
        <h2 className="text-2xl font-light mb-2"><T>{"Tu cita está confirmada"}</T></h2>
        <p className="text-muted text-sm font-mono">{cuando}</p>
      </div>
    )
  }
  if (info.estado === 'payment_to_verify') {
    return <p className="text-muted text-sm max-w-md"><T>{"Recibimos tu aviso de pago. El doctor lo verificará y te confirmará por WhatsApp."}</T></p>
  }
  if (info.estado === 'cancelled') {
    return (
      <div className="max-w-md space-y-4">
        {info.vencida
          ? <p className="text-muted text-sm"><T>{"Tu turno venció. Si ya pagaste, escríbenos por WhatsApp con tu número de operación"}</T></p>
          : <p className="text-muted text-sm"><T>{"Esta reserva fue cancelada. Escríbenos por WhatsApp si necesitas otra fecha."}</T></p>}
        <a href={wa(info.whatsapp, `Hola, sobre mi reserva del ${cuando}.`)} target="_blank" rel="noopener noreferrer"
          className="inline-block bg-brand text-black px-6 py-2.5 rounded font-mono text-sm hover:bg-brand-hover transition-colors">
          <T>{"Escribir al doctor"}</T>
        </a>
      </div>
    )
  }

  const minutos = info.pago_hasta ? Math.max(0, Math.ceil((Date.parse(info.pago_hasta) - ahora) / 60_000)) : 0

  async function avisarPago() {
    if (!info) return
    setEnviando(true)
    setError(null)
    try {
      const r = await fetch('/api/reservar/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserva: reservaId, medio, referencia: referencia.trim() }),
      })
      const cuerpo = await r.json().catch(() => ({})) as { error?: string }
      if (!r.ok) {
        setError(cuerpo.error ?? 'No se pudo guardar el pago. Intenta de nuevo.')
        return
      }
      const ref = referencia.trim()
      setAviso(medio === 'codigo'
        ? `Reservé el ${cuando} con mi código de consulta gratis ${ref}`
        : `Pagué mi reserva del ${cuando}, ${NOMBRE[medio]} operación ${ref}`)
    } finally {
      setEnviando(false)
    }
  }

  async function pagarConTarjeta() {
    setError(null)
    const r = await fetch('/api/reservar/mercadopago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reserva: reservaId }),
    })
    const cuerpo = await r.json().catch(() => ({})) as { init_point?: string; error?: string }
    if (r.ok && cuerpo.init_point) irA(cuerpo.init_point)
    else setError(cuerpo.error ?? 'No se pudo abrir el pago con tarjeta')
  }

  if (aviso) {
    return (
      <div className="max-w-md space-y-4">
        <p className="text-muted text-sm"><T>{"Listo. Avisa al doctor para que verifique tu pago:"}</T></p>
        <a href={wa(info.whatsapp, aviso)} target="_blank" rel="noopener noreferrer"
          className="inline-block bg-brand text-black px-6 py-2.5 rounded font-mono text-sm hover:bg-brand-hover transition-colors">
          <T>{"Avisar al doctor"}</T>
        </a>
      </div>
    )
  }

  const opcion = (id: Medio, etiqueta: React.ReactNode) => (
    <label key={id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
      <input type="radio" name="medio" checked={medio === id} onChange={() => setMedio(id)} className="accent-[var(--color-brand)]" />
      {etiqueta}
    </label>
  )

  return (
    <div className="max-w-md space-y-6">
      <div className="border border-subtle rounded-lg p-6 space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-brand"><T>{"Tu reserva"}</T></p>
        <p className="text-white">{cuando}</p>
        <p className="text-faint text-xs font-mono">
          {minutos > 0
            ? <T values={{ min: minutos }}>{"Turno apartado: te quedan {min} min para pagar"}</T>
            : <T>{"El plazo para pagar terminó."}</T>}
        </p>
        <p className="text-3xl font-light">{`S/ ${info.monto}`}</p>

        <p className="text-sm text-muted"><T>{"Paga por Yape o Plin escaneando el código:"}</T></p>
        <div className="flex gap-6 justify-center">
          {info.medios.map(m => (
            <figure key={m} className="text-center">
              <Image src={`/api/reservar/qr?reserva=${reservaId}&medio=${m}`} alt={`QR ${NOMBRE[m]}`}
                width={150} height={150} unoptimized className="rounded bg-white p-1" />
              <figcaption className="text-xs text-faint font-mono mt-1">{NOMBRE[m]}</figcaption>
            </figure>
          ))}
        </div>

        <div className="text-xs text-muted space-y-1">
          <p><T>{REGLA_CANCELACION}</T></p>
          <p><T>{"Al pagar aceptas esta regla."}</T></p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-mono uppercase tracking-widest text-muted mb-2"><T>{"¿Cómo pagaste?"}</T></legend>
          {info.medios.includes('yape') && opcion('yape', <T>{"Pagué con Yape"}</T>)}
          {info.medios.includes('plin') && opcion('plin', <T>{"Pagué con Plin"}</T>)}
          {opcion('codigo', <T>{"Tengo un código de consulta gratis"}</T>)}
        </fieldset>

        <div>
          <label htmlFor="pago-ref" className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">
            {medio === 'codigo' ? <T>{"Código"}</T> : <T>{"Número de operación"}</T>}
          </label>
          <input id="pago-ref" type="text" inputMode={medio === 'codigo' ? 'text' : 'numeric'} value={referencia}
            onChange={e => setReferencia(e.target.value)}
            className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand" />
        </div>

        {error && <p className="text-red-400 text-xs font-mono">{t(error)}</p>}

        <button disabled={!referencia.trim() || enviando} onClick={avisarPago}
          className="w-full py-2.5 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-40 font-mono">
          {enviando ? <T>{"Enviando..."}</T> : <T>{"Ya pagué"}</T>}
        </button>
      </div>

      <button onClick={pagarConTarjeta} className="text-xs font-mono text-faint underline hover:text-white">
        <T>{"Pagar desde el extranjero (tarjeta)"}</T>
      </button>
    </div>
  )
}
