import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AMBITOS } from '@/lib/regen'
import { RegenForm } from './RegenForm'

export default async function RegenPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Historial propio (RLS: user_id = auth.uid()). Solo columnas necesarias.
  const { data: previas } = await supabase
    .from('regen_evaluaciones')
    .select('created_at, safety_triggered')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-2xl">
      <Link href="/miembros" className="text-xs font-mono text-faint hover:text-white">← Volver</Link>
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
