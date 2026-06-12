'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setForm({
            full_name: data.full_name ?? '',
            phone: data.phone ?? '',
            city: data.city ?? '',
            doc_type: (data.doc_type as DocType) ?? 'dni',
            doc_number: data.dni_encrypted ?? '',
            country_origin: data.country_origin ?? '',
          })
        }
        setLoading(false)
      })
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: form.full_name,
      phone: form.phone || null,
      city: form.city || null,
      doc_type: form.doc_type,
      dni_encrypted: form.doc_number || null,
      country_origin: form.country_origin || null,
    })
    if (err) setError('Error al guardar. Intenta de nuevo.')
    else setSuccess(true)
    setSaving(false)
  }

  if (loading) return <p className="text-gray-500 font-mono text-sm">Cargando...</p>

  return (
    <div className="max-w-md">
      <p className="text-xs font-mono uppercase tracking-widest text-[#7bc96f] mb-2">Cuenta</p>
      <h1 className="text-3xl font-light font-serif italic mb-8">Mi perfil</h1>

      <p className="text-xs text-gray-500 font-mono mb-6">{email}</p>

      <form onSubmit={handleSave} className="space-y-4">
        {[
          { name: 'full_name', label: 'Nombre completo', type: 'text', required: true },
          { name: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', required: false },
          { name: 'city', label: 'Ciudad de residencia', type: 'text', required: false },
        ].map(field => (
          <div key={field.name}>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest font-mono">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              required={field.required}
              value={form[field.name as keyof typeof form]}
              onChange={e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest font-mono">
            Tipo de documento
          </label>
          <select
            name="doc_type"
            value={form.doc_type}
            onChange={e => setForm(prev => ({ ...prev, doc_type: e.target.value as DocType }))}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
          >
            {DOC_TYPES.map(d => (
              <option key={d.value} value={d.value} className="bg-[#080a08]">{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest font-mono">
            Número de documento
          </label>
          <input
            type="text"
            name="doc_number"
            value={form.doc_number}
            onChange={e => setForm(prev => ({ ...prev, doc_number: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
          />
        </div>

        {form.doc_type !== 'dni' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest font-mono">
              País de origen
            </label>
            <input
              type="text"
              name="country_origin"
              value={form.country_origin}
              onChange={e => setForm(prev => ({ ...prev, country_origin: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
            />
          </div>
        )}

        {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
        {success && <p className="text-[#7bc96f] text-xs font-mono">Perfil actualizado correctamente.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-[#2d5a27] hover:bg-[#4a8c42] text-white rounded text-sm font-mono transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
