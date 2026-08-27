import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkRateLimit,
  checkRateLimitForKey,
  clientIp,
  resetRateLimitForTests,
} from '../../lib/rate-limit'

function request(headers: Record<string, string>) {
  return new Request('http://localhost/test', { headers })
}

describe('rate limit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-27T10:00:00-05:00'))
    resetRateLimitForTests()
  })

  afterEach(() => {
    vi.useRealTimers()
    resetRateLimitForTests()
  })

  it('usa la primera IP de x-forwarded-for', () => {
    expect(clientIp(request({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }))).toBe('1.1.1.1')
  })

  it('bloquea al superar el límite dentro de la ventana', () => {
    const rule = { namespace: 'test', limit: 2, windowMs: 60_000 }
    expect(checkRateLimitForKey('u1', rule).ok).toBe(true)
    expect(checkRateLimitForKey('u1', rule).ok).toBe(true)
    const blocked = checkRateLimitForKey('u1', rule)
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) expect(blocked.retryAfterSeconds).toBe(60)
  })

  it('reinicia el contador al terminar la ventana', () => {
    const rule = { namespace: 'test', limit: 1, windowMs: 60_000 }
    expect(checkRateLimitForKey('u1', rule).ok).toBe(true)
    expect(checkRateLimitForKey('u1', rule).ok).toBe(false)
    vi.advanceTimersByTime(60_001)
    expect(checkRateLimitForKey('u1', rule).ok).toBe(true)
  })

  it('separa rutas por namespace', () => {
    expect(checkRateLimitForKey('u1', { namespace: 'a', limit: 1, windowMs: 60_000 }).ok).toBe(true)
    expect(checkRateLimitForKey('u1', { namespace: 'b', limit: 1, windowMs: 60_000 }).ok).toBe(true)
  })

  it('puede limitar directamente por request', () => {
    const req = request({ 'cf-connecting-ip': '3.3.3.3' })
    const rule = { namespace: 'request', limit: 1, windowMs: 60_000 }
    expect(checkRateLimit(req, rule).ok).toBe(true)
    expect(checkRateLimit(req, rule).ok).toBe(false)
  })
})
