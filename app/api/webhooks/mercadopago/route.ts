import { NextRequest, NextResponse } from 'next/server'
import { verifyMPWebhook, getMPPayment } from '@/lib/mercadopago'
import { createServiceClient } from '@/lib/supabase-server'
import { generateTicketBatch } from '@/lib/tickets'
import { computePeriodEnd } from '@/lib/billing'
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes'

type ServiceClient = ReturnType<typeof createServiceClient>

export async function POST(req: NextRequest) {
  const xSignature  = req.headers.get('x-signature') ?? ''
  const xRequestId  = req.headers.get('x-request-id') ?? ''
  const body        = await req.json() as { type?: string; data?: { id?: string } }

  const dataId = body.data?.id ?? ''

  // La verificación de firma NUNCA es opcional (AGENTS.md). Si el secreto no está
  // configurado, se rechaza: procesar sin firma dejaría el webhook abierto a
  // cualquiera. Fail-closed.
  if (!process.env.MP_WEBHOOK_SECRET) {
    console.error('[webhook/mp] MP_WEBHOOK_SECRET no configurado; se rechaza el webhook')
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 })
  }
  const valid = await verifyMPWebhook(xSignature, xRequestId, dataId)
  if (!valid) return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })

  const supabase = createServiceClient()
  const type = body.type ?? ''

  if (type === 'payment' && dataId) {
    const payment = await getMPPayment(dataId) as PaymentResponse
    const status = payment.status
    const extRef = payment.external_reference ?? ''

    if (extRef.startsWith('consejeria:')) {
      const bookingId = extRef.replace('consejeria:', '')
      if (status === 'approved') {
        await handleConsejeriaPagada(supabase, bookingId, String(payment.id))
      }
    } else {
      if (status === 'approved') {
        await handlePagoAprobado(supabase, payment)
      } else if (status === 'rejected' || status === 'cancelled') {
        await handlePagoRechazado(supabase, payment)
      }
    }
  }

  return NextResponse.json({ received: true })
}

async function handleConsejeriaPagada(
  supabase: ServiceClient,
  bookingId: string,
  paymentId: string
) {
  await supabase
    .from('counseling_bookings')
    .update({ paid: true, mp_payment_id: paymentId })
    .eq('id', bookingId)
}

async function handlePagoAprobado(
  supabase: ServiceClient,
  payment: PaymentResponse
) {
  const subscriptionId = payment.external_reference ?? ''
  const paymentId = String(payment.id)
  const amount = payment.transaction_amount ?? 0

  if (!subscriptionId) return

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_id, status, mp_payment_id, membership_plans(tickets_qty, period)')
    .eq('id', subscriptionId)
    .single()

  if (!sub) return

  // Idempotencia: MP reintenta/duplica webhooks. Si esta suscripción ya quedó
  // activa con este mismo pago, no reprocesar (evita pagos y tickets duplicados).
  if (sub.status === 'active' && sub.mp_payment_id === paymentId) return

  const now = new Date()
  const planRowForPeriod = (Array.isArray(sub.membership_plans) ? sub.membership_plans[0] : sub.membership_plans) as { period: import('@/lib/types').PlanPeriod } | null
  const periodEnd = computePeriodEnd(planRowForPeriod?.period ?? 'mensual', now)

  await supabase.from('subscriptions').update({
    status: 'active',
    mp_payment_id: paymentId,
    started_at: now.toISOString(),
    period_start: now.toISOString(),
    period_end: periodEnd.toISOString(),
  }).eq('id', sub.id)

  await supabase.from('payments').insert({
    subscription_id: sub.id,
    amount_soles: amount,
    status: 'paid',
    mp_payment_id: paymentId,
    paid_at: now.toISOString(),
  })

  const membershipPlans = sub.membership_plans as unknown as { tickets_qty: number }[] | { tickets_qty: number } | null
  const planRow = Array.isArray(membershipPlans) ? membershipPlans[0] : membershipPlans
  const ticketsQty = planRow?.tickets_qty ?? 0

  if (ticketsQty > 0) {
    const { data: lastTicket } = await supabase
      .from('raffle_tickets')
      .select('ticket_code')
      .order('issued_at', { ascending: false })
      .limit(1)
      .single()

    const lastSeq = lastTicket
      ? parseInt((lastTicket.ticket_code as string).split('-')[2], 10)
      : 0

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

async function handlePagoRechazado(
  supabase: ServiceClient,
  payment: PaymentResponse
) {
  const subscriptionId = payment.external_reference ?? ''
  if (!subscriptionId) return
  await supabase.from('subscriptions')
    .update({ status: 'past_due' })
    .eq('id', subscriptionId)
}
