import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import HabitTracker from './HabitTracker'

export default async function HabitosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getMemberAccess(supabase, user)
  if (!canUseMemberTools(access)) {
    return (
      <div className="max-w-2xl">
        <Link href="/miembros/herramientas" className="text-xs font-mono text-faint hover:text-white">← Volver</Link>
        <h1 className="mt-3 text-2xl font-semibold">Bitácora de hábitos</h1>
        <div className="mt-6 rounded-lg border border-subtle p-8 text-center">
          <p className="mb-4 text-sm text-muted">
            La bitácora está disponible para miembros con membresía activa.
          </p>
          <Link href="/planes#membresias" className="text-sm font-mono text-brand hover:underline">
            Ver membresías →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link href="/miembros/herramientas" className="text-xs font-mono text-faint hover:text-white">← Volver</Link>
      {access.adminPreview && (
        <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4">
          <p className="text-sm text-brand">
            Modo admin · vista previa de bitácora sin membresía activa.
          </p>
        </div>
      )}

      <p className="mb-2 mt-6 text-xs font-mono uppercase tracking-widest text-brand">Herramienta para miembros</p>
      <h1 className="mb-3 text-3xl font-light">Bitácora de hábitos</h1>
      <p className="mb-8 max-w-2xl text-sm leading-6 text-faint">
        Registra señales simples de sueño, agua, alcohol, fármacos, comidas y síntomas para revisar patrones en consulta.
      </p>

      <HabitTracker />
    </div>
  )
}
