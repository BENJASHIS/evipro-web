import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MiembrosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  async function signOut() {
    'use server'
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#080a08] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/miembros" className="font-serif italic text-lg text-white">EVIPro</Link>
        <div className="flex items-center gap-6 flex-wrap">
          {[
            { href: '/miembros', label: 'Inicio' },
            { href: '/miembros/sorteos', label: 'Sorteos' },
            { href: '/miembros/contenido', label: 'Contenido' },
            { href: '/miembros/recetas', label: 'Farmacia' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
          <form action={signOut}>
            <button type="submit" className="text-xs font-mono uppercase tracking-widest text-gray-600 hover:text-white transition-colors">
              Salir
            </button>
          </form>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-12">{children}</main>
    </div>
  )
}
