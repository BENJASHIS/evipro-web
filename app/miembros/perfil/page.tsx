'use client'
import { useState, useEffect } from 'react'
import type { DocType } from '@/lib/types'

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'dni', label: 'DNI (Perú)' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'carnet_extranjeria', label: 'Carné de Extranjería' },
  { value: 'cedula_identidad', label: 'Cédula de Identidad' },
]

export default function PerfilPage() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    doc_type: 'dni' as DocType,
    doc_number: '',
    country_origin: '',
  })
  const [email, setEmail] = useState('')
  const [docHint, setDocHint] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch('/api/profile')
      if (!res.ok) {
        if (res.status !== 404) setError('No se pudo cargar el perfil.')
        setLoading(false)
        return
      }
      const data = await res.json() as {
        full_name: string
        phone: string
        city: string
        doc_type: DocType
        doc_number_hint: string | null
        country_origin: string
        email: string
      }
      setForm({
        full_name: data.full_name ?? '',
        phone: data.phone ?? '',
        city: data.city ?? '',
        doc_type: (data.doc_type as DocType) ?? 'dni',
        doc_number: '',
        country_origin: data.country_origin ?? '',
      })
      setEmail(data.email ?? '')
      setDocHint(data.doc_number_hint)
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name,
        phone: form.phone || null,
        city: form.city || null,
        doc_type: form.doc_type,
        doc_number: form.doc_number.trim() || undefined,
        country_origin: form.country_origin || null,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null) as { error?: string } | null
      setError(err?.error ?? 'Error al guardar. Intenta de nuevo.')
    } else {
      const data = await res.json() as { doc_number_hint: string | null }
      setDocHint(data.doc_number_hint)
      setForm(prev => ({ ...prev, doc_number: '' }))
      setSuccess(true)
    }
    setSaving(false)
  }

  if (loading) return <p className="text-faint font-mono text-sm">Cargando...</p>

  return (
    <div className="max-w-md">
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2">Cuenta</p>
      <h1 className="text-3xl font-light font-serif italic mb-8">Mi perfil</h1>

      {email && <p className="text-xs text-faint font-mono mb-6">{email}</p>}

      <form onSubmit={handleSave} className="space-y-4">
        {[
          { name: 'full_name', label: 'Nombre completo', type: 'text', required: true },
          { name: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', required: false },
          { name: 'city', label: 'Ciudad de residencia', type: 'text', required: false },
        ].map(field => (
          <div key={field.name}>
            <label className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              required={field.required}
              value={form[field.name as keyof typeof form]}
              onChange={e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">
            Tipo de documento
          </label>
          <select
            name="doc_type"
            value={form.doc_type}
            onChange={e => setForm(prev => ({ ...prev, doc_type: e.target.value as DocType }))}
            className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
          >
            {DOC_TYPES.map(d => (
              <option key={d.value} value={d.value} className="bg-ink">{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">
            Número de documento
          </label>
          <input
            type="text"
            name="doc_number"
            value={form.doc_number}
            onChange={e => setForm(prev => ({ ...prev, doc_number: e.target.value }))}
            placeholder={docHint ? `${docHint} guardado · deja vacío para conservarlo` : undefined}
            className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
          />
          <p className="text-xs text-faint mt-1">
            Por seguridad, el número completo no se muestra después de guardarlo.
          </p>
        </div>

        {form.doc_type !== 'dni' && (
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">
              País de origen
            </label>
            <input
              type="text"
              name="country_origin"
              value={form.country_origin}
              onChange={e => setForm(prev => ({ ...prev, country_origin: e.target.value }))}
              className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
            />
          </div>
        )}

        {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
        {success && <p className="text-brand text-xs font-mono">Perfil actualizado correctamente.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-brand-deep hover:bg-brand-mid text-white rounded text-sm font-mono transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
