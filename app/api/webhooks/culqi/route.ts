import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/culqi'
import { createServiceClient } from '@/lib/supabase-server'
import { generateTicketBatch } from '@/lib/tickets'

type ServiceClient = ReturnType<typeof createServiceClient>

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-culqi-signature')
  if (!signature) return NextResponse.json({ error: 'Sin firma' }, { status: 401 })

  const body = await req.text()
  const isValid = await verifyWebhookSignature(
    body, signature, process.env.CULQI_WEBHOOK_SECRET!
  )
  if (!isValid) return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })

  const event = JSON.parse(body)
  const supabase = createServiceClient()

  if (event.type === 'suscripcion.activa' || event.type === 'cargo.exitoso') {
    await handleCargoExitoso(supabase, event.data)
  } else if (event.type === 'cargo.fallido') {
    await handleCargoFallido(supabase, event.data)
  } else if (event.type === 'suscripcion.cancelada') {
    await handleCancelacion(supabase, event.data)
  }

  return NextResponse.json({ received: true })
}

async function handleCargoExitoso(
  supabase: ServiceClient,
  data: Record<string, unknown>
) {
  const culqiSubId = data.subscription_id as string
  const chargeId = data.id as string
  const amount = data.amount as number

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_id, membership_plans(tickets_qty)')
    .eq('culqi_subscription_id', culqiSubId)
    .single()

  if (!sub) return

  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  await supabase.from('subscriptions').update({
    status: 'active',
    started_at: now.toISOString(),
    period_start: now.toISOString(),
    period_end: periodEnd.toISOString(),
  }).eq('id', sub.id)

  await supabase.from('payments').insert({
    subscription_id: sub.id,
    amount_soles: amount / 100,
    status: 'paid',
    culqi_charge_id: chargeId,
    paid_at: now.toISOString(),
  })

  const { data: lastTicket } = await supabase
    .from('raffle_tickets')
    .select('ticket_code')
    .order('issued_at', { ascending: false })
    .limit(1)
    .single()

  const lastSeq = lastTicket
    ? parseInt((lastTicket.ticket_code as string).split('-')[2], 10)
    : 0

  // membership_plans comes back as an array from the join; grab first element
  const membershipPlans = sub.membership_plans as unknown as { tickets_qty: number }[] | { tickets_qty: number } | null
  const planRow = Array.isArray(membershipPlans) ? membershipPlans[0] : membershipPlans
  const ticketsQty = planRow?.tickets_qty ?? 0

  if (ticketsQty > 0) {
    const codes = generateTicketBatch(ticketsQty, lastSeq + 1)
    await supabase.from('raffle_tickets').insert(
      codes.map(code => ({
        user_id: sub.user_id,
        subscription_id: sub.id,
        ticket_code: code,
      }))
    )
  }
}

async function handleCargoFallido(
  supabase: ServiceClient,
  data: Record<string, unknown>
) {
  const culqiSubId = data.subscription_id as string
  await supabase.from('subscriptions')
    .update({ status: 'past_due' })
    .eq('culqi_subscription_id', culqiSubId)
}

async function handleCancelacion(
  supabase: ServiceClient,
  data: Record<string, unknown>
) {
  const culqiSubId = data.id as string
  await supabase.from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('culqi_subscription_id', culqiSubId)
}
