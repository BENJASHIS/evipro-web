import { getLocale } from '@/lib/locale-server'
import { T } from '@/app/components/Language'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { RAFFLE_PUBLIC_COLUMNS, RAFFLE_TICKET_MEMBER_COLUMNS } from '@/lib/db-columns'
import { redirect } from 'next/navigation'

export default async function SorteosPage() {
  const locale = await getLocale()
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: tickets }, { data: raffles }] = await Promise.all([
    supabase
      .from('raffle_tickets')
      .select(RAFFLE_TICKET_MEMBER_COLUMNS)
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false }),
    supabase
      .from('raffles')
      .select(RAFFLE_PUBLIC_COLUMNS)
      .order('draw_date', { ascending: false })
      .limit(10),
  ])

  const upcoming = raffles?.filter(r => r.status === 'upcoming') ?? []
  const completed = raffles?.filter(r => r.status === 'completed') ?? []

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>Sorteos</T></p>
      <h1 className="text-3xl font-light font-serif italic mb-8"><T>Mis tickets y sorteos</T></h1>

      {upcoming[0] && (
        <div className="border border-brand/30 rounded-lg p-6 mb-8">
          <p className="text-xs font-mono text-brand uppercase tracking-widest mb-2"><T>Próximo sorteo</T></p>
          <h2 className="text-xl font-light mb-1">{upcoming[0].title}</h2>
          <p className="text-muted text-sm mb-2"><T>Premio:</T> {upcoming[0].prize}</p>
          <p className="text-xs text-faint font-mono">
            <T>Fecha:</T> {new Date(upcoming[0].draw_date).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-PE', { dateStyle: 'full' })}
          </p>
        </div>
      )}

      <div className="border border-subtle rounded-lg p-6 mb-8">
        <p className="text-xs font-mono text-faint uppercase tracking-widest mb-4">
          <T values={{ count: tickets?.length ?? 0 }}>{'Mis tickets ({count})'}</T>
        </p>
        {!tickets?.length ? (
          <p className="text-faint text-sm"><T>Aún no tienes tickets. Se asignan automáticamente al activarse tu membresía.</T></p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tickets.map(t => (
              <span key={t.id}
                className={`text-xs font-mono px-3 py-1 rounded border ${
                  t.is_winner
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-subtle bg-white/5 text-gray-300'
                }`}>
                {t.ticket_code} {t.is_winner && '🏆'}
              </span>
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div className="border border-subtle rounded-lg p-6">
          <p className="text-xs font-mono text-faint uppercase tracking-widest mb-4"><T>Ganadores anteriores</T></p>
          <div className="space-y-3">
            {completed.map(raffle => (
              <div key={raffle.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-deep flex items-center justify-center text-xs">
                  {raffle.winner_alias?.charAt(0) ?? '?'}
                </div>
                <div>
                  <p className="text-sm text-white">{raffle.winner_alias ?? <T>Anónimo</T>}</p>
                  <p className="text-xs text-faint">{raffle.prize} · {new Date(raffle.draw_date).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-PE')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
