import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AMBITOS } from '@/lib/regen'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'
import { RegenForm } from './RegenForm'
import { T } from '@/app/components/Language'
import { RegenHistory } from './RegenResults'

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
  const { data: previas, error } = await supabase
    .from('regen_evaluaciones')
    .select('created_at, version, scores, flags, safety_triggered')
    .eq('user_id', user.id)
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
      <p className="text-xs text-brand font-mono uppercase tracking-widest mt-6"><T>Regen · Mi entorno</T></p>
      <h1 className="text-3xl font-serif mt-3"><T>¿Cómo está tu entorno?</T></h1>
      <p className="text-sm text-faint mt-2">
        <T>Una reflexión sobre hogar, trabajo, familia y círculo social. Es una herramienta de bienestar con preguntas propias, no un diagnóstico ni una escala clínica validada.</T>
      </p>
      <p className="text-xs text-muted mt-3"><T>Tu historial no es público. Guardamos fecha, versión, puntajes y señales de apoyo; no guardamos texto libre. Este formulario no se vigila en tiempo real.</T></p>

      <RegenForm ambitos={AMBITOS} />

      {error ? <p role="alert" className="mt-8 text-sm text-red-300"><T>No se pudo cargar tu historial. Puedes usar el cuestionario y volver a cargar la página más tarde.</T></p> : <RegenHistory entries={previas ?? []} />}
    </div>
  )
}
