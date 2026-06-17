import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

const TYPE_LABELS = { article: 'Artículo', video: 'Video', guide: 'Guía' }
const TYPE_ICONS = { article: '📄', video: '🎥', guide: '📋' }

export default async function ContenidoPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('content')
    .select('*')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2">Biblioteca</p>
      <h1 className="text-3xl font-light font-serif italic mb-8">Contenido exclusivo</h1>

      {!items?.length ? (
        <div className="border border-subtle rounded-lg p-8 text-center">
          <p className="text-muted text-sm">Próximamente — estamos preparando contenido exclusivo para miembros.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="border border-subtle rounded-lg p-6 hover:border-strong transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{TYPE_ICONS[item.content_type as keyof typeof TYPE_ICONS]}</span>
                <span className="text-xs font-mono text-faint uppercase tracking-widest">
                  {TYPE_LABELS[item.content_type as keyof typeof TYPE_LABELS]}
                </span>
              </div>
              <h2 className="text-lg font-light mb-2">{item.title}</h2>
              <p className="text-muted text-sm leading-relaxed">{item.body}</p>
              <p className="text-xs text-faint font-mono mt-4">
                {item.published_at ? new Date(item.published_at).toLocaleDateString('es-PE') : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
