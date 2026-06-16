'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { PharmacyRequest, Subscription } from '@/lib/types'

const STATUS_LABELS: Record<PharmacyRequest['status'], string> = {
  pending: 'Pendiente de coordinación',
  coordinated: 'Coordinado con farmacia',
  shipped: 'En camino por Shalom',
  delivered: 'Entregado',
}

export default function RecetasPage() {
  const [requests, setRequests] = useState<PharmacyRequest[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [hasPharmacy, setHasPharmacy] = useState(false)
  const [form, setForm] = useState({ product_notes: '', shalom_address: '' })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('subscriptions').select('*, membership_plans(includes_pharmacy_coord)').eq('user_id', user.id).eq('status', 'active').maybeSingle()
        .then(({ data }) => {
          setSubscription(data)
          const plan = data?.membership_plans as Record<string, unknown> | null
          setHasPharmacy(Boolean(plan?.includes_pharmacy_coord))
        })
      supabase.from('pharmacy_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        .then(({ data }) => setRequests(data ?? []))
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subscription) return
    setSending(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSending(false); return }
    await supabase.from('pharmacy_requests').insert({
      user_id: user.id,
      subscription_id: subscription.id,
      product_notes: form.product_notes,
      shalom_address: form.shalom_address,
    })
    setSuccess(true)
    setSending(false)
    setForm({ product_notes: '', shalom_address: '' })
    // Actualizar lista
    const { data } = await supabase.from('pharmacy_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setRequests(data ?? [])
  }

  if (!subscription || !hasPharmacy) {
    return (
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2">Farmacia</p>
        <h1 className="text-3xl font-light font-serif italic mb-8">Coordinación de farmacia</h1>
        <div className="border border-subtle rounded-lg p-8 text-center">
          <p className="text-muted text-sm mb-4">
            Este servicio está disponible en los planes <strong className="text-white">Cannabis</strong> e <strong className="text-white">Integral</strong>.
          </p>
          <a href="/planes" className="text-xs font-mono text-brand hover:underline">
            Ver planes →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2">Farmacia</p>
      <h1 className="text-3xl font-light font-serif italic mb-4">Coordinación de farmacia</h1>
      <p className="text-muted text-sm mb-8">
        Coordinamos con nuestra farmacia magistral aliada el envío de tu producto a la agencia Shalom más cercana.
        El costo de envío (S/. 8–15) y el producto son cobrados directamente por la farmacia.
      </p>

      {success && (
        <div className="border border-brand/30 bg-brand/5 rounded-lg p-4 mb-6">
          <p className="text-brand text-sm">✓ Solicitud enviada. Coordinaremos con la farmacia a la brevedad.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border border-subtle rounded-lg p-6 mb-8 space-y-4">
        <p className="text-xs font-mono text-faint uppercase tracking-widest mb-2">Nueva solicitud</p>
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-widest">Producto / notas de la receta *</label>
          <textarea
            value={form.product_notes}
            onChange={e => setForm(prev => ({ ...prev, product_notes: e.target.value }))}
            required rows={3} placeholder="Ej: Aceite CBD:THC 20:1, 30ml, según receta del Dr. Carlos"
            className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-widest">Agencia Shalom de destino *</label>
          <input
            type="text" value={form.shalom_address}
            onChange={e => setForm(prev => ({ ...prev, shalom_address: e.target.value }))}
            required placeholder="Ej: Shalom Sicuani, Cusco"
            className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <button type="submit" disabled={sending}
          className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50">
          {sending ? 'Enviando...' : 'Solicitar coordinación'}
        </button>
      </form>

      {requests.length > 0 && (
        <div>
          <p className="text-xs font-mono text-faint uppercase tracking-widest mb-4">Mis solicitudes</p>
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="border border-subtle rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-white">{req.product_notes}</p>
                  <span className="text-xs font-mono text-brand ml-4 shrink-0">
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>
                <p className="text-xs text-faint font-mono">📍 {req.shalom_address}</p>
                {req.tracking_info && (
                  <p className="text-xs text-muted font-mono mt-1">Guía: {req.tracking_info}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
