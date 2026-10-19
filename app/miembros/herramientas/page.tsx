import Link from 'next/link'
import { redirect } from 'next/navigation'
import { T } from '@/app/components/Language'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'

const TOOLS = [
  {
    title: 'Bitácora de hábitos', href: '/miembros/herramientas/habitos',
    eyebrow: 'Mi día a día', action: 'Abrir mi bitácora →',
    body: 'Anota sueño, agua, alcohol y cómo te sientes. Retoma un registro guardado y revisa los últimos siete días.',
    detail: 'Registra lo que sabes; un dato sin registrar no significa cero.',
  },
  {
    title: 'Regen · Mi entorno', href: '/miembros/regen',
    eyebrow: 'Un momento para reflexionar', action: 'Explorar mi entorno →',
    body: 'Revisa hogar, trabajo, familia y círculo social con preguntas por bloques y un resumen propio.',
    detail: 'Herramienta de bienestar con preguntas propias; no es una escala clínica validada.',
  },
  {
    title: 'Calculadora cannabinoide', href: '/miembros/herramientas/calculadora-cannabinoide',
    eyebrow: 'Entender mi etiqueta', action: 'Convertir datos de etiqueta →',
    body: 'Convierte los datos declarados en aceites, cartuchos, extractos y flor. Ten a mano la etiqueta del producto.',
    detail: 'Conversión aritmética: no determina cuánto debes usar ni cambia tu receta.',
  },
] as const

export default async function HerramientasPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const access = await getMemberAccess(supabase, user)
  const enabled = canUseMemberTools(access)

  return <div>
    <Link href="/miembros" className="text-xs font-mono text-faint hover:text-white"><T>← Volver</T></Link>
    <p className="text-xs font-mono uppercase tracking-widest text-brand mt-6 mb-3"><T>Herramientas</T></p>
    <h1 className="text-3xl sm:text-4xl font-serif mb-4"><T>Mi seguimiento</T></h1>
    <p className="text-muted max-w-2xl leading-relaxed mb-8"><T>Un espacio para registrar tu día, reflexionar sobre tu entorno y comprender la información de tus productos. Elige según lo que necesitas hoy.</T></p>
    {!enabled ? <div className="border-t border-subtle pt-6">
      <p className="text-muted text-sm mb-4"><T>Esta zona se activa con una membresía vigente.</T></p>
      <Link href="/planes#membresias" className="inline-block bg-brand text-black px-6 py-3 rounded text-sm"><T>Ver membresías →</T></Link>
    </div> : <>
      {access.adminPreview && <p className="border-l-2 border-brand p-4 text-brand text-sm mb-6"><T>Modo admin · vista previa de herramientas sin membresía activa.</T></p>}
      <div className="divide-y divide-subtle">
        {TOOLS.map(tool => <article key={tool.href} className="grid md:grid-cols-[0.7fr_1fr] gap-4 md:gap-10 py-7">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3"><T>{tool.eyebrow}</T></p>
            <h2 className="text-2xl font-serif"><T>{tool.title}</T></h2>
          </div>
          <div>
            <p className="text-sm leading-6 text-muted"><T>{tool.body}</T></p>
            <p className="text-xs leading-5 text-muted mt-3"><T>{tool.detail}</T></p>
            <Link href={tool.href} className="inline-block text-brand underline py-3 mt-2"><T>{tool.action}</T></Link>
          </div>
        </article>)}
      </div>
      <aside className="border-l-2 border-brand bg-brand/5 p-5 mt-8">
        <h2 className="font-medium mb-2"><T>Para acompañar tu atención</T></h2>
        <p className="text-sm text-muted leading-6"><T>Las herramientas ordenan información. No indican tratamientos, no reemplazan una consulta médica y no se vigilan en tiempo real. Si necesitas atención, utiliza el canal de consulta.</T></p>
      </aside>
    </>}
  </div>
}
