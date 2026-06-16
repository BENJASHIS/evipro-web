import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const ADMIN_EMAILS = ['drecs2003@gmail.com', 'consulta@evipro.pe']
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) redirect('/miembros')
  return <div className="min-h-screen bg-ink text-white p-8">{children}</div>
}
