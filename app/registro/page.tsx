'use client'
import GoogleSignIn from '@/app/components/GoogleSignIn'
import { useBottleEntry, BOTTLE_NEXT } from '@/lib/use-bottle-entry'
import { BOTTLE_PATH } from '@/lib/member-return'
import { T } from '@/app/components/Language'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Marca from '@/app/components/ui/Marca'
import PasswordInput from '@/app/components/ui/PasswordInput'
import Turnstile, { TURNSTILE_CLIENT_ENABLED } from '@/app/components/Turnstile'
const MIN_PASSWORD = 8

const INPUT = 'w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand'
const LABEL = 'block text-xs text-muted mb-1 uppercase tracking-widest'

export default function RegistroPage() {
  const bottleEntry = useBottleEntry()
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirm: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileReset, setTurnstileReset] = useState(0)
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegistro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Trampa para bots: un campo que un humano nunca ve ni llena.
    if ((new FormData(e.currentTarget).get('website') as string)?.trim()) return
    setError(null)
    if (form.password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`)
      return
    }
    if (form.password !== form.password_confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (TURNSTILE_CLIENT_ENABLED && !turnstileToken) {
      setError('Completa la verificación anti-bot.')
      return
    }
    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${location.origin}/auth/confirm${bottleEntry ? BOTTLE_NEXT : ''}`,
        ...(turnstileToken ? { captchaToken: turnstileToken } : {}),
        data: { terms_accepted_at: new Date().toISOString() },
      },
    })

    if (signUpError) {
      setTurnstileToken('')
      setTurnstileReset(prev => prev + 1)
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.session) router.push(bottleEntry ? BOTTLE_PATH : '/miembros')
    else { setConfirmationSent(true); setLoading(false) }
  }

  return (
    <main className="public-page min-h-screen bg-ink px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <aside className="pt-2 lg:sticky lg:top-8">
          <div className="mb-10"><Marca /></div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3"><T>{"Registro EVIPro"}</T></p>
          <h1 className="max-w-xl text-4xl font-light text-white mb-4"><T>{bottleEntry ? 'Explora el CBD con una cuenta gratuita.' : 'Tu acceso a herramientas, beneficios y seguimiento.'}</T></h1>
          <p className="max-w-lg text-sm leading-6 text-muted mb-6"><T>{bottleEntry ? 'Tu cuenta permite ver el frasco y la molécula de CBD. No necesitas pagar ni ingresar un documento. THC, mezclas y calculadora requieren membresía activa.' : 'Crea tu cuenta con Google o correo y contraseña. No pedimos documento, teléfono ni datos de salud para registrarte. Si decides solicitar atención, te pediremos los datos necesarios en ese momento.'}</T></p>
          {!bottleEntry && <div className="grid gap-3 text-sm">
            <Link
              href="/planes#turista"
              className="flex items-center justify-between border border-yellow-400/30 bg-yellow-400/5 rounded px-4 py-3 text-yellow-100 hover:border-yellow-400/60 transition-colors"
            >
              <span><T>{"Plan Turista"}</T></span>
              <span className="font-mono text-xs text-yellow-300"><T>{"Antes de viajar"}</T></span>
            </Link>
            <Link
              href="/medicos"
              className="flex items-center justify-between border border-subtle rounded px-4 py-3 text-muted hover:border-brand/50 hover:text-white transition-colors"
            >
              <span><T>{"Consulta sin cuenta"}</T></span>
              <span className="font-mono text-xs text-brand"><T>{"Agendar"}</T></span>
            </Link>
          </div>}
        </aside>

        <section className="w-full border border-subtle rounded-lg p-6 sm:p-8">
          <h2 className="text-2xl font-light text-white mb-2"><T>{"Crea tu cuenta"}</T></h2>
          <p className="text-sm text-muted mb-8"><T>{bottleEntry ? 'Usa un correo al que tengas acceso. Si se solicita confirmación, revisa tu bandeja de entrada.' : 'Usa un correo al que tengas acceso; ahí recibirás la confirmación de cuenta.'}</T></p>

          {!confirmationSent && <GoogleSignIn next={bottleEntry ? BOTTLE_PATH : '/miembros'} />}
          {confirmationSent ? <div role="status" className="text-sm leading-6">
            <p><T>{bottleEntry ? 'Revisa tu correo para confirmar tu cuenta. Después podrás abrir el visor de CBD.' : 'Revisa tu correo para confirmar tu cuenta. Después podrás iniciar sesión.'}</T></p>
            <Link href={bottleEntry ? `/login${BOTTLE_NEXT}` : '/login'} className="inline-block mt-4 text-brand underline"><T>{bottleEntry ? 'Ya confirmé mi correo · ingresar al visor' : 'Ya confirmé mi correo · ingresar'}</T></Link>
          </div> : <form onSubmit={handleRegistro} className="space-y-6">
          {/* Trampa para bots: oculta a la vista y al lector de pantalla. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <fieldset className="space-y-4">
            <legend className="text-xs font-mono text-faint uppercase tracking-widest mb-3"><T>{"1 · Tu cuenta"}</T></legend>

            <div>
              <label htmlFor="email" className={LABEL}><T>Correo electrónico</T> *</label>
              <input id="email" type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required className={INPUT} />
            </div>

            <div>
              <label htmlFor="password" className={LABEL}><T>{"Contraseña *"}</T></label>
              <PasswordInput
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
              />
              <p className="text-xs text-faint mt-1"><T>{"Mínimo "}</T>{MIN_PASSWORD}<T>{" caracteres."}</T></p>
            </div>

            <div>
              <label htmlFor="password_confirm" className={LABEL}><T>{"Repite tu contraseña *"}</T></label>
              <PasswordInput
                id="password_confirm"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
              />
              {form.password_confirm && form.password !== form.password_confirm && (
                <p className="text-xs text-red-400 mt-1"><T>{"Todavía no coincide."}</T></p>
              )}
            </div>
          </fieldset>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" required className="mt-0.5 accent-brand" />
            <span className="text-xs text-muted leading-relaxed">
              <T>{"He leído y acepto los "}</T>
              <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-brand underline"><T>{"Términos y Condiciones"}</T></a>
              <T>{" y autorizo el tratamiento de mis datos personales."}</T>
            </span>
          </label>
          <Turnstile
            action="registro"
            resetSignal={turnstileReset}
            onVerify={setTurnstileToken}
            className="pt-1"
          />

          {error && <p className="text-red-400 text-xs"><T>{error}</T></p>}

          <button
            type="submit"
            disabled={loading || (TURNSTILE_CLIENT_ENABLED && !turnstileToken)}
            className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            <T>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</T>
          </button>
        </form>}

        <p className="text-center text-xs text-faint mt-6"><T>{"¿Ya tienes cuenta?"}</T>{' '}
          <Link href={bottleEntry ? `/login${BOTTLE_NEXT}` : '/login'} className="text-brand hover:underline"><T>{"Ingresar"}</T></Link>
        </p>
        </section>
      </div>
    </main>
  )
}
