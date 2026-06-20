import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { hasUnread } from '@/lib/messages'

export default async function MiembrosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conv } = await supabase
    .from('conversations')
    .select('last_message_at, last_sender_role, member_last_read_at, admin_last_read_at')
    .eq('user_id', user.id)
    .maybeSingle()
  const unreadMessages = conv ? hasUnread(conv, 'member') : false

  async function signOut() {
    'use server'
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <nav className="border-b border-subtle px-6 py-4 flex items-center justify-between">
        <Link href="/miembros" className="font-serif italic text-lg text-white">EVIPro</Link>
        <div className="flex items-center gap-6 flex-wrap">
          {[
            { href: '/miembros', label: 'Inicio' },
            { href: '/miembros/contenido', label: 'Contenido' },
            { href: '/miembros/recetas', label: 'Farmacia' },
            { href: '/miembros/mensajes', label: 'Mensajes' },
            { href: '/miembros/sorteos', label: 'Sorteos' },
            { href: '/miembros/perfil', label: 'Perfil' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="relative text-xs font-mono uppercase tracking-widest text-muted hover:text-white transition-colors">
              {link.label}
              {link.href === '/miembros/mensajes' && unreadMessages && (
                <span className="absolute -top-1.5 -right-2.5 w-1.5 h-1.5 rounded-full bg-brand" />
              )}
            </Link>
          ))}
          <form action={signOut}>
            <button type="submit" className="text-xs font-mono uppercase tracking-widest text-faint hover:text-white transition-colors">
              Salir
            </button>
          </form>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-12">{children}</main>
    </div>
  )
}
