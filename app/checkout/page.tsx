'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { MembershipPlan } from '@/lib/types'

const PLAN_NAMES: Record<string, string> = {
  express: 'Plan Express',
  cannabis: 'Plan Cannabis',
  integral: 'Plan Integral'
}
const PERIOD_NAMES: Record<string, string> = {
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual'
}

function CheckoutForm() {
  const params = useSearchParams()
  const planId = params.get('plan')
  const router = useRouter()
  const [plan, setPlan] = useState<MembershipPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [culqiReady, setCulqiReady] = useState(false)

  useEffect(() => {
    if (!planId) return
    fetch(`/api/plans/${planId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPlan(data) })
  }, [planId])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.culqi.com/js/v4'
    script.async = true
    script.onload = () => {
      const w = window as Window & { Culqi?: { publicKey: string } }
      if (w.Culqi) {
        w.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? ''
        setCulqiReady(true)
      }
    }
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])

  async function handlePagar() {
    if (!plan) return
    setLoading(true)
    setError(null)

    const w = window as Window & {
      Culqi?: { settings: (s: object) => void; open: () => void }
      culqi?: (token: { id: string }) => void
    }

    if (!w.Culqi) {
      setError('Error cargando pasarela de pago.')
      setLoading(false)
      return
    }

    w.Culqi.settings({
      title: 'EVIPro',
      currency: 'PEN',
      amount: Math.round(plan.price_soles * 100),
      description: `${PLAN_NAMES[plan.type] ?? plan.type} · ${PERIOD_NAMES[plan.period] ?? plan.period}`,
      order: `evipro-${plan.id}-${Date.now()}`,
    })

    w.culqi = async (token) => {
      try {
        const res = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token_id: token.id, plan_id: plan.id }),
        })
        if (res.ok) {
          router.push('/miembros?bienvenida=1')
        } else {
          const data = await res.json()
          setError(data.error ?? 'Error al procesar el pago.')
          setLoading(false)
        }
      } catch {
        setError('Error de red. Intenta de nuevo.')
        setLoading(false)
      }
    }

    w.Culqi.open()
  }

  if (!planId) {
    return (
      <div className="text-center">
        <p className="text-gray-400 mb-4">No se especificó un plan.</p>
        <a href="/planes" className="text-[#7bc96f] underline text-sm">Ver planes →</a>
      </div>
    )
  }

  if (!plan) {
    return <div className="text-gray-400 text-center py-8">Cargando plan...</div>
  }

  return (
    <div className="w-full max-w-sm p-8 border border-white/10 rounded-lg">
      <p className="text-xs text-[#7bc96f] font-mono uppercase tracking-widest mb-2">Resumen del pedido</p>
      <h2 className="text-2xl font-light text-white mb-1">{PLAN_NAMES[plan.type] ?? plan.type}</h2>
      <p className="text-gray-400 text-sm mb-6">{PERIOD_NAMES[plan.period] ?? plan.period}</p>

      <div className="flex justify-between items-baseline border-t border-white/10 pt-4 mb-8">
        <span className="text-gray-400 text-sm">Total</span>
        <span className="text-3xl font-light text-white">S/. {plan.price_soles}</span>
      </div>

      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      <button
        onClick={handlePagar}
        disabled={loading || !culqiReady}
        className="w-full py-3 bg-[#2d5a27] hover:bg-[#4a8c42] text-white rounded transition-colors disabled:opacity-50 text-sm"
      >
        {loading ? 'Procesando...' : !culqiReady ? 'Cargando...' : 'Pagar con tarjeta'}
      </button>

      <p className="text-center text-xs text-gray-600 mt-4 font-mono">Pago seguro con Culqi · PCI-DSS</p>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#080a08] text-white">
      <Suspense fallback={<div className="text-gray-400">Cargando...</div>}>
        <CheckoutForm />
      </Suspense>
    </main>
  )
}
