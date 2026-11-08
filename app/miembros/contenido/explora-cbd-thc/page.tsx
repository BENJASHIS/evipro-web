import { T } from '@/app/components/Language'
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
  const fullAccess = canUseMemberTools(access)
  return <div>
    <Link href="/miembros/contenido" className="text-xs text-faint hover:text-white"><T>← Biblioteca</T></Link>
    <p className="text-xs uppercase tracking-widest text-brand mt-6 mb-2"><T>{fullAccess ? 'Recurso didáctico para miembros' : 'Acceso educativo gratuito · solo CBD'}</T></p>
    <h1 className="text-3xl font-serif mb-4"><T>{fullAccess ? 'Explora CBD y THC' : 'Explora CBD'}</T></h1>
    {access.adminPreview && <p className="text-brand text-sm mb-4"><T>Vista previa de administrador · sin membresía activa.</T></p>}
    <p className="text-sm leading-6 text-muted mb-4"><T>{fullAccess ? 'Gira el frasco, explora sus tres caras y compara las moléculas en plano o en 3D. Los controles muestran composición ilustrativa; no miden un preparado real ni recomiendan dosis.' : 'Tu cuenta gratuita permite explorar el frasco y la molécula de CBD en plano y en 3D, con un ejemplo fijo. THC, mezclas y calculadora requieren membresía activa. No recomienda dosis.'}</T></p>
    <a href="/miembros/contenido/explora-cbd-thc/visor/index.html" target="_blank" rel="noopener noreferrer" className="inline-block text-brand underline mb-6"><T>Abrir visor en ventana completa ↗</T></a>
    <VisorFrasco cbdOnly={!fullAccess} />
    {!fullAccess && <div className="mt-4 text-sm">
      <p className="text-muted mb-2"><T>Para contratar una membresía, guarda primero tu </T><Link href="/miembros/perfil" className="text-brand underline"><T>perfil básico</T></Link><T>. No necesitas documento ni teléfono.</T></p>
      <Link href="/planes#membresias" className="text-brand underline"><T>Ver membresías</T></Link>
    </div>}
    <details className="border-t border-subtle mt-6 py-5">
      <summary className="cursor-pointer"><T>Fuentes, revisión y uso del material</T></summary>
      <p className="text-sm leading-6 mt-4"><T>Modelos 3D y datos químicos de referencia: </T><a className="underline" href="https://pubchem.ncbi.nlm.nih.gov/compound/644019" target="_blank" rel="noopener noreferrer"><T>PubChem CBD · CID 644019</T></a>{fullAccess && <> <T>y</T> <a className="underline" href="https://pubchem.ncbi.nlm.nih.gov/compound/16078" target="_blank" rel="noopener noreferrer"><T>Δ9-THC · CID 16078</T></a></>}<T>. Comprobación computacional de los datos PubChem: 6 de noviembre de 2026. No equivale a certificación de un lote ni a revisión externa por un químico.</T></p>
      <p className="text-sm leading-6 mt-3"><T>Imágenes 2D: originales de Wikipedia/Wikimedia Commons, fijados el 8 de noviembre de 2026: </T><a className="underline" href="https://commons.wikimedia.org/wiki/File:Cannabidiol_Structural_formula_V1.svg" target="_blank" rel="noopener noreferrer">CBD</a>{fullAccess && <> <T>y</T> <a className="underline" href="https://commons.wikimedia.org/wiki/File:Tetrahydrocannabinol.svg" target="_blank" rel="noopener noreferrer">Δ9-THC</a></>}<T>. Se conserva su dibujo sin redibujarlo; se revisaron visualmente la conectividad y las cuñas.</T></p>
      <p className="text-sm leading-6 mt-3"><T>Uso didáctico en EVIPro. Puedes compartir este enlace: CBD requiere cuenta gratuita; THC y mezclas requieren membresía activa. El tamaño de las moléculas y el color del aceite no representan proporciones ni efectos clínicos.</T></p>
    </details>
    {fullAccess && <Link href="/miembros/herramientas/calculadora-cannabinoide" className="inline-block mt-4 text-brand underline"><T>Ir a la calculadora cannabinoide →</T></Link>}
  </div>
}
