'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }
    router.push('/miembros')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink">
      <div className="w-full max-w-sm p-8 border border-subtle rounded-lg">
        <Link href="/" className="flex items-center gap-2 mb-2 w-fit">
          <Image
            src="/images/logo-evipro.png"
            alt="EVIPro"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="text-2xl tracking-tight">
            <span className="font-bold text-white">EVI</span><span className="font-serif italic text-brand">Pro</span>
          </span>
        </Link>
        <p className="text-sm text-muted mb-8">Ingresa a tu membresía</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-widest">Correo</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-widest">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-faint mt-6">
          ¿No tienes membresía?{' '}
          <Link href="/planes" className="text-brand hover:underline">Ver planes</Link>
        </p>
      </div>
    </main>
  )
}
