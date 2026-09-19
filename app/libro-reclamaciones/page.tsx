'use client'
import { T, useLanguage } from '@/app/components/Language'
import { useState } from 'react'
import Link from 'next/link'
import Turnstile, { TURNSTILE_CLIENT_ENABLED } from '@/app/components/Turnstile'

// Sin precios hardcodeados: son identificadores de servicio para el reclamo;
// los precios viven en membership_plans (Supabase) y aquí solo se desfasarían.
const SERVICIOS = [
  'Membresía Básica',
  'Membresía EVIPro',
  'Módulo de especialista (Dr. Vera)',
  'Plan Turista Inicio',
  'Plan Turista Plus',
  'Consulta presencial',
  'Consulta virtual',
  'Visita a domicilio',
  'Coordinación de farmacia',
  'Otro',
]

export default function LibroReclamacionesPage() {
  const { t: translate } = useLanguage()
  const [form, setForm] = useState({
    tipo: 'reclamo',
    full_name: '',
    dni: '',
    email: '',
    phone: '',
    servicio: '',
    descripcion: '',
    pretension: '',
  })
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileReset, setTurnstileReset] = useState(0)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trampa = new FormData(e.currentTarget).get('website')
    if (typeof trampa === 'string' && trampa.trim()) return
    if (TURNSTILE_CLIENT_ENABLED && !turnstileToken) {
      setError('Completa la verificación anti-bot.')
      return
    }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, website: trampa, turnstile_token: turnstileToken }),
    })

    if (res.ok) {
      const data = await res.json()
      setCode(data.code)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al enviar. Intenta de nuevo.')
      setTurnstileToken('')
      setTurnstileReset(prev => prev + 1)
    }
    setLoading(false)
  }

  if (code) {
    return (
      <main className="public-page min-h-screen bg-ink text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full border border-brand/30 rounded-lg p-8 text-center">
          <p className="text-brand text-xs font-mono uppercase tracking-widest mb-4"><T>{"Reclamación registrada"}</T></p>
          <p className="text-gray-300 text-sm mb-6"><T>{"Tu reclamación ha sido registrada exitosamente. Guarda este código de seguimiento:"}</T></p>
          <p className="text-3xl font-mono font-light text-white border border-subtle rounded px-6 py-4 mb-6">{code}</p>
          <p className="text-faint text-xs mb-8"><T>{"Recibirás respuesta en "}</T><strong className="text-white"><T>{"30 días calendario"}</T></strong><T>{" al correo "}</T><strong className="text-white">{form.email}</strong><T>{". Para consultas escribe a "}</T><a href="mailto:reclamaciones@evipro.pe" className="text-brand">reclamaciones@evipro.pe</a><T>{" indicando tu código."}</T></p>
          <Link href="/" className="text-xs font-mono text-faint hover:text-white transition-colors"><T>{"← Volver al inicio"}</T></Link>
        </div>
      </main>
    )
  }

  return (
    <main className="public-page min-h-screen bg-ink text-white py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-4">INDECOPI</p>
        <h1 className="text-4xl font-light font-serif italic mb-2"><T>{"Libro de Reclamaciones"}</T></h1>
        <p className="text-muted text-sm mb-2"><T>{"Virtual, conforme a la Ley N.º 29571"}</T></p>
        <p className="text-faint text-xs font-mono mb-10"><T>{"Proveedor: José Carlos Benjamín Jara Ovalle · RUC 10439904572 · Cusco, Perú"}</T></p>

        <div className="border border-yellow-400/20 bg-yellow-400/5 rounded-lg p-4 mb-8">
          <p className="text-yellow-400 text-xs font-mono leading-relaxed"><T>{"⚠️ La formulación de una queja o reclamo no impide acudir a otras vías de solución de controversias, incluyendo el INDECOPI (indecopi.gob.pe)."}</T></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

          {/* Tipo */}
          <div>
            <label className="block text-xs text-muted mb-2 uppercase tracking-widest"><T>{"Tipo *"}</T></label>
            <div className="flex gap-4">
              {(['reclamo', 'queja'] as const).map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tipo" value={t} checked={form.tipo === t} onChange={handleChange}
                    className="accent-brand" />
                  <span className="text-sm capitalize text-gray-300"><T>{t}</T></span>
                  <span className="text-xs text-faint">
                    <T>{t === 'reclamo' ? '(disconformidad con servicio)' : '(malestar sin pedido de compensación)'}</T>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Datos del consumidor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'full_name', label: 'Nombre completo *', type: 'text', required: true },
              { name: 'dni', label: 'DNI / CE *', type: 'text', required: true },
              { name: 'email', label: 'Correo electrónico *', type: 'email', required: true },
              { name: 'phone', label: 'Teléfono', type: 'tel', required: false },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-xs text-muted mb-1 uppercase tracking-widest"><T>{field.label}</T></label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  required={field.required}
                  className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
                />
              </div>
            ))}
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-widest"><T>{"Bien o servicio contratado *"}</T></label>
            <select name="servicio" value={form.servicio} onChange={handleChange} required
              className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand">
              <option value="" disabled><T>{"Selecciona..."}</T></option>
              {SERVICIOS.map(s => <option key={s} value={s}><T>{s}</T></option>)}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-widest"><T>{"Descripción del reclamo / queja *"}</T></label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={4}
              placeholder={translate('Describe detalladamente lo ocurrido...')}
              className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand resize-none" />
          </div>

          {/* Pretensión */}
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-widest"><T>{"¿Qué solución solicitas? *"}</T></label>
            <textarea name="pretension" value={form.pretension} onChange={handleChange} required rows={3}
              placeholder={translate('Ej: reembolso, reprogramación de consulta, disculpa formal...')}
              className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand resize-none" />
          </div>

          <Turnstile
            action="reclamaciones"
            resetSignal={turnstileReset}
            onVerify={setTurnstileToken}
          />

          {error && <p className="text-red-400 text-xs"><T>{error}</T></p>}

          <button type="submit" disabled={loading || (TURNSTILE_CLIENT_ENABLED && !turnstileToken)}
            className="w-full py-3 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50">
            <T>{loading ? 'Registrando...' : 'Registrar reclamación'}</T>
          </button>

          <p className="text-xs text-faint text-center font-mono"><T>{"Al enviar aceptas que tus datos sean utilizados para gestionar tu reclamación · "}</T><a href="/terminos" className="hover:text-white"><T>{"Términos"}</T></a>
          </p>
        </form>
      </div>
    </main>
  )
}
