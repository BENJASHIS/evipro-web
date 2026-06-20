'use client'
import { useRouter } from 'next/navigation'
import type { Content } from '@/lib/types'

export default function ContentList({ items }: { items: Partial<Content>[] }) {
  const router = useRouter()

  async function togglePublish(id: string, publish: boolean) {
    await fetch(`/api/admin/content/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish }),
    })
    router.refresh()
  }
  async function remove(id: string) {
    if (!confirm('¿Eliminar este contenido?')) return
    await fetch(`/api/admin/content/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  if (!items.length) return <p className="text-muted text-sm">Aún no hay contenido.</p>

  return (
    <div className="space-y-2">
      {items.map(it => (
        <div key={it.id} className="flex items-center justify-between border border-subtle rounded p-3 text-sm">
          <div>
            <p className="text-white">{it.title}</p>
            <p className="text-xs text-faint font-mono">
              {it.content_type} · {it.min_plan ?? 'todos'} · {it.published_at ? 'publicado' : 'borrador'}
            </p>
          </div>
          <div className="flex gap-3 text-xs font-mono">
            <button onClick={() => togglePublish(it.id!, !it.published_at)} className="text-brand hover:underline">
              {it.published_at ? 'Despublicar' : 'Publicar'}
            </button>
            <button onClick={() => remove(it.id!)} className="text-red-400 hover:underline">Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
