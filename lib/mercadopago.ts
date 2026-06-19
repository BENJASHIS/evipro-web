import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

function getMPClient() {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) throw new Error('MP_ACCESS_TOKEN no configurado')
  return new MercadoPagoConfig({ accessToken: token })
}

export interface MPPreferenceItem {
  id?: string
  title: string
  unit_price: number
  quantity: number
  currency_id?: string
}

export async function createMPPreference(params: {
  items: MPPreferenceItem[]
  payer_email: string
  external_reference: string
  back_urls?: { success?: string; failure?: string; pending?: string }
  metadata?: Record<string, string>
}) {
  const client = getMPClient()
  const preference = new Preference(client)

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const result = await preference.create({
    body: {
      items: params.items.map((i, idx) => ({
        id: i.id ?? String(idx + 1),
        title: i.title,
        unit_price: i.unit_price,
        quantity: i.quantity,
        currency_id: i.currency_id ?? 'PEN',
      })),
      payer: { email: params.payer_email },
      external_reference: params.external_reference,
      back_urls: {
        success: params.back_urls?.success ?? `${base}/checkout/success`,
        failure: params.back_urls?.failure ?? `${base}/checkout/failure`,
        pending: params.back_urls?.pending ?? `${base}/checkout/pending`,
      },
      auto_return: 'approved',
      notification_url: `${base}/api/webhooks/mercadopago`,
      metadata: params.metadata ?? {},
    },
  })

  return result
}

export async function getMPPayment(payment_id: string | number) {
  const client = getMPClient()
  const payment = new Payment(client)
  return payment.get({ id: String(payment_id) })
}

export async function verifyMPWebhook(
  xSignature: string,
  xRequestId: string,
  dataId: string
): Promise<boolean> {
  try {
    const secret = process.env.MP_WEBHOOK_SECRET
    if (!secret) return false

    const ts = xSignature.split(',').find(p => p.startsWith('ts='))?.split('=')[1] ?? ''
    const v1 = xSignature.split(',').find(p => p.startsWith('v1='))?.split('=')[1] ?? ''

    const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(template))
    const computed = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0')).join('')

    return computed === v1
  } catch {
    return false
  }
}
