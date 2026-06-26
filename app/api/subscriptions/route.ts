import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { createMPPreference, describeMPError } from '@/lib/mercadopago'
import { PLAN_DISPLAY_NAMES } from '@/lib/types'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { plan_id } = await req.json()
  if (!plan_id) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { data: plan } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('id', plan_id)
    .single()

  if (!plan) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })

  const serviceSupabase = createServiceClient()

  try {
    // Crear suscripción pendiente primero para tener ID como referencia
    const { data: sub, error: subError } = await serviceSupabase
      .from('subscriptions')
      .insert({ user_id: user.id, plan_id: plan.id, status: 'pending' })
      .select('id')
      .single()

    if (subError || !sub) throw subError ?? new Error('Error creando suscripción')

    // Crear preferencia de pago en Mercado Pago
    const preference = await createMPPreference({
      items: [{
        title: `${PLAN_DISPLAY_NAMES[plan.type as keyof typeof PLAN_DISPLAY_NAMES] ?? plan.type} · ${plan.period}`,
        unit_price: plan.price_soles,
        quantity: 1,
      }],
      payer_email: user.email!,
      external_reference: sub.id,
      metadata: { subscription_id: sub.id, user_id: user.id, plan_id: plan.id },
    })

    await serviceSupabase
      .from('subscriptions')
      .update({ mp_preference_id: preference.id })
      .eq('id', sub.id)

    return NextResponse.json({
      success: true,
      init_point: preference.init_point,
      preference_id: preference.id,
    })
  } catch (err) {
    const message = describeMPError(err)
    console.error('[subscriptions] error creando pago:', JSON.stringify(err), message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
