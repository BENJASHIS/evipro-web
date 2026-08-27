import { NextResponse } from 'next/server'

type Bucket = {
  count: number
  resetAt: number
}

export type RateLimitRule = {
  namespace: string
  limit: number
  windowMs: number
}

type RateLimitAllowed = {
  ok: true
  limit: number
  remaining: number
  resetAt: number
}

type RateLimitBlocked = {
  ok: false
  limit: number
  remaining: 0
  resetAt: number
  retryAfterSeconds: number
}

export type RateLimitResult = RateLimitAllowed | RateLimitBlocked

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 5000

function nowMs() {
  return Date.now()
}

function pruneExpired(now: number) {
  if (buckets.size < MAX_BUCKETS) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function clientIp(req: Request): string {
  const direct = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip')
  if (direct?.trim()) return direct.trim()

  const forwarded = req.headers.get('x-forwarded-for')
  const firstForwarded = forwarded?.split(',')[0]?.trim()
  return firstForwarded || 'unknown'
}

export function checkRateLimitForKey(key: string, rule: RateLimitRule): RateLimitResult {
  const now = nowMs()
  pruneExpired(now)

  const namespacedKey = `${rule.namespace}:${key}`
  const current = buckets.get(namespacedKey)
  const bucket = current && current.resetAt > now
    ? current
    : { count: 0, resetAt: now + rule.windowMs }

  bucket.count += 1
  buckets.set(namespacedKey, bucket)

  if (bucket.count > rule.limit) {
    return {
      ok: false,
      limit: rule.limit,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  return {
    ok: true,
    limit: rule.limit,
    remaining: rule.limit - bucket.count,
    resetAt: bucket.resetAt,
  }
}

export function checkRateLimit(req: Request, rule: RateLimitRule): RateLimitResult {
  return checkRateLimitForKey(clientIp(req), rule)
}

export function rateLimitResponse(result: RateLimitBlocked) {
  return NextResponse.json(
    { error: 'Demasiados intentos. Intenta nuevamente en unos minutos.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSeconds),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    },
  )
}

export function resetRateLimitForTests() {
  buckets.clear()
}
