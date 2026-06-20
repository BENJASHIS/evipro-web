import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
import Inbox from './Inbox'

export default async function AdminMensajesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!isAdminUser(user)) redirect('/miembros')

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2">Admin</p>
        <h1 className="text-3xl font-light font-serif italic mb-8">Mensajería</h1>
        <Inbox />
      </div>
    </main>
  )
}
