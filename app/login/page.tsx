'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Marca from '@/app/components/ui/Marca'
import PasswordInput from '@/app/components/ui/PasswordInput'
import Turnstile, { TURNSTILE_CLIENT_ENABLED } from '@/app/components/Turnstile'

function loginErrorMessage(error: { message?: string; code?: string }) {
  const details = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase()
  if (details.includes('captcha')) {
    return 'No pudimos completar la verificación anti-bot. Recarga la página e intenta otra vez.'
  }
  if (details.includes('email_not_confirmed') || details.includes('email not confirmed')) {
    return 'Confirma tu correo antes de ingresar.'
  }
  return 'Correo o contraseña incorrectos. Si ya tenías cuenta, recupera tu contraseña.'
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileReset, setTurnstileReset] = useState(0)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (TURNSTILE_CLIENT_ENABLED && !turnstileToken) {
      setError('Completa la verificación anti-bot.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      ...(turnstileToken ? { options: { captchaToken: turnstileToken } } : {}),
    })
    if (error) {
      setTurnstileToken('')
      setTurnstileReset(prev => prev + 1)
      setError(loginErrorMessage(error))
      setLoading(false)
      return
    }
    router.push('/miembros')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink">
      <div className="w-full max-w-sm p-8 border border-subtle rounded-lg">
        <div className="mb-2"><Marca size={36} /></div>
        <p className="text-sm text-muted mb-8">Ingresa a tu membresía</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs text-muted mb-1 uppercase tracking-widest">Correo</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs text-muted mb-1 uppercase tracking-widest">Contraseña</label>
            <PasswordInput
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <Turnstile
            action="login"
            appearance="always"
            resetSignal={turnstileReset}
            onVerify={setTurnstileToken}
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading || (TURNSTILE_CLIENT_ENABLED && !turnstileToken)}
            className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-faint mt-6">
          <Link href="/recuperar-contrasena" className="text-brand hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="text-center text-xs text-faint mt-3">
          ¿No tienes membresía?{' '}
          <Link href="/planes" className="text-brand hover:underline">Ver planes</Link>
        </p>
      </div>
    </main>
  )
}
