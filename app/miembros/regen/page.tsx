import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AMBITOS } from '@/lib/regen'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'
import { RegenForm } from './RegenForm'

export default async function RegenPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getMemberAccess(supabase, user)
  if (!canUseMemberTools(access)) {
    return (
      <div className="max-w-2xl">
        <Link href="/miembros/herramientas" className="text-xs font-mono text-faint hover:text-white">← Volver</Link>
        <h1 className="text-2xl font-semibold mt-3">Regen</h1>
        <div className="border border-subtle rounded-lg p-8 text-center mt-6">
          <p className="text-muted text-sm mb-4">
            Regen está disponible para miembros con membresía activa.
          </p>
          <Link href="/planes#membresias" className="text-brand text-sm font-mono hover:underline">
            Ver membresías →
          </Link>
        </div>
      </div>
    )
  }

  // Historial propio (RLS: user_id = auth.uid()). Solo columnas necesarias.
  const { data: previas } = await supabase
    .from('regen_evaluaciones')
    .select('created_at, safety_triggered')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-2xl">
      <Link href="/miembros/herramientas" className="text-xs font-mono text-faint hover:text-white">← Volver</Link>
      {access.adminPreview && (
        <div className="border border-brand/30 bg-brand/5 rounded-lg p-4 mt-4">
          <p className="text-brand text-sm">
            Modo admin · vista previa de Regen sin membresía activa.
          </p>
        </div>
      )}
      <h1 className="text-2xl font-semibold mt-3">¿Cómo está tu entorno?</h1>
      <p className="text-sm text-faint mt-2">
        Una mirada al clima de tus 4 ámbitos: hogar, trabajo, familia y círculo social.
        Es una herramienta de autoconocimiento y bienestar, no un diagnóstico. Nadie más ve tus respuestas.
      </p>

      <RegenForm ambitos={AMBITOS} />

      {previas && previas.length > 0 && (
        <section className="mt-10 border-t border-subtle pt-4">
          <h2 className="text-sm font-mono text-faint">Tus evaluaciones anteriores</h2>
          <ul className="mt-2 text-xs text-faint font-mono space-y-1">
            {previas.map((p, i) => (
              <li key={i}>{new Date(p.created_at as string).toLocaleDateString('es-PE')}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
