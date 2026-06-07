'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

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
    <main className="min-h-screen flex items-center justify-center bg-[#080a08]">
      <div className="w-full max-w-sm p-8 border border-white/10 rounded-lg">
        <h1 className="text-2xl font-light text-white mb-2 font-serif italic">EVIPro</h1>
        <p className="text-sm text-gray-400 mb-8">Ingresa a tu membresía</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Correo</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#2d5a27] hover:bg-[#4a8c42] text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          ¿No tienes membresía?{' '}
          <Link href="/planes" className="text-[#7bc96f] hover:underline">Ver planes</Link>
        </p>
      </div>
    </main>
  )
}
