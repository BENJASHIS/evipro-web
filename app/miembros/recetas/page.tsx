'use client'
import { T, useLanguage } from '@/app/components/Language'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Guia from './Guia'
import type { PharmacyRequest } from '@/lib/types'

const STATUS_LABELS: Record<PharmacyRequest['status'], string> = {
  pending: 'Pendiente de coordinación',
  coordinated: 'Coordinado con farmacia',
  shipped: 'En camino por Shalom',
  delivered: 'Entregado',
}

type SolicitudPropia = Pick<PharmacyRequest,
  'id' | 'product_notes' | 'shalom_address' | 'status' | 'tracking_info' | 'created_at'>

export default function RecetasPage() {
  const { t } = useLanguage()
  const [requests, setRequests] = useState<SolicitudPropia[]>([])
  // null = todavía cargando; false = sin derecho; true = con derecho.
  const [tieneFarmacia, setTieneFarmacia] = useState<boolean | null>(null)
  const [form, setForm] = useState({ product_notes: '', shalom_address: '' })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function cargarSolicitudes(userId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('pharmacy_requests')
      .select('id, product_notes, shalom_address, status, tracking_info, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setRequests((data ?? []) as SolicitudPropia[])
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setTieneFarmacia(false); return }
      // El derecho se lee de la casilla del plan, no de su nombre: los nombres
      // de plan cambian y el candado se queda apuntando a planes que ya no existen.
      // Puede haber más de una suscripción activa: basta con que UNA incluya
      // farmacia. Pedir una sola fila devolvía error y negaba el derecho.
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('id, membership_plans(includes_pharmacy_coord)')
        .eq('user_id', user.id)
        .eq('status', 'active')
      setTieneFarmacia((subs ?? []).some(s => {
        const plan = Array.isArray(s.membership_plans) ? s.membership_plans[0] : s.membership_plans
        return Boolean(plan?.includes_pharmacy_coord)
      }))
      await cargarSolicitudes(user.id)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)
    const res = await fetch('/api/farmacia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSending(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null) as { error?: string } | null
      setError(data?.error ?? 'No se pudo enviar la solicitud.')
      return
    }
    setSuccess(true)
    setForm({ product_notes: '', shalom_address: '' })
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await cargarSolicitudes(user.id)
  }

  // La más reciente: `cargarSolicitudes` ya las trae ordenadas por fecha desc.
  const ultima = requests[0]

  const encabezado = (
    <>
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>Farmacia</T></p>
      <h1 className="text-3xl font-light font-serif italic mb-4"><T>Coordinación de farmacia</T></h1>
    </>
  )

  if (tieneFarmacia === null) {
    return <div>{encabezado}<p className="text-faint text-sm font-mono"><T>Cargando…</T></p></div>
  }

  if (!tieneFarmacia) {
    return (
      <div>
        {encabezado}
        <div className="border border-subtle rounded-lg p-8 text-center">
          <p className="text-muted text-sm mb-3">
            <T>La coordinación de farmacia está incluida en la membresía EVIPro.</T>
          </p>
          <Link href="/planes" className="text-brand text-sm font-mono hover:underline">
            <T>Ver planes →</T>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {encabezado}
      <p className="text-muted text-sm mb-8">
        <T>Coordinamos la información y documentación necesaria con una farmacia magistral autorizada. La preparación, dispensación, pago y entrega corresponden a la farmacia según sus propios procedimientos. EVIPro no vende, almacena ni dispensa productos de cannabis.</T>
      </p>

      {success && (
        <div className="border border-brand/30 bg-brand/5 rounded-lg p-4 mb-6">
          <p className="text-brand text-sm"><T>✓ Solicitud enviada. Coordinaremos con la farmacia a la brevedad.</T></p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border border-subtle rounded-lg p-6 mb-8 space-y-4">
        <p className="text-xs font-mono text-faint uppercase tracking-widest mb-2"><T>Nueva solicitud</T></p>

        {/* La mayoría de solicitudes son repetición: el paciente continuador
            pide lo mismo. Escribirlo de nuevo invita a equivocarse en la
            concentración, así que se copia de la última en vez de teclearla. */}
        {ultima && (
          <button
            type="button"
            onClick={() => setForm(prev => ({
              ...prev,
              product_notes: `Continuador · lo mismo de la última vez: ${ultima.product_notes}`,
            }))}
            className="w-full text-left border border-subtle rounded px-3 py-2 text-xs text-muted hover:border-brand/50 hover:text-white transition-colors"
          >
            <T>↻ Lo mismo de la última vez ·</T> <span className="font-mono">{ultima.product_notes}</span>
          </button>
        )}

        <div>
          <label htmlFor="product_notes" className="block text-xs text-muted mb-1 uppercase tracking-widest"><T>Notas de la receta *</T></label>
          <textarea
            id="product_notes"
            value={form.product_notes}
            onChange={e => setForm(prev => ({ ...prev, product_notes: e.target.value }))}
            required rows={3} maxLength={1000} placeholder={t("Ej: Aceite THC 1 % : CBD 19 %, 30 ml, según receta del Dr. Carlos")}
            className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand resize-none"
          />
        </div>
        <div>
          <label htmlFor="shalom_address" className="block text-xs text-muted mb-1 uppercase tracking-widest"><T>Agencia Shalom de destino *</T></label>
          <input
            id="shalom_address"
            type="text" value={form.shalom_address}
            onChange={e => setForm(prev => ({ ...prev, shalom_address: e.target.value }))}
            required maxLength={200} placeholder={t("Ej: Shalom Sicuani, Cusco")}
            className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
          />
          {/* Ayuda en el único momento en que se duda: al escribir la agencia.
              No se repite en otras partes de la página. */}
          <p className="text-xs text-faint mt-1">
            <T>¿No sabes cuál te queda más cerca?</T>{' '}
            <a
              href="https://shalom.com.pe/agencias"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              <T>Buscar agencia en Shalom →</T>
            </a>
          </p>
        </div>
        {error && <p className="text-red-400 text-xs"><T>{error}</T></p>}
        <button type="submit" disabled={sending}
          className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50">
          <T>{sending ? 'Enviando...' : 'Solicitar coordinación'}</T>
        </button>
      </form>

      {requests.length > 0 && (
        <div>
          <p className="text-xs font-mono text-faint uppercase tracking-widest mb-4"><T>Mis solicitudes</T></p>
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="border border-subtle rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-white">{req.product_notes}</p>
                  <span className="text-xs font-mono text-brand ml-4 shrink-0">
                    <T>{STATUS_LABELS[req.status]}</T>
                  </span>
                </div>
                <p className="text-xs text-faint font-mono">📍 {req.shalom_address}</p>
                {req.tracking_info && <Guia codigo={req.tracking_info} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
