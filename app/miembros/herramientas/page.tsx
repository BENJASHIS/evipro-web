import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'

const TOOLS = [
  {
    title: 'Regen',
    eyebrow: 'Disponible',
    href: '/miembros/regen',
    body: 'Prueba de entorno para revisar hogar, trabajo, familia y círculo social.',
    action: 'Abrir',
  },
  {
    title: 'Calculadora cannabinoide',
    eyebrow: 'Disponible',
    href: '/miembros/herramientas/calculadora-cannabinoide',
    body: 'Conversor orientativo de concentración, mg por ml, mg por gota y duración del frasco.',
    action: 'Abrir',
  },
  {
    title: 'Cuestionarios educativos',
    eyebrow: 'Próximo',
    href: null,
    body: 'Preguntas breves para aprender conceptos clave sin convertirlos en consejo médico.',
    action: 'En preparación',
  },
] as const

export default async function HerramientasPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getMemberAccess(supabase, user)
  const enabled = canUseMemberTools(access)

  return (
    <div>
      <Link href="/miembros" className="text-xs font-mono text-faint hover:text-white">← Volver</Link>
      <p className="text-xs font-mono uppercase tracking-widest text-brand mt-6 mb-2">Herramientas</p>
      <h1 className="text-3xl font-light mb-4">Herramientas para tu seguimiento</h1>

      {!enabled ? (
        <div className="border border-subtle rounded-lg p-8 text-center">
          <p className="text-muted text-sm mb-4">
            Esta zona se activa con una membresía vigente.
          </p>
          <Link href="/planes#membresias" className="bg-brand-deep hover:bg-brand-mid text-white px-6 py-2 rounded font-mono text-sm transition-colors">
            Ver membresías →
          </Link>
        </div>
      ) : (
        <>
          {access.adminPreview && (
            <div className="border border-brand/30 bg-brand/5 rounded-lg p-4 mb-6">
              <p className="text-brand text-sm">
                Modo admin · vista previa de herramientas sin membresía activa.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map(tool => {
              const className = 'block min-h-44 border border-subtle rounded-lg p-5 transition-colors'
              const body = (
                <>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <p className="text-xs font-mono uppercase tracking-widest text-brand">{tool.eyebrow}</p>
                    <span className="text-xs font-mono text-faint">{tool.action}</span>
                  </div>
                  <h2 className="text-xl font-light text-white mb-2">{tool.title}</h2>
                  <p className="text-sm leading-6 text-muted">{tool.body}</p>
                </>
              )

              return tool.href ? (
                <Link key={tool.title} href={tool.href} className={`${className} hover:border-brand/60`}>
                  {body}
                </Link>
              ) : (
                <div key={tool.title} className={`${className} opacity-75`}>
                  {body}
                </div>
              )
            })}
          </div>

          <div className="border border-yellow-400/30 bg-yellow-400/5 rounded-lg p-5 mt-6">
            <p className="text-xs font-mono uppercase tracking-widest text-yellow-300 mb-2">Seguridad</p>
            <p className="text-sm text-yellow-50 leading-6">
              Las herramientas convierten datos y ordenan información. No indican dosis, no reemplazan consulta médica y no modifican recetas.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
