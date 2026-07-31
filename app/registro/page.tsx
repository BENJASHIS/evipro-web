'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import PasswordInput from '@/app/components/ui/PasswordInput'
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
    doc_type: 'dni' as DocType,
    doc_number: '',
    country_origin: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegistro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // ponytail: trampa para bots — un campo que un humano nunca ve ni llena.
    // Si aparece spam real de verdad, encima de esto va Turnstile.
    if ((new FormData(e.currentTarget).get('website') as string)?.trim()) return
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: `${location.origin}/miembros` },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.full_name,
        phone: form.phone || null,
        city: form.city || null,
        dni_encrypted: form.doc_number || null,
        doc_type: form.doc_type,
        country_origin: form.country_origin || null,
      })
      if (profileError) { setError('Error al crear perfil: ' + profileError.message); setLoading(false); return }
    }

    router.push('/planes')
  }

  const isForeign = form.doc_type !== 'dni'

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink py-12 px-4">
      <div className="w-full max-w-md p-8 border border-subtle rounded-lg">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <Image src="/images/logo-evipro.png" alt="EVIPro" width={32} height={32} className="rounded-full" />
          <span className="text-xl tracking-tight">
            <span className="font-bold text-white">EVI</span><span className="font-serif italic text-brand">Pro</span>
          </span>
        </Link>

        <h1 className="text-2xl font-light text-white mb-2 font-serif italic">Crea tu cuenta</h1>
        <p className="text-sm text-muted mb-8">
          La cuenta es para la membresía y tu área de miembro.{' '}
          <Link href="/medicos" className="text-brand hover:underline">Agendar una consulta</Link>{' '}
          no necesita cuenta: basta tu nombre y teléfono.
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

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-xs text-faint mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-brand hover:underline">Ingresar</Link>
        </p>
      </div>
    </main>
  )
}
