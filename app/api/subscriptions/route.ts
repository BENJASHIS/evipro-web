import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { createCulqiCharge } from '@/lib/culqi'

const PLAN_NAMES: Record<string, string> = {
  express: 'Plan Express',
  cannabis: 'Plan Cannabis',
  integral: 'Plan Integral',
  turista_inicio: 'Plan Turista Inicio',
  turista_plus: 'Plan Turista Plus',
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { token_id, plan_id } = await req.json()
  if (!token_id || !plan_id) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const { data: plan } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('id', plan_id)
    .single()

  if (!plan) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })

  const serviceSupabase = createServiceClient()

  try {
    const charge = await createCulqiCharge({
      amount: Math.round(plan.price_soles * 100),
      currency_code: 'PEN',
      email: user.email!,
      source_id: token_id,
      description: `${PLAN_NAMES[plan.type] ?? plan.type} · ${plan.period}`,
    })

    const { error } = await serviceSupabase.from('subscriptions').insert({
      user_id: user.id,
      plan_id: plan.id,
      status: 'pending',
      culqi_subscription_id: charge.id,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error procesando pago'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
