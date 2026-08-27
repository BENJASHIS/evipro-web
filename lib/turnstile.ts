import { randomUUID } from 'node:crypto'
import { clientIp } from '@/lib/rate-limit'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const MAX_TOKEN_LENGTH = 2048

type TurnstileApiResponse = {
  success?: boolean
  'error-codes'?: string[]
}

type TurnstileResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string }

export function turnstileServerEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim())
}

export function readTurnstileToken(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return ''
  const value = (body as Record<string, unknown>).turnstile_token
  return typeof value === 'string' ? value.trim() : ''
}

export async function verifyTurnstileToken(token: string, req: Request): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()
  if (!secret) return { ok: true, skipped: true }

  if (!token) {
    return { ok: false, error: 'Completa la verificación anti-bot.' }
  }
  if (token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, error: 'Verificación anti-bot inválida.' }
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: clientIp(req),
        idempotency_key: randomUUID(),
      }),
    })

    if (!res.ok) {
      return { ok: false, error: 'No pudimos validar la verificación anti-bot. Intenta de nuevo.' }
    }

    const data = await res.json().catch(() => null) as TurnstileApiResponse | null
    if (data?.success === true) return { ok: true }

    return { ok: false, error: 'Verificación anti-bot inválida. Intenta de nuevo.' }
  } catch {
    return { ok: false, error: 'No pudimos validar la verificación anti-bot. Intenta de nuevo.' }
  }
}
