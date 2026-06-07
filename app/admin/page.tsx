import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const [{ count: totalActive }, { count: totalPending }, { data: recentSubs }, { data: recentRequests }] =
    await Promise.all([
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('subscriptions').select('*, profiles(full_name, phone, city), membership_plans(type, period)')
        .eq('status', 'active').order('created_at', { ascending: false }).limit(10),
      supabase.from('pharmacy_requests').select('*, profiles(full_name)')
        .eq('status', 'pending').order('created_at', { ascending: false }),
    ])

  return (
    <div className="max-w-5xl mx-auto">
      <p className="text-xs font-mono uppercase tracking-widest text-[#7bc96f] mb-2">Admin</p>
      <h1 className="text-3xl font-light font-serif italic mb-8">Panel EVIPro</h1>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="border border-white/10 rounded-lg p-6">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Suscriptores activos</p>
          <p className="text-4xl font-light text-[#7bc96f]">{totalActive ?? 0}</p>
        </div>
        <div className="border border-white/10 rounded-lg p-6">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Pendientes de activación</p>
          <p className="text-4xl font-light text-yellow-400">{totalPending ?? 0}</p>
        </div>
      </div>

      {recentRequests && recentRequests.length > 0 && (
        <div className="border border-yellow-400/20 rounded-lg p-6 mb-8">
          <p className="text-xs font-mono text-yellow-400 uppercase tracking-widest mb-4">
            Solicitudes de farmacia pendientes ({recentRequests.length})
          </p>
          <div className="space-y-3">
            {recentRequests.map(req => (
              <div key={req.id} className="border border-white/10 rounded p-4">
                <p className="text-sm font-light mb-1">
                  {(req.profiles as Record<string, string>)?.full_name}
                </p>
                <p className="text-xs text-gray-400 mb-1">{req.product_notes}</p>
                <p className="text-xs text-gray-500 font-mono">📍 {req.shalom_address}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link al libro de reclamaciones */}
      <div className="border border-white/10 rounded-lg p-6 mb-8">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Libro de Reclamaciones</p>
        <p className="text-gray-400 text-sm">Las reclamaciones recibidas se gestionan vía <a href="mailto:reclamaciones@evipro.pe" className="text-[#7bc96f] underline">reclamaciones@evipro.pe</a>. El plazo legal de respuesta es 30 días calendario.</p>
      </div>

      <div className="border border-white/10 rounded-lg p-6">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Suscriptores activos recientes</p>
        <div className="space-y-3">
          {(recentSubs ?? []).map(sub => {
            const profile = sub.profiles as Record<string, string>
            const plan = sub.membership_plans as Record<string, string>
            return (
              <div key={sub.id} className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <p className="text-sm">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500 font-mono">{profile?.city} · {profile?.phone}</p>
                </div>
                <span className="text-xs font-mono text-[#7bc96f] capitalize">
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
