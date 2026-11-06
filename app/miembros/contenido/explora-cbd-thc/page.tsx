import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'
import VisorFrasco from './VisorFrasco'

export const metadata = { title:'Explora CBD y THC · EVIPro',robots:{index:false,follow:false} }

export default async function ExploraCannabinoidesPage() {
  const supabase = await createServerSupabaseClient()
  const { data:{user} } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const access = await getMemberAccess(supabase,user)
  if (!canUseMemberTools(access)) return <div>
    <h1 className="text-3xl font-serif mb-4">Explora CBD y THC</h1>
    <p className="mb-4">Este recurso didáctico está disponible con una membresía activa.</p>
    <Link href="/planes#membresias" className="text-brand underline">Ver membresías</Link>
  </div>
  return <div>
    <Link href="/miembros/contenido" className="text-xs text-faint hover:text-white">← Biblioteca</Link>
    <p className="text-xs uppercase tracking-widest text-brand mt-6 mb-2">Recurso didáctico para miembros</p>
    <h1 className="text-3xl font-serif mb-4">Explora CBD y THC</h1>
    {access.adminPreview && <p className="text-brand text-sm mb-4">Vista previa de administrador · sin membresía activa.</p>}
    <p className="text-sm leading-6 text-muted mb-4">Gira el frasco, explora sus tres caras y compara las moléculas en plano o en 3D. Los controles muestran composición ilustrativa; no miden un preparado real ni recomiendan dosis.</p>
    <a href="/miembros/contenido/explora-cbd-thc/visor/index.html" target="_blank" rel="noopener noreferrer" className="inline-block text-brand underline mb-6">Abrir visor en ventana completa ↗</a>
    <VisorFrasco />
    <details className="border-t border-subtle mt-6 py-5">
      <summary className="cursor-pointer">Fuentes, revisión y uso del material</summary>
      <p className="text-sm leading-6 mt-4">Estructuras de referencia: <a className="underline" href="https://pubchem.ncbi.nlm.nih.gov/compound/644019" target="_blank" rel="noopener noreferrer">PubChem CBD · CID 644019</a> y <a className="underline" href="https://pubchem.ncbi.nlm.nih.gov/compound/16078" target="_blank" rel="noopener noreferrer">Δ9-THC · CID 16078</a>. Identidad y estereoquímica comprobadas computacionalmente el 6 de noviembre de 2026. No equivale a certificación de un lote ni a revisión externa por un químico.</p>
      <p className="text-sm leading-6 mt-3">Uso didáctico en EVIPro para miembros. Puedes compartir este enlace; cada persona necesita su propio acceso. El tamaño de las moléculas y el color del aceite no representan proporciones ni efectos clínicos.</p>
    </details>
    <Link href="/miembros/herramientas/calculadora-cannabinoide" className="inline-block mt-4 text-brand underline">Ir a la calculadora cannabinoide →</Link>
  </div>
}
