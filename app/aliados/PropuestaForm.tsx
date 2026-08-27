'use client'
import { useState } from 'react'
import Turnstile, { TURNSTILE_CLIENT_ENABLED } from '@/app/components/Turnstile'

const INPUT = 'w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand'
const LABEL = 'block text-xs text-muted mb-1 uppercase tracking-widest'

const VACIO = {
  full_name: '', phone: '', email: '',
  occupation: '', license: '', city: '',
  proposal: '', contribution: '', needs: '',
}

export default function PropuestaForm() {
  const [form, setForm] = useState(VACIO)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviada, setEnviada] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileReset, setTurnstileReset] = useState(0)

  function cambiar(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if ((new FormData(e.currentTarget).get('website') as string)?.trim()) return
    if (TURNSTILE_CLIENT_ENABLED && !turnstileToken) {
      setError('Completa la verificación anti-bot.')
      return
    }
    setEnviando(true)
    setError(null)
    const res = await fetch('/api/propuestas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, turnstile_token: turnstileToken }),
    })
    setEnviando(false)
    if (res.ok) { setEnviada(true); setForm(VACIO); return }
    const data = await res.json().catch(() => null) as { error?: string } | null
    setError(data?.error ?? 'No se pudo enviar. Intenta de nuevo.')
    setTurnstileToken('')
    setTurnstileReset(prev => prev + 1)
  }

  if (enviada) {
    return (
      <p className="text-muted text-sm">
        La recibimos. Si encaja con lo que hacemos, te escribimos por WhatsApp o correo.
        No respondemos todas: preferimos decirlo antes que dejarte esperando.
      </p>
    )
  }

  return (
    <form onSubmit={enviar} className="space-y-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <fieldset className="grid sm:grid-cols-3 gap-4">
        <legend className="text-xs font-mono text-faint uppercase tracking-widest mb-3">1 · Quién eres</legend>
        <div>
          <label htmlFor="full_name" className={LABEL}>Nombre *</label>
          <input id="full_name" name="full_name" value={form.full_name} onChange={cambiar} required maxLength={120} autoComplete="name" className={INPUT} />
        </div>
        <div>
          <label htmlFor="phone" className={LABEL}>WhatsApp *</label>
          <input id="phone" name="phone" type="tel" value={form.phone} onChange={cambiar} required maxLength={20} autoComplete="tel" className={INPUT} />
        </div>
        <div>
          <label htmlFor="email" className={LABEL}>Correo *</label>
          <input id="email" name="email" type="email" value={form.email} onChange={cambiar} required maxLength={120} autoComplete="email" className={INPUT} />
        </div>
      </fieldset>

      <fieldset className="grid sm:grid-cols-3 gap-4">
        <legend className="text-xs font-mono text-faint uppercase tracking-widest mb-3">2 · Qué haces</legend>
        <div>
          <label htmlFor="occupation" className={LABEL}>Profesión u oficio *</label>
          <input id="occupation" name="occupation" value={form.occupation} onChange={cambiar} required maxLength={120} className={INPUT} />
        </div>
        <div>
          <label htmlFor="license" className={LABEL}>Colegiatura o registro</label>
          <input id="license" name="license" value={form.license} onChange={cambiar} maxLength={60} className={INPUT} />
        </div>
        <div>
          <label htmlFor="city" className={LABEL}>Ciudad *</label>
          <input id="city" name="city" value={form.city} onChange={cambiar} required maxLength={80} autoComplete="address-level2" className={INPUT} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-xs font-mono text-faint uppercase tracking-widest mb-3">3 · Qué propones</legend>
        <div>
          <label htmlFor="proposal" className={LABEL}>Qué quieres hacer con EVIPro *</label>
          <textarea id="proposal" name="proposal" value={form.proposal} onChange={cambiar} required maxLength={1500} rows={4} className={INPUT} />
        </div>
        <div>
          <label htmlFor="contribution" className={LABEL}>Qué pones tú *</label>
          <textarea id="contribution" name="contribution" value={form.contribution} onChange={cambiar} required maxLength={1000} rows={3} className={INPUT} />
        </div>
        <div>
          <label htmlFor="needs" className={LABEL}>Qué necesitas de EVIPro *</label>
          <textarea id="needs" name="needs" value={form.needs} onChange={cambiar} required maxLength={1000} rows={3} className={INPUT} />
        </div>
      </fieldset>

      <Turnstile
        action="propuesta"
        appearance="always"
        resetSignal={turnstileReset}
        onVerify={setTurnstileToken}
      />

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={enviando || (TURNSTILE_CLIENT_ENABLED && !turnstileToken)}
        className="py-2 px-6 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50"
      >
        {enviando ? 'Enviando...' : 'Enviar propuesta'}
      </button>
    </form>
  )
}
