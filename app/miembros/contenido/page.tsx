import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { attachSignedUrls, MEMBER_CONTENT_BUCKET, type ContentRow } from '@/lib/content'

const TYPE_LABELS: Record<string, string> = {
  article: 'Artículo', video: 'Video', guide: 'Guía', infographic: 'Infografía',
}

export default async function ContenidoPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('content')
    .select('id, title, body, content_type, file_path, file_kind, category, published_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  const service = createServiceClient()
  const sign = async (path: string) => {
    const { data } = await service.storage.from(MEMBER_CONTENT_BUCKET).createSignedUrl(path, 3600)
    return data?.signedUrl ?? null
  }
  const items = await attachSignedUrls((data ?? []) as ContentRow[], sign)

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2">Biblioteca</p>
      <h1 className="text-3xl font-light font-serif italic mb-8">Contenido exclusivo</h1>

      {!items.length ? (
        <div className="border border-subtle rounded-lg p-8 text-center">
          <p className="text-muted text-sm">Próximamente — estamos preparando contenido exclusivo para miembros.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map(item => (
            <div key={item.id} className="border border-subtle rounded-lg overflow-hidden hover:border-strong transition-colors">
              {item.file_kind === 'image' && item.file_url && (
                <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-[4/5] bg-surface-2">
                  <Image src={item.file_url} alt={item.title} fill className="object-contain" sizes="(max-width: 640px) 100vw, 50vw" />
                </a>
              )}
              <div className="p-5">
                <span className="text-xs font-mono text-faint uppercase tracking-widest">
                  {TYPE_LABELS[item.content_type] ?? item.content_type}
                </span>
                <h2 className="text-lg font-light mt-1 mb-2">{item.title}</h2>
                {item.body && <p className="text-muted text-sm leading-relaxed mb-3">{item.body}</p>}
                {item.file_kind === 'pdf' && item.file_url && (
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer"
                    className="inline-block text-xs font-mono text-brand hover:underline">
                    Ver / descargar PDF →
                  </a>
                )}
                {item.published_at && (
                  <p className="text-xs text-faint font-mono mt-3">
                    {new Date(item.published_at).toLocaleDateString('es-PE')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
