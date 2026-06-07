import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { createCulqiSubscription } from '@/lib/culqi'

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

  if (!plan.culqi_plan_id) {
    return NextResponse.json(
      { error: 'Plan no configurado en Culqi todavía. Contacta al administrador.' },
      { status: 422 }
    )
  }

  const serviceSupabase = createServiceClient()

  try {
    const culqiSub = await createCulqiSubscription({
      token_id,
      plan_id: plan.culqi_plan_id,
      tyc: true,
    })

    const { error } = await serviceSupabase.from('subscriptions').insert({
      user_id: user.id,
      plan_id: plan.id,
      status: 'pending',
      culqi_subscription_id: culqiSub.id,
      culqi_customer_id: culqiSub.customer_id ?? null,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error procesando pago'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
