'use client'

import { useState } from 'react'
import Link from 'next/link'
import Marca from '@/app/components/ui/Marca'
import Turnstile, { TURNSTILE_CLIENT_ENABLED } from '@/app/components/Turnstile'
import { createClient } from '@/lib/supabase'

const INPUT = 'w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand'
const LABEL = 'block text-xs text-muted mb-1 uppercase tracking-widest'

function recoveryErrorMessage(error: { message?: string; code?: string }) {
  const details = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase()
  if (details.includes('captcha')) {
    return 'No pudimos completar la verificación anti-bot. Recarga la página e intenta otra vez.'
  }
  if (details.includes('redirect')) {
    return 'No pudimos preparar el enlace de recuperación. Revisa la configuración de URLs en Supabase.'
  }
  return 'No pudimos enviar el enlace. Intenta nuevamente en unos minutos.'
}

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileReset, setTurnstileReset] = useState(0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if ((new FormData(e.currentTarget).get('website') as string)?.trim()) return
    setError(null)
    setSent(false)

    if (TURNSTILE_CLIENT_ENABLED && !turnstileToken) {
      setError('Completa la verificación anti-bot.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/actualizar-contrasena`,
      ...(turnstileToken ? { captchaToken: turnstileToken } : {}),
    })

    setLoading(false)

    if (resetError) {
      setTurnstileToken('')
      setTurnstileReset(prev => prev + 1)
      setError(recoveryErrorMessage(resetError))
      return
    }

    setSent(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm p-8 border border-subtle rounded-lg">
        <div className="mb-2"><Marca size={36} /></div>
        <p className="text-sm text-muted mb-8">Recupera tu acceso</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <div>
            <label htmlFor="email" className={LABEL}>Correo</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={INPUT}
            />
          </div>

          <Turnstile
            action="password-reset"
            resetSignal={turnstileReset}
            onVerify={setTurnstileToken}
          />

          {error && <p className="text-red-400 text-xs leading-5">{error}</p>}
          {sent && (
            <p className="text-brand text-xs leading-5">
              Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (TURNSTILE_CLIENT_ENABLED && !turnstileToken)}
            className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <p className="text-center text-xs text-faint mt-6">
          <Link href="/login" className="text-brand hover:underline">Volver a ingresar</Link>
        </p>
      </div>
    </main>
  )
}
