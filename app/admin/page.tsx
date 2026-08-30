import { createServerSupabaseClient } from '@/lib/supabase-server'
import { activateSubscription, dismissSubscription, actualizarSolicitudFarmacia } from '@/app/admin/actions'
import Link from 'next/link'

type PendingSub = {
  id: string
  mp_payment_id: string | null
  started_at: string | null
  period_start: string | null
  period_end: string | null
  profiles: Record<string, string> | null
  membership_plans: Record<string, string> | null
}

function PendingRow({ sub }: { sub: PendingSub }) {
  const profile = sub.profiles
  const plan = sub.membership_plans
  const formatDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString('es-PE') : '—'
  return (
    <div className="border border-subtle rounded p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-white">{profile?.full_name}</p>
        <p className="text-xs text-faint font-mono">{profile?.city} · {profile?.phone}</p>
        <p className="text-xs text-muted font-mono mt-0.5 capitalize">
          {plan?.type} · {plan?.period} · S/. {plan?.price_soles}
        </p>
        {sub.period_end && (
          <p className="text-xs text-faint font-mono mt-1">
            {sub.started_at ? `Activado: ${formatDate(sub.started_at)} · ` : ''}Vence: {formatDate(sub.period_end)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <form action={activateSubscription}>
          <input type="hidden" name="id" value={sub.id} />
          <input type="hidden" name="nombre" value={profile?.full_name ?? ''} />
          <button type="submit" className="bg-brand-deep hover:bg-brand-mid text-white text-xs font-mono px-4 py-2 rounded transition-colors">
            Activar →
          </button>
        </form>
        <form action={dismissSubscription}>
          <input type="hidden" name="id" value={sub.id} />
          <input type="hidden" name="nombre" value={profile?.full_name ?? ''} />
          <button type="submit" className="border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-mono px-3 py-2 rounded transition-colors">
            Descartar
          </button>
        </form>
      </div>
    </div>
  )
}

/** Supabase devuelve la relación como objeto o como lista de un elemento
 *  según la consulta; esto lo deja en un nombre en los dos casos. */
function nombreDe(profiles: unknown): string {
  const p = Array.isArray(profiles) ? profiles[0] : profiles
  return (p as { full_name?: string } | null)?.full_name ?? 'Miembro'
}

const ESTADO_FARMACIA: Record<string, string> = {
  pending:     'Pendiente',
  coordinated: 'Coordinado',
  shipped:     'Enviado',
  delivered:   'Entregado',
}

const SUBSCRIPTION_COUNT_COLUMNS = 'id'
const PENDING_SUBSCRIPTION_COLUMNS =
  'id, mp_payment_id, started_at, period_start, period_end, created_at, profiles(full_name, phone, city), membership_plans(type, period, price_soles)'
const RECENT_SUBSCRIPTION_COLUMNS =
  'id, started_at, period_start, period_end, created_at, profiles(full_name, phone, city), membership_plans(type, period)'
const COUNSELING_COUNT_COLUMNS = 'id'

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ ok?: string; dismissed?: string }> }) {
  const { ok, dismissed } = await searchParams
  const supabase = await createServerSupabaseClient()

  const [{ count: totalActive }, { count: totalPending }, { data: pendingSubs }, { data: recentSubs }, { data: recentRequests }, { count: totalCounseling }] =
    await Promise.all([
      supabase.from('subscriptions').select(SUBSCRIPTION_COUNT_COLUMNS, { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('subscriptions').select(SUBSCRIPTION_COUNT_COLUMNS, { count: 'exact', head: true }).eq('status', 'awaiting_payment'),
      supabase.from('subscriptions').select(PENDING_SUBSCRIPTION_COLUMNS)
        .eq('status', 'awaiting_payment').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select(RECENT_SUBSCRIPTION_COLUMNS)
        .eq('status', 'active').order('created_at', { ascending: false }).limit(10),
      supabase.from('pharmacy_requests')
        .select('id, product_notes, shalom_address, status, tracking_info, created_at, profiles(full_name)')
        .neq('status', 'delivered').order('created_at', { ascending: false }).limit(50),
      supabase.from('counseling_bookings').select(COUNSELING_COUNT_COLUMNS, { count: 'exact', head: true }),
    ])

  const pending = (pendingSubs ?? []) as unknown as PendingSub[]
  const paidPending = pending.filter(s => s.mp_payment_id)
  const unpaidPending = pending.filter(s => !s.mp_payment_id)

  return (
    <div className="max-w-5xl mx-auto">
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2">Admin</p>
      <h1 className="text-3xl font-light font-serif italic mb-8">Panel EVIPro</h1>

      {ok && (
        <div className="border border-brand/40 bg-brand/10 rounded-lg px-4 py-3 mb-6 text-sm text-brand">
          ✓ <span className="font-medium">{ok}</span> activado. Ya tiene acceso de miembro.
        </div>
      )}
      {dismissed && (
        <div className="border border-red-500/40 bg-red-500/10 rounded-lg px-4 py-3 mb-6 text-sm text-red-300">
          <span className="font-medium">{dismissed}</span> descartado. Salió de la lista de pendientes.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <div className="border border-subtle rounded-lg p-6">
          <p className="text-xs font-mono text-faint uppercase tracking-widest mb-2">Suscriptores activos</p>
          <p className="text-4xl font-light text-brand">{totalActive ?? 0}</p>
        </div>
        <div className="border border-subtle rounded-lg p-6">
          <p className="text-xs font-mono text-faint uppercase tracking-widest mb-2">Checkouts sin pagar</p>
          <p className="text-4xl font-light text-yellow-400">{totalPending ?? 0}</p>
        </div>
        <Link href="/admin/consejeria" className="border border-subtle rounded-lg p-6 hover:border-brand/50 transition-colors group">
          <p className="text-xs font-mono text-faint uppercase tracking-widest mb-2">Reservas consejería</p>
          <p className="text-4xl font-light text-blue-400">{totalCounseling ?? 0}</p>
          <p className="text-xs font-mono text-faint mt-2 group-hover:text-brand transition-colors">Ver todas →</p>
        </Link>
      </div>

      {/* Pagaron en MercadoPago · activar con confianza */}
      {paidPending.length > 0 && (
        <div className="border border-brand/30 rounded-lg p-6 mb-8">
          <p className="text-xs font-mono text-brand uppercase tracking-widest mb-1">
            ✓ Pagaron en MercadoPago · activar ({paidPending.length})
          </p>
          <p className="text-xs text-faint mb-4">El pago está confirmado. Pulsa Activar para darles acceso.</p>
          <div className="space-y-3">
            {paidPending.map(sub => <PendingRow key={sub.id} sub={sub} />)}
          </div>
        </div>
      )}

      {/* Solo registrados · sin pago */}
      {unpaidPending.length > 0 && (
        <div className="border border-yellow-400/20 rounded-lg p-6 mb-8">
          <p className="text-xs font-mono text-yellow-400 uppercase tracking-widest mb-1">
            Solo registrados · sin pago ({unpaidPending.length})
          </p>
          <p className="text-xs text-faint mb-4">
            No hay pago en MercadoPago. Activa solo si confirmaste el pago por otra vía (Yape/transferencia); si no, Descártalos.
          </p>
          <div className="space-y-3">
            {unpaidPending.map(sub => <PendingRow key={sub.id} sub={sub} />)}
          </div>
        </div>
      )}

      {recentRequests && recentRequests.length > 0 && (
        <div className="border border-yellow-400/20 rounded-lg p-6 mb-8">
          <p className="text-xs font-mono text-yellow-400 uppercase tracking-widest mb-4">
            Solicitudes de farmacia en curso ({recentRequests.length})
          </p>
          <div className="space-y-3">
            {recentRequests.map(req => (
              <div key={req.id} className="border border-subtle rounded p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <p className="text-sm font-light">
                    {nombreDe(req.profiles)}
                  </p>
                  <span className="text-xs font-mono text-brand uppercase tracking-widest">
                    {ESTADO_FARMACIA[req.status as string] ?? req.status}
                  </span>
                </div>
                <p className="text-xs text-muted mb-1">{req.product_notes}</p>
                <p className="text-xs text-faint font-mono mb-3">📍 {req.shalom_address}</p>

                {/* Avanzar estado + guía. Sin la guía escrita aquí, el paciente
                    no tiene nada que rastrear: la columna existía y ninguna
                    pantalla la escribía. */}
                <form action={actualizarSolicitudFarmacia} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={req.id as string} />
                  <select
                    name="status"
                    defaultValue={req.status as string}
                    className="bg-white/5 border border-subtle rounded px-2 py-1.5 text-xs text-white font-mono"
                  >
                    {Object.entries(ESTADO_FARMACIA).map(([valor, etiqueta]) => (
                      <option key={valor} value={valor} className="bg-ink">{etiqueta}</option>
                    ))}
                  </select>
                  <input
                    name="tracking_info"
                    defaultValue={(req.tracking_info as string) ?? ''}
                    placeholder="N° de guía Shalom"
                    maxLength={60}
                    className="bg-white/5 border border-subtle rounded px-2 py-1.5 text-xs text-white font-mono flex-1 min-w-[10rem]"
                  />
                  <button type="submit" className="bg-brand-deep hover:bg-brand-mid text-white text-xs font-mono px-3 py-1.5 rounded transition-colors">
                    Guardar
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link al libro de reclamaciones */}
      <div className="border border-subtle rounded-lg p-6 mb-8">
        <p className="text-xs font-mono text-faint uppercase tracking-widest mb-2">Libro de Reclamaciones</p>
        <p className="text-muted text-sm">Las reclamaciones recibidas se gestionan vía <a href="mailto:reclamaciones@evipro.pe" className="text-brand underline">reclamaciones@evipro.pe</a>. El plazo legal de respuesta es 30 días calendario.</p>
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <p className="text-xs font-mono text-faint uppercase tracking-widest mb-4">Suscriptores activos recientes</p>
        <div className="space-y-3">
          {(recentSubs ?? []).map(sub => {
            const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles
            const plan = Array.isArray(sub.membership_plans) ? sub.membership_plans[0] : sub.membership_plans
            const formatDate = (iso: string | null | undefined) =>
              iso ? new Date(iso).toLocaleDateString('es-PE') : '—'
            const isExpired = sub.period_end && new Date(sub.period_end) < new Date()
            return (
              <div key={sub.id} className="flex items-center justify-between border-b border-subtle pb-3">
                <div>
                  <p className="text-sm">{profile?.full_name}</p>
                  <p className="text-xs text-faint font-mono">{profile?.city} · {profile?.phone}</p>
                  {sub.period_end && (
                    <p className={`text-xs font-mono mt-1 ${
                      isExpired ? 'text-red-400' : 'text-brand'
                    }`}>
                      {isExpired ? '❌ Vencida' : '✓ Activa'}: {formatDate(sub.period_end)}
                    </p>
                  )}
                </div>
                <span className="text-xs font-mono text-muted capitalize">
                  {plan?.type} · {plan?.period}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
