'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Marca from '@/app/components/ui/Marca'
import PasswordInput from '@/app/components/ui/PasswordInput'
import { createClient } from '@/lib/supabase'

const MIN_PASSWORD = 8

export default function ActualizarContrasenaPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function prepareRecoverySession() {
      const supabase = createClient()
      const code = new URL(location.href).searchParams.get('code')

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelled && exchangeError) {
          setError('El enlace de recuperación venció o ya fue usado. Solicita uno nuevo.')
          setChecking(false)
          return
        }
        history.replaceState(null, '', '/actualizar-contrasena')
      }

      const { data } = await supabase.auth.getSession()
      if (cancelled) return

      if (!data.session) {
        setError('Abre esta página desde el enlace de recuperación enviado a tu correo.')
        setReady(false)
      } else {
        setReady(true)
      }
      setChecking(false)
    }

    prepareRecoverySession()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('No pudimos actualizar la contraseña. Solicita un nuevo enlace e intenta otra vez.')
      return
    }

    setPassword('')
    setConfirmPassword('')
    setSuccess(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm p-8 border border-subtle rounded-lg">
        <div className="mb-2"><Marca size={36} /></div>
        <p className="text-sm text-muted mb-8">Crea una nueva contraseña</p>

        {checking ? (
          <p className="text-sm text-muted">Validando enlace...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs text-muted mb-1 uppercase tracking-widest">
                Nueva contraseña
              </label>
              <PasswordInput
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
              />
              <p className="text-xs text-faint mt-1">Mínimo {MIN_PASSWORD} caracteres.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs text-muted mb-1 uppercase tracking-widest">
                Repite tu nueva contraseña
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
              />
            </div>

            {error && <p className="text-red-400 text-xs leading-5">{error}</p>}
            {success && (
              <p className="text-brand text-xs leading-5">
                Contraseña actualizada. Ya puedes entrar a tu área de miembro.
              </p>
            )}

            <button
              type="submit"
              disabled={!ready || loading || success}
              className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-faint mt-6">
          {success ? (
            <Link href="/miembros" className="text-brand hover:underline">Ir a miembros</Link>
          ) : (
            <Link href="/recuperar-contrasena" className="text-brand hover:underline">Solicitar nuevo enlace</Link>
          )}
        </p>
      </div>
    </main>
  )
}
