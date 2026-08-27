'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Marca from '@/app/components/ui/Marca'
import PasswordInput from '@/app/components/ui/PasswordInput'
import Turnstile, { TURNSTILE_CLIENT_ENABLED } from '@/app/components/Turnstile'
import type { DocType } from '@/lib/types'

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'dni', label: 'DNI (Perú)' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'carnet_extranjeria', label: 'Carné de Extranjería' },
  { value: 'cedula_identidad', label: 'Cédula de Identidad' },
]

const MIN_PASSWORD = 8

const CAMPOS_CUENTA = [
  { name: 'full_name', label: 'Nombre completo', type: 'text', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Correo electrónico', type: 'email', required: true, autoComplete: 'email' },
] as const

const CAMPOS_CONTACTO = [
  { name: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', required: false, autoComplete: 'tel' },
  { name: 'city', label: 'Ciudad de residencia', type: 'text', required: false, autoComplete: 'address-level2' },
] as const

const INPUT = 'w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand'
const LABEL = 'block text-xs text-muted mb-1 uppercase tracking-widest'

export default function RegistroPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    password_confirm: '',
    doc_type: 'dni' as DocType,
    doc_number: '',
    country_origin: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileReset, setTurnstileReset] = useState(0)
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegistro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Trampa para bots: un campo que un humano nunca ve ni llena.
    if ((new FormData(e.currentTarget).get('website') as string)?.trim()) return
    setError(null)
    if (form.password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`)
      return
    }
    if (form.password !== form.password_confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (TURNSTILE_CLIENT_ENABLED && !turnstileToken) {
      setError('Completa la verificación anti-bot.')
      return
    }
    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${location.origin}/miembros`,
        ...(turnstileToken ? { captchaToken: turnstileToken } : {}),
      },
    })

    if (signUpError) {
      setTurnstileToken('')
      setTurnstileReset(prev => prev + 1)
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const profileRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
        },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone || null,
          city: form.city || null,
          doc_type: form.doc_type,
          doc_number: form.doc_number,
          country_origin: form.country_origin || null,
        }),
      })
      if (!profileRes.ok) {
        const profileError = await profileRes.json().catch(() => null) as { error?: string } | null
        setError(
          profileRes.status === 401
            ? 'Cuenta creada. Inicia sesión para completar tu perfil.'
            : profileError?.error ?? 'Error al crear perfil.',
        )
        setLoading(false)
        return
      }
    }

    router.push('/planes')
  }

  const isForeign = form.doc_type !== 'dni'

  return (
    <main className="min-h-screen bg-ink px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <aside className="pt-2 lg:sticky lg:top-8">
          <div className="mb-10"><Marca /></div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3">Registro EVIPro</p>
          <h1 className="max-w-xl text-4xl font-light text-white mb-4">
            Tu acceso a herramientas, beneficios y seguimiento.
          </h1>
          <p className="max-w-lg text-sm leading-6 text-muted mb-6">
            Crea una cuenta para activar membresía, usar herramientas para miembros y mantener tus datos de contacto ordenados.
            Para agendar una consulta suelta no necesitas cuenta.
          </p>
          <div className="grid gap-3 text-sm">
            <Link
              href="/planes#turista"
              className="flex items-center justify-between border border-yellow-400/30 bg-yellow-400/5 rounded px-4 py-3 text-yellow-100 hover:border-yellow-400/60 transition-colors"
            >
              <span>Plan Turista</span>
              <span className="font-mono text-xs text-yellow-300">Antes de viajar</span>
            </Link>
            <Link
              href="/medicos"
              className="flex items-center justify-between border border-subtle rounded px-4 py-3 text-muted hover:border-brand/50 hover:text-white transition-colors"
            >
              <span>Consulta sin cuenta</span>
              <span className="font-mono text-xs text-brand">Agendar</span>
            </Link>
          </div>
        </aside>

        <section className="w-full border border-subtle rounded-lg p-6 sm:p-8">
          <h2 className="text-2xl font-light text-white mb-2">Crea tu cuenta</h2>
          <p className="text-sm text-muted mb-8">
            Usa un correo al que tengas acceso; ahí recibirás la confirmación de cuenta.
          </p>

          <form onSubmit={handleRegistro} className="space-y-6">
          {/* Trampa para bots: oculta a la vista y al lector de pantalla. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <fieldset className="space-y-4">
            <legend className="text-xs font-mono text-faint uppercase tracking-widest mb-3">1 · Tu cuenta</legend>

            {CAMPOS_CUENTA.map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className={LABEL}>
                  {field.label}{field.required && ' *'}
                </label>
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  autoComplete={field.autoComplete}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  className={INPUT}
                />
              </div>
            ))}

            <div>
              <label htmlFor="password" className={LABEL}>Contraseña *</label>
              <PasswordInput
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
              />
              <p className="text-xs text-faint mt-1">Mínimo {MIN_PASSWORD} caracteres.</p>
            </div>

            <div>
              <label htmlFor="password_confirm" className={LABEL}>Repite tu contraseña *</label>
              <PasswordInput
                id="password_confirm"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
              />
              {form.password_confirm && form.password !== form.password_confirm && (
                <p className="text-xs text-red-400 mt-1">Todavía no coincide.</p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-mono text-faint uppercase tracking-widest mb-3">2 · Tu documento</legend>

            <div>
              <label htmlFor="doc_type" className={LABEL}>Tipo de documento *</label>
              <select
                id="doc_type"
                name="doc_type"
                value={form.doc_type}
                onChange={handleChange}
                className={INPUT}
              >
                {DOC_TYPES.map(d => (
                  <option key={d.value} value={d.value} className="bg-ink">{d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="doc_number" className={LABEL}>Número de documento *</label>
              <input
                id="doc_number"
                type="text"
                name="doc_number"
                inputMode={form.doc_type === 'dni' ? 'numeric' : 'text'}
                value={form.doc_number}
                onChange={handleChange}
                required
                placeholder={form.doc_type === 'dni' ? '12345678' : form.doc_type === 'pasaporte' ? 'AB123456' : ''}
                className={INPUT}
              />
            </div>

            {isForeign && (
              <div>
                <label htmlFor="country_origin" className={LABEL}>País de origen *</label>
                <input
                  id="country_origin"
                  type="text"
                  name="country_origin"
                  autoComplete="country-name"
                  value={form.country_origin}
                  onChange={handleChange}
                  required={isForeign}
                  placeholder="Colombia, Argentina, España..."
                  className={INPUT}
                />
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-mono text-faint uppercase tracking-widest mb-3">3 · Cómo te ubicamos (opcional)</legend>

            {CAMPOS_CONTACTO.map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className={LABEL}>{field.label}</label>
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  autoComplete={field.autoComplete}
                  value={form[field.name]}
                  onChange={handleChange}
                  className={INPUT}
                />
              </div>
            ))}
          </fieldset>

          <Turnstile
            action="registro"
            resetSignal={turnstileReset}
            onVerify={setTurnstileToken}
            className="pt-1"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading || (TURNSTILE_CLIENT_ENABLED && !turnstileToken)}
            className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-xs text-faint mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-brand hover:underline">Ingresar</Link>
        </p>
        </section>
      </div>
    </main>
  )
}
