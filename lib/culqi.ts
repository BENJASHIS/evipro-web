const CULQI_API = 'https://api.culqi.com/v2'

export function buildCulqiHeaders(privateKey: string) {
  return {
    'Authorization': `Bearer ${privateKey}`,
    'Content-Type': 'application/json',
  }
}

export async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expected = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    return expected === signature
  } catch {
    return false
  }
}

export async function createCulqiCustomer(data: {
  email: string
  first_name: string
  last_name: string
  phone_number: string
  address: string
  address_city: string
  country_code: string
}) {
  const res = await fetch(`${CULQI_API}/customers`, {
    method: 'POST',
    headers: buildCulqiHeaders(process.env.CULQI_PRIVATE_KEY!),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Culqi customer error: ${res.status}`)
  return res.json()
}

export async function createCulqiSubscription(data: {
  token_id: string
  plan_id: string
  tyc: boolean
}) {
  const res = await fetch(`${CULQI_API}/subscriptions`, {
    method: 'POST',
    headers: buildCulqiHeaders(process.env.CULQI_PRIVATE_KEY!),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.user_message || `Culqi error: ${res.status}`)
  }
  return res.json()
}

export async function createCulqiCharge(data: {
  amount: number
  currency_code: string
  email: string
  source_id: string
  description?: string
}) {
  const res = await fetch(`${CULQI_API}/charges`, {
    method: 'POST',
    headers: buildCulqiHeaders(process.env.CULQI_PRIVATE_KEY!),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.user_message || `Culqi error: ${res.status}`)
  }
  return res.json()
}

export async function createCulqiPlan(data: {
  name: string
  amount: number
  currency_code: string
  interval_unit_time: number
  interval_count: number
  limit: number
}) {
  const res = await fetch(`${CULQI_API}/plans`, {
    method: 'POST',
    headers: buildCulqiHeaders(process.env.CULQI_PRIVATE_KEY!),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Culqi plan error: ${res.status}`)
  return res.json()
}
