'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PLAN_DISPLAY_NAMES, type MembershipPlan } from '@/lib/types'

const PERIOD_NAMES: Record<string, string> = {
  quincenal: 'Quincenal (15 días)',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
}

function CheckoutForm() {
  const params = useSearchParams()
  const planId = params.get('plan')
  const [plan, setPlan] = useState<MembershipPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [legalAccepted, setLegalAccepted] = useState(false)

  const isTurista = plan?.type === 'turista_inicio' || plan?.type === 'turista_plus'
  const isQuincenal = plan?.period === 'quincenal'

  useEffect(() => {
    if (!planId) return
    fetch(`/api/plans/${planId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPlan(data) })
  }, [planId])

  async function handlePagar() {
    if (!plan) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: plan.id }),
      })
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
      <p className="text-muted text-sm mb-6">{PERIOD_NAMES[plan.period] ?? plan.period}</p>

      <div className="flex justify-between items-baseline border-t border-subtle pt-4 mb-8">
        <span className="text-muted text-sm">Total</span>
        <span className="text-3xl font-light text-white">S/. {plan.price_soles}</span>
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
