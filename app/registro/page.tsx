'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import type { DocType } from '@/lib/types'

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'dni', label: 'DNI (Perú)' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'carnet_extranjeria', label: 'Carné de Extranjería' },
  { value: 'cedula_identidad', label: 'Cédula de Identidad' },
]

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

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
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
    <main className="min-h-screen flex items-center justify-center bg-ink py-12">
      <div className="w-full max-w-sm p-8 border border-subtle rounded-lg">
        <h1 className="text-2xl font-light text-white mb-2 font-serif italic">EVIPro</h1>
        <p className="text-sm text-muted mb-8">Crea tu cuenta para suscribirte</p>

        <form onSubmit={handleRegistro} className="space-y-4">
          {[
            { name: 'full_name', label: 'Nombre completo', type: 'text', required: true },
            { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
            { name: 'password', label: 'Contraseña', type: 'password', required: true },
            { name: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', required: false },
            { name: 'city', label: 'Ciudad de residencia', type: 'text', required: false },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-xs text-muted mb-1 uppercase tracking-widest">
                {field.label}{field.required && ' *'}
              </label>
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

          {/* Tipo de documento */}
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-widest">
              Tipo de documento *
            </label>
            <select
              name="doc_type"
              value={form.doc_type}
              onChange={handleChange}
              className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
            >
              {DOC_TYPES.map(d => (
                <option key={d.value} value={d.value} className="bg-ink">{d.label}</option>
              ))}
            </select>
          </div>

          {/* Número de documento */}
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-widest">
              Número de documento *
            </label>
            <input
              type="text"
              name="doc_number"
              value={form.doc_number}
              onChange={handleChange}
              required
              placeholder={form.doc_type === 'dni' ? '12345678' : form.doc_type === 'pasaporte' ? 'AB123456' : ''}
              className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
            />
          </div>

          {/* País de origen — solo para extranjeros */}
          {isForeign && (
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-widest">
                País de origen *
              </label>
              <input
                type="text"
                name="country_origin"
                value={form.country_origin}
                onChange={handleChange}
                required={isForeign}
                placeholder="Colombia, Argentina, España..."
                className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
              />
            </div>
          )}

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
