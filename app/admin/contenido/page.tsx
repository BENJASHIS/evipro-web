import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
import type { Content } from '@/lib/types'
import UploadForm from './UploadForm'
import ContentList from './ContentList'

export default async function AdminContenidoPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!isAdminUser(user)) redirect('/miembros')

  const { data: items } = await supabase
    .from('content')
    .select('id, title, content_type, category, min_plan, file_kind, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2">Admin</p>
        <h1 className="text-3xl font-light font-serif italic mb-8">Biblioteca de contenido</h1>
        <UploadForm />
        <ContentList items={(items ?? []) as Partial<Content>[]} />
      </div>
    </main>
  )
}
