import Link from 'next/link'
import { redirect } from 'next/navigation'
import { T } from '@/app/components/Language'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getMemberAccess } from '@/lib/member-access'
import { moduloVisible, nivelModulo } from '@/lib/educacion/acceso-modulo'
import { REVISION, seccionesPara, preguntasPara, fuentesDe } from '@/lib/educacion/contenido-planta'
import ModuloPlanta from './ModuloPlanta'

export default async function QueHayEnLaPlantaPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const access = await getMemberAccess(supabase, user)
  if (!moduloVisible(access, REVISION.version !== null)) redirect('/miembros/contenido')
  const nivel = nivelModulo(access)

  if (nivel === 'sin_acceso') return <div>
    <Link href="/miembros/contenido" className="text-xs font-mono text-faint hover:text-white"><T>← Volver</T></Link>
    <h1 className="text-3xl sm:text-4xl font-serif mt-6 mb-6"><T>¿Qué hay en la planta?</T></h1>
    <div className="border-t border-subtle pt-6">
      <p className="text-muted text-sm mb-4"><T>Esta zona se activa con una membresía vigente.</T></p>
      <Link href="/planes#membresias" className="inline-block bg-brand text-black px-6 py-3 rounded text-sm"><T>Ver membresías →</T></Link>
    </div>
  </div>

  const secciones = seccionesPara(nivel)
  return <ModuloPlanta nivel={nivel} secciones={secciones} preguntas={preguntasPara(nivel)}
    fuentes={fuentesDe(secciones)} revision={REVISION} adminPreview={access.adminPreview} />
}
