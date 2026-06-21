import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { hasUnread } from '@/lib/messages'
import { isAdminUser } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect('/miembros')

  const { data: convs } = await supabase
    .from('conversations')
    .select('last_message_at, last_sender_role, member_last_read_at, admin_last_read_at')
  const unreadThreads = (convs ?? []).filter(c => hasUnread(c, 'admin')).length

  const links = [
    { href: '/admin', label: 'Panel' },
    { href: '/admin/contenido', label: 'Contenido' },
    { href: '/admin/mensajes', label: 'Mensajes' },
    { href: '/admin/consejeria', label: 'Consejería' },
  ]

  return (
    <div className="min-h-screen bg-ink text-white">
      <nav className="border-b border-subtle px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="font-serif italic text-lg text-white">EVIPro · Admin</Link>
        <div className="flex items-center gap-6 flex-wrap">
          {links.map(link => (
            <Link key={link.href} href={link.href}
              className="relative text-xs font-mono uppercase tracking-widest text-muted hover:text-white transition-colors">
              {link.label}
              {link.href === '/admin/mensajes' && unreadThreads > 0 && (
                <span className="absolute -top-2 -right-3 min-w-[1rem] h-4 px-1 rounded-full bg-brand text-[10px] text-white flex items-center justify-center">
                  {unreadThreads}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
      <main className="p-8">{children}</main>
    </div>
  )
}
