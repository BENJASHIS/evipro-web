'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    setLoading(true); setError(null); setOk(false)
    const form = new FormData(formEl)
    const res = await fetch('/api/admin/content', { method: 'POST', body: form })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Error al subir'); return }
    setOk(true)
    formEl.reset()
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="border border-subtle rounded-lg p-6 mb-10 space-y-4">
      <div>
        <label className="block text-xs text-muted mb-1 uppercase tracking-widest">Archivo (PNG/JPG ≤ 2 MB · PDF ≤ 10 MB)</label>
        <input name="file" type="file" accept="image/png,image/jpeg,application/pdf" required
          className="w-full text-sm text-muted file:mr-3 file:rounded file:border-0 file:bg-brand-deep file:text-white file:px-3 file:py-1.5" />
        <p className="text-xs text-faint font-mono mt-1">Infografías: vertical 4:5 (ej. 1080×1350).</p>
      </div>
      <div>
        <label className="block text-xs text-muted mb-1 uppercase tracking-widest">Título</label>
        <input name="title" required className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand" />
      </div>
      <div>
        <label className="block text-xs text-muted mb-1 uppercase tracking-widest">Descripción (opcional)</label>
        <textarea name="body" rows={2} className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-widest">Tipo</label>
          <select name="content_type" defaultValue="infographic" className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm">
            <option value="infographic">Infografía</option>
            <option value="guide">Guía</option>
            <option value="article">Artículo</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-widest">Categoría (opcional)</label>
          <input name="category" placeholder="cannabis, sueño…" className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-muted mb-1 uppercase tracking-widest">Plan mínimo</label>
        <select name="min_plan" defaultValue="" className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm">
          <option value="">Todos los miembros</option>
          <option value="express">Express o superior</option>
          <option value="cannabis">Cannabis o Integral</option>
          <option value="integral">Solo Integral</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input name="publish" type="checkbox" value="true" defaultChecked /> Publicar ahora
      </label>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {ok && <p className="text-brand text-xs">Contenido subido.</p>}
      <button type="submit" disabled={loading}
        className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50">
        {loading ? 'Subiendo…' : 'Subir contenido'}
      </button>
    </form>
  )
}
