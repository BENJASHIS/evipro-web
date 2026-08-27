import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'
import CannabinoidCalculator from './CannabinoidCalculator'

export default async function CalculadoraCannabinoidePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getMemberAccess(supabase, user)
  if (!canUseMemberTools(access)) {
    return (
      <div className="max-w-2xl">
        <Link href="/miembros/herramientas" className="text-xs font-mono text-faint hover:text-white">← Volver</Link>
        <h1 className="text-2xl font-semibold mt-3">Calculadora cannabinoide</h1>
        <div className="border border-subtle rounded-lg p-8 text-center mt-6">
          <p className="text-muted text-sm mb-4">
            La calculadora está disponible para miembros con membresía activa.
          </p>
          <Link href="/planes#membresias" className="text-brand text-sm font-mono hover:underline">
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
        <div className="border border-brand/30 bg-brand/5 rounded-lg p-4 mt-4">
          <p className="text-brand text-sm">
            Modo admin · vista previa de calculadora sin membresía activa.
          </p>
        </div>
      )}
      <p className="text-xs font-mono uppercase tracking-widest text-brand mt-6 mb-2">Herramienta para miembros</p>
      <h1 className="text-3xl font-light mb-3">Calculadora cannabinoide</h1>
      <p className="max-w-2xl text-sm leading-6 text-faint mb-8">
        Convierte etiquetas de aceites a mg/ml y gotas; y etiquetas de inhalables a mg totales y contenido teórico por inhalación.
      </p>

      <CannabinoidCalculator />
    </div>
  )
}
