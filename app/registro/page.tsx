'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function RegistroPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', city: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: `${location.origin}/miembros` },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: form.full_name,
        phone: form.phone || null,
        city: form.city || null,
      })
      if (profileError) { setError('Error al crear perfil. Intenta de nuevo.'); setLoading(false); return }
    }

    router.push('/planes')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#080a08] py-12">
      <div className="w-full max-w-sm p-8 border border-white/10 rounded-lg">
        <h1 className="text-2xl font-light text-white mb-2 font-serif italic">EVIPro</h1>
        <p className="text-sm text-gray-400 mb-8">Crea tu cuenta para suscribirte</p>

        <form onSubmit={handleRegistro} className="space-y-4">
          {[
            { name: 'full_name', label: 'Nombre completo', type: 'text', required: true },
            { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
            { name: 'password', label: 'Contraseña', type: 'password', required: true },
            { name: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', required: false },
            { name: 'city', label: 'Ciudad', type: 'text', required: false },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">
                {field.label}{field.required && ' *'}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                required={field.required}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
              />
            </div>
          ))}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#2d5a27] hover:bg-[#4a8c42] text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#7bc96f] hover:underline">Ingresar</Link>
        </p>
      </div>
    </main>
  )
}
