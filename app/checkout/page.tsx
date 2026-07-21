'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PLAN_DISPLAY_NAMES, PERIOD_LABELS, type MembershipPlan, type PlanAddon } from '@/lib/types'

// Modal que corta el pago cuando el usuario no está autenticado (401 del server).
// La auth se valida en /api/subscriptions; aquí solo es la UX previa al checkout.
function AuthRequiredModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="w-full max-w-sm rounded-lg border border-subtle bg-ink p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="auth-modal-title" className="text-xl font-light text-white mb-2">Debes crear una cuenta</h2>
        <p className="text-muted text-sm leading-relaxed mb-6">
          Para realizar un pago es necesario crear una cuenta o iniciar sesión. Esto nos permite
          asociar tu compra, mantener tu historial de pedidos y brindarte soporte.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/registro"
            className="w-full py-3 bg-brand-deep hover:bg-brand-mid text-white text-center rounded transition-colors text-sm"
          >
            Crear cuenta
          </a>
          <a
            href="/login"
            className="w-full py-3 border border-subtle hover:border-brand text-white text-center rounded transition-colors text-sm"
          >
            Iniciar sesión
          </a>
          <button
            onClick={onClose}
            className="text-xs text-faint hover:text-white font-mono mt-1 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckoutForm() {
  const params = useSearchParams()
  const planId = params.get('plan')
  const addonIds = (params.get('addons')?.split(',').filter(Boolean)) ?? []
  const [plan, setPlan] = useState<MembershipPlan | null>(null)
  const [addons, setAddons] = useState<PlanAddon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const isTurista = plan?.type === 'turista_inicio' || plan?.type === 'turista_plus'
  const isQuincenal = plan?.period === 'quincenal'

  useEffect(() => {
    if (!planId) return
    fetch(`/api/plans/${planId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPlan(data) })
  }, [planId])

  useEffect(() => {
    if (addonIds.length === 0) return
    fetch('/api/plan-addons')
      .then(r => r.ok ? r.json() : [])
      .then((all: PlanAddon[]) => setAddons(all.filter(a => addonIds.includes(a.id))))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId])

  const addonsTotal = addons.reduce((acc, a) => acc + Number(a.price_soles), 0)
  const total = Number(plan?.price_soles ?? 0) + addonsTotal

  async function handlePagar() {
    if (!plan) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: plan.id, addon_ids: addonIds }),
      })
      if (res.status === 401) {
        // No autenticado: no se inicia el pago, se pide crear cuenta / iniciar sesión.
        setShowAuthModal(true)
        setLoading(false)
        return
      }
      const data = await res.json()
      if (res.ok && data.init_point) {
        // Redirige al checkout de Mercado Pago
        window.location.href = data.init_point
      } else {
        setError(data.error ?? 'Error al procesar el pago.')
        setLoading(false)
      }
    } catch {
      setError('Error de red. Intenta de nuevo.')
      setLoading(false)
    }
  }

  if (!planId) {
    return (
      <div className="text-center">
        <p className="text-muted mb-4">No se especificó un plan.</p>
        <a href="/planes" className="text-brand underline text-sm">Ver planes →</a>
      </div>
    )
  }

  if (!plan) {
    return <div className="text-muted text-center py-8">Cargando plan...</div>
  }

  return (
    <div className="w-full max-w-sm p-8 border border-subtle rounded-lg">
      <p className="text-xs text-brand font-mono uppercase tracking-widest mb-2">Resumen del pedido</p>
      <h2 className="text-2xl font-light text-white mb-1">{PLAN_DISPLAY_NAMES[plan.type] ?? plan.type}</h2>
      <p className="text-muted text-sm mb-6">{PERIOD_LABELS[plan.period] ?? plan.period}</p>

      {addons.length > 0 && (
        <div className="border-t border-subtle pt-4 mb-2 space-y-1">
          <p className="text-muted text-sm flex justify-between">
            <span>{PLAN_DISPLAY_NAMES[plan.type] ?? plan.type}</span><span>S/. {plan.price_soles}</span>
          </p>
          {addons.map(a => (
            <p key={a.id} className="text-muted text-sm flex justify-between">
              <span>+ {a.label}</span><span>S/. {a.price_soles}</span>
            </p>
          ))}
        </div>
      )}

      <div className="flex justify-between items-baseline border-t border-subtle pt-4 mb-8">
        <span className="text-muted text-sm">Total</span>
        <span className="text-3xl font-light text-white">S/. {total}</span>
      </div>

      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      {isQuincenal && (
        <div className="border border-yellow-400/20 bg-yellow-400/5 rounded p-3 mb-4">
          <p className="text-yellow-400 text-xs font-mono leading-relaxed">
            ⚠️ Con plan quincenal el delivery (3-5 días hábiles) puede no completarse antes de tu salida.
            Si el producto no llega a tiempo, se reembolsa el costo del medicamento. La coordinación
            de farmacia (S/. 25) es discrecional según la causa del retraso.
          </p>
        </div>
      )}

      {isTurista && (
        <label className="flex items-start gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={legalAccepted}
            onChange={e => setLegalAccepted(e.target.checked)}
            className="mt-0.5 accent-brand"
          />
          <span className="text-xs text-muted leading-relaxed">
            Entiendo que EVIPro opera dentro del territorio peruano. El uso o transporte del
            producto fuera del Perú es de mi exclusiva responsabilidad, conforme a la legislación
            de mi país de destino.
          </span>
        </label>
      )}

      <button
        onClick={handlePagar}
        disabled={loading || (isTurista && !legalAccepted)}
        className="w-full py-3 bg-brand-deep hover:bg-brand-mid text-white rounded transition-colors disabled:opacity-50 text-sm"
      >
        {loading ? 'Redirigiendo...' : 'Pagar con Mercado Pago'}
      </button>

      <p className="text-center text-xs text-faint mt-4 font-mono">Pago seguro con Mercado Pago · PCI-DSS</p>

      {showAuthModal && <AuthRequiredModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink text-white">
      <Suspense fallback={<div className="text-muted">Cargando...</div>}>
        <CheckoutForm />
      </Suspense>
    </main>
  )
}
