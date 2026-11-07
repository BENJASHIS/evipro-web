'use client'
import { useState, useEffect } from 'react'
import { T } from '@/app/components/Language'

export default function PerfilPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) throw new Error()
        const data = await res.json() as { full_name: string; email: string }
        setName(data.full_name)
        setEmail(data.email)
      } catch { setError('No se pudo cargar el perfil.') }
      finally { setLoading(false) }
    }
    loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name }),
      })
      if (!res.ok) throw new Error()
      setSuccess(true)
    } catch { setError('No se pudo guardar el perfil.') }
    finally { setSaving(false) }
  }

  if (loading) return <p className="text-faint font-mono text-sm"><T>Cargando...</T></p>
  return <div className="max-w-md">
    <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>Cuenta</T></p>
    <h1 className="text-3xl font-light font-serif italic mb-4"><T>Mi perfil</T></h1>
    <p className="text-sm text-muted mb-6"><T>No necesitas documento, teléfono ni datos de salud para usar tu cuenta educativa. Si solicitas atención, te explicaremos qué datos necesitamos y para qué.</T></p>
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label htmlFor="profile-email" className="block text-xs text-muted mb-1"><T>Correo electrónico</T></label>
        <input id="profile-email" type="email" value={email} readOnly className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="profile-name" className="block text-xs text-muted mb-1"><T>Nombre para mostrar (opcional)</T></label>
        <input id="profile-name" name="full_name" autoComplete="name" maxLength={120} value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-sm focus:outline-none focus:border-brand" />
      </div>
      {error && <p role="alert" className="text-red-400 text-xs"><T>{error}</T></p>}
      {success && <p role="status" className="text-brand text-xs"><T>Perfil actualizado correctamente.</T></p>}
      <button type="submit" disabled={saving} className="w-full py-2.5 bg-brand-deep hover:bg-brand-mid text-white rounded text-sm disabled:opacity-50"><T>{saving ? 'Guardando...' : 'Guardar cambios'}</T></button>
    </form>
  </div>
}
