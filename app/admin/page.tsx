import { createServerSupabaseClient } from '@/lib/supabase-server'
import { activateSubscription, dismissSubscription } from '@/app/admin/actions'
import Link from 'next/link'

type PendingSub = {
  id: string
  mp_payment_id: string | null
  profiles: Record<string, string> | null
  membership_plans: Record<string, string> | null
}

function PendingRow({ sub }: { sub: PendingSub }) {
  const profile = sub.profiles
  const plan = sub.membership_plans
  return (
    <div className="border border-subtle rounded p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-white">{profile?.full_name}</p>
        <p className="text-xs text-faint font-mono">{profile?.city} · {profile?.phone}</p>
        <p className="text-xs text-muted font-mono mt-0.5 capitalize">
          {plan?.type} · {plan?.period} · S/. {plan?.price_soles}
        </p>
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

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ ok?: string; dismissed?: string }> }) {
  const { ok, dismissed } = await searchParams
  const supabase = await createServerSupabaseClient()

  const [{ count: totalActive }, { count: totalPending }, { data: pendingSubs }, { data: recentSubs }, { data: recentRequests }, { count: totalCounseling }] =
    await Promise.all([
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'awaiting_payment'),
      supabase.from('subscriptions').select('*, profiles(full_name, phone, city), membership_plans(type, period, price_soles)')
        .eq('status', 'awaiting_payment').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*, profiles(full_name, phone, city), membership_plans(type, period)')
        .eq('status', 'active').order('created_at', { ascending: false }).limit(10),
      supabase.from('pharmacy_requests').select('*, profiles(full_name)')
        .eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('counseling_bookings').select('*', { count: 'exact', head: true }),
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

      {/* Pagaron en MercadoPago — activar con confianza */}
      {paidPending.length > 0 && (
        <div className="border border-brand/30 rounded-lg p-6 mb-8">
          <p className="text-xs font-mono text-brand uppercase tracking-widest mb-1">
            ✓ Pagaron en MercadoPago — activar ({paidPending.length})
          </p>
          <p className="text-xs text-faint mb-4">El pago está confirmado. Pulsa Activar para darles acceso.</p>
          <div className="space-y-3">
            {paidPending.map(sub => <PendingRow key={sub.id} sub={sub} />)}
          </div>
        </div>
      )}

      {/* Solo registrados — sin pago */}
      {unpaidPending.length > 0 && (
        <div className="border border-yellow-400/20 rounded-lg p-6 mb-8">
          <p className="text-xs font-mono text-yellow-400 uppercase tracking-widest mb-1">
            Solo registrados — sin pago ({unpaidPending.length})
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
            Solicitudes de farmacia pendientes ({recentRequests.length})
          </p>
          <div className="space-y-3">
            {recentRequests.map(req => (
              <div key={req.id} className="border border-subtle rounded p-4">
                <p className="text-sm font-light mb-1">
                  {(req.profiles as Record<string, string>)?.full_name}
                </p>
                <p className="text-xs text-muted mb-1">{req.product_notes}</p>
                <p className="text-xs text-faint font-mono">📍 {req.shalom_address}</p>
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
            const profile = sub.profiles as Record<string, string>
            const plan = sub.membership_plans as Record<string, string>
            return (
              <div key={sub.id} className="flex items-center justify-between border-b border-subtle pb-3">
                <div>
                  <p className="text-sm">{profile?.full_name}</p>
                  <p className="text-xs text-faint font-mono">{profile?.city} · {profile?.phone}</p>
                </div>
                <span className="text-xs font-mono text-brand capitalize">
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
