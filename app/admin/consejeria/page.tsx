import { createServerSupabaseClient } from '@/lib/supabase-server'
import { confirmBooking } from '@/app/admin/actions'
import { MODALITY_LABELS } from '@/lib/counseling'
import type { Modality } from '@/lib/counseling'
import Link from 'next/link'

export default async function AdminConsejeriaPage() {
  const supabase = await createServerSupabaseClient()

  const { data: bookings } = await supabase
    .from('counseling_bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const total = bookings?.length ?? 0
  const paid = bookings?.filter(b => b.paid).length ?? 0
  const free = bookings?.filter(b => b.payment_method === 'free').length ?? 0
  const pending = bookings?.filter(b => !b.paid && b.payment_method !== 'free').length ?? 0

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/admin" className="text-xs font-mono text-faint hover:text-white mb-4 block">
        ← Panel admin
      </Link>
      <h1 className="text-3xl font-light font-serif italic mb-8">Reservas de Consejería</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total', value: total, color: 'text-white' },
          { label: 'Pagas', value: paid, color: 'text-brand' },
          { label: 'Gratuitas', value: free, color: 'text-blue-400' },
          { label: 'Por cobrar', value: pending, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="border border-subtle rounded-lg p-4">
            <p className="text-xs font-mono text-faint uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-light ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bookings list */}
      <div className="space-y-3">
        {total === 0 && (
          <p className="text-faint text-sm text-center py-12 font-mono border border-subtle rounded-lg">
            Sin reservas aún.
          </p>
        )}
        {(bookings ?? []).map(b => (
          <div key={b.id} className="border border-subtle rounded-lg p-5 flex flex-col md:flex-row md:items-center gap-4">
            {/* Patient */}
            <div className="flex-1">
              <p className="text-white font-light">{b.patient_name}</p>
              <p className="text-xs text-faint font-mono mt-0.5">{b.patient_phone}</p>
              {b.patient_note && (
                <p className="text-xs text-muted mt-1 italic">&ldquo;{b.patient_note}&rdquo;</p>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-3 text-xs font-mono">
              <span className="text-muted capitalize">
                {b.doctor_slug.replace('dr-', 'Dr. ')}
              </span>
              <span className="text-faint">·</span>
              <span className="text-gray-300">
                {MODALITY_LABELS[b.modality as Modality]}
              </span>
              {b.slot_date && (
                <>
                  <span className="text-faint">·</span>
                  <span className="text-muted">
                    {b.slot_date} {b.slot_time ? b.slot_time.slice(0, 5) : ''}
                  </span>
                </>
              )}
              <span className="text-faint">·</span>
              {b.price_soles === 0
                ? <span className="text-blue-400">Gratis</span>
                : <span className="text-white">S/. {b.price_soles}</span>}
            </div>

            {/* Status */}
            <div className="shrink-0">
              {b.confirmed_at ? (
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-brand/10 text-brand">
                  Confirmada
                </span>
              ) : b.paid ? (
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-brand/10 text-brand">
                  Pagada
                </span>
              ) : b.payment_method === 'free' ? (
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-400/10 text-blue-400">
                  Gratuita
                </span>
              ) : (
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400">
                  Por cobrar
                </span>
              )}
            </div>

            {/* Confirmar en DB */}
            {!b.confirmed_at && (
              <form action={confirmBooking}>
                <input type="hidden" name="id" value={b.id} />
                <button
                  type="submit"
                  className="shrink-0 text-xs font-mono bg-brand-deep hover:bg-brand-mid text-white px-3 py-1.5 rounded transition-colors"
                >
                  Confirmar ✓
                </button>
              </form>
            )}

            {/* WhatsApp confirm */}
            <a
              href={`https://wa.me/${b.patient_phone}?text=${encodeURIComponent(
                `Hola ${b.patient_name}, confirmamos tu sesión de consejería con EVIPro` +
                (b.slot_date ? ` para el ${b.slot_date} a las ${b.slot_time?.slice(0, 5)}` : '') +
                `. Cualquier consulta estamos aquí.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-mono border border-brand/30 text-brand px-3 py-1.5 rounded hover:bg-brand/10 transition-colors"
            >
              WA →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
