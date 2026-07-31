import { createServerSupabaseClient } from '@/lib/supabase-server'
import { cambiarEstadoPropuesta } from '@/app/admin/actions'

type Propuesta = {
  id: string
  full_name: string
  phone: string
  email: string
  occupation: string
  license: string | null
  city: string
  proposal: string
  contribution: string
  needs: string
  status: string
  created_at: string
}

const SIGUIENTE: Record<string, { status: string; label: string }[]> = {
  nueva:      [{ status: 'contestada', label: 'Marcar contestada' }, { status: 'archivada', label: 'Archivar' }],
  contestada: [{ status: 'archivada', label: 'Archivar' }],
  archivada:  [{ status: 'nueva', label: 'Reabrir' }],
}

export default async function PropuestasPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('partnership_proposals')
    .select('id, full_name, phone, email, occupation, license, city, proposal, contribution, needs, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  const propuestas = (data ?? []) as Propuesta[]

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-light font-serif italic mb-6">Propuestas</h1>

      {propuestas.length === 0 && (
        <p className="text-faint text-sm font-mono">Todavía no llegó ninguna propuesta.</p>
      )}

      <div className="space-y-4">
        {propuestas.map(p => (
          <article key={p.id} className="border border-subtle rounded p-5">
            <header className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <div>
                <p className="text-white text-sm">{p.full_name} · {p.occupation}</p>
                <p className="text-faint text-xs font-mono">
                  {p.city}{p.license ? ` · ${p.license}` : ''} · {p.phone} · {p.email}
                </p>
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-brand">{p.status}</span>
            </header>

            <dl className="space-y-2 text-sm">
              <div><dt className="text-xs text-faint font-mono uppercase tracking-widest">Propone</dt><dd className="text-muted">{p.proposal}</dd></div>
              <div><dt className="text-xs text-faint font-mono uppercase tracking-widest">Aporta</dt><dd className="text-muted">{p.contribution}</dd></div>
              <div><dt className="text-xs text-faint font-mono uppercase tracking-widest">Necesita</dt><dd className="text-muted">{p.needs}</dd></div>
            </dl>

            <div className="flex gap-2 mt-4">
              {SIGUIENTE[p.status]?.map(accion => (
                <form key={accion.status} action={cambiarEstadoPropuesta}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value={accion.status} />
                  <button type="submit" className="border border-subtle hover:border-white/40 text-xs font-mono px-3 py-1.5 rounded transition-colors">
                    {accion.label}
                  </button>
                </form>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
