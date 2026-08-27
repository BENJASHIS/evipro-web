import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { createMPPreference, describeMPError } from '@/lib/mercadopago'
import { buildCartItems, computeCartTotal } from '@/lib/billing'
import { PLAN_DISPLAY_NAMES } from '@/lib/types'
import { MEMBERSHIP_PLAN_PUBLIC_COLUMNS } from '@/lib/db-columns'
import { checkRateLimitForKey, rateLimitResponse } from '@/lib/rate-limit'
import { readTurnstileToken, verifyTurnstileToken } from '@/lib/turnstile'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const limit = checkRateLimitForKey(user.id, { namespace: 'api:subscriptions', limit: 6, windowMs: 10 * 60 * 1000 })
  if (!limit.ok) return rateLimitResponse(limit)

  let body: { plan_id?: string; addon_ids?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }
  const { plan_id, addon_ids } = body
  if (typeof plan_id !== 'string' || !plan_id.trim()) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }
  if (addon_ids != null && (!Array.isArray(addon_ids) || addon_ids.some(id => typeof id !== 'string'))) {
    return NextResponse.json({ error: 'Módulos inválidos' }, { status: 400 })
  }
  const turnstile = await verifyTurnstileToken(readTurnstileToken(body), req)
  if (!turnstile.ok) {
    return NextResponse.json({ error: turnstile.error }, { status: 403 })
  }
  const addonIds: string[] = Array.isArray(addon_ids) ? addon_ids : []

  const { data: plan } = await supabase
    .from('membership_plans')
    .select(MEMBERSHIP_PLAN_PUBLIC_COLUMNS)
    .eq('id', plan_id)
    .single()
  if (!plan) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })

  // Guard: los add-ons solo aplican a planes que los admiten (EVIPro).
  if (addonIds.length > 0 && !plan.allows_addons) {
    return NextResponse.json({ error: 'Este plan no admite módulos de especialista' }, { status: 400 })
  }

  // Cargar add-ons desde BD para el período del plan (nunca confiar en precios del cliente).
  let addons: { id: string; label: string; price_soles: number }[] = []
  if (addonIds.length > 0) {
    const { data: addonRows } = await supabase
      .from('plan_addons')
      .select('id, label, price_soles, active, period')
      .in('id', addonIds)
      .eq('period', plan.period)
      .eq('active', true)
    addons = addonRows ?? []
    if (addons.length !== addonIds.length) {
      return NextResponse.json({ error: 'Módulo inválido para este período' }, { status: 400 })
    }
  }

  const serviceSupabase = createServiceClient()
  try {
    // Crear la fila primero para tener ID como external_reference de MP.
    // status 'awaiting_payment' = checkout iniciado; el webhook la pasa a
    // 'active' al aprobarse el pago. Así un checkout abandonado no aparece
    // como suscriptor "pendiente de activar".
    const { data: sub, error: subError } = await serviceSupabase
      .from('subscriptions')
      .insert({ user_id: user.id, plan_id: plan.id, status: 'awaiting_payment' })
      .select('id')
      .single()
    if (subError || !sub) throw subError ?? new Error('Error creando suscripción')

    // Persistir los add-ons elegidos.
    if (addons.length > 0) {
      const { error: addonErr } = await serviceSupabase
        .from('subscription_addons')
        .insert(addons.map(a => ({ subscription_id: sub.id, addon_id: a.id })))
      if (addonErr) throw addonErr
    }

    const baseTitle = `${PLAN_DISPLAY_NAMES[plan.type as keyof typeof PLAN_DISPLAY_NAMES] ?? plan.type} · ${plan.period}`
    const items = buildCartItems(
      { title: baseTitle, price: Number(plan.price_soles) },
      addons.map(a => ({ title: a.label, price: Number(a.price_soles) })),
    )
    // Total recalculado en servidor (para logging/validación).
    const total = computeCartTotal(Number(plan.price_soles), addons.map(a => Number(a.price_soles)))
    console.log('[subscriptions] total recalculado:', total)

    const preference = await createMPPreference({
      items,
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
