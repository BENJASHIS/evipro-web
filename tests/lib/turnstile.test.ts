import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  readTurnstileToken,
  turnstileServerEnabled,
  verifyTurnstileToken,
} from '../../lib/turnstile'

const originalSecret = process.env.TURNSTILE_SECRET_KEY

afterEach(() => {
  if (originalSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY
  else process.env.TURNSTILE_SECRET_KEY = originalSecret
  vi.unstubAllGlobals()
})

describe('turnstile', () => {
  it('lee el token desde el body', () => {
    expect(readTurnstileToken({ turnstile_token: ' token ' })).toBe('token')
    expect(readTurnstileToken({ turnstile_token: 123 })).toBe('')
    expect(readTurnstileToken(null)).toBe('')
  })

  it('queda inactivo cuando no hay secret configurado', async () => {
    delete process.env.TURNSTILE_SECRET_KEY

    expect(turnstileServerEnabled()).toBe(false)
    await expect(verifyTurnstileToken('', new Request('http://localhost'))).resolves.toEqual({
      ok: true,
      skipped: true,
    })
  })

  it('rechaza un token ausente cuando hay secret', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret-test'

    const result = await verifyTurnstileToken('', new Request('http://localhost'))

    expect(result).toEqual({ ok: false, error: 'Completa la verificación anti-bot.' })
  })

  it('rechaza tokens demasiado largos sin llamar a Cloudflare', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret-test'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await verifyTurnstileToken('x'.repeat(2049), new Request('http://localhost'))

    expect(result).toEqual({ ok: false, error: 'Verificación anti-bot inválida.' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('acepta la respuesta exitosa de Cloudflare', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret-test'
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 })),
    ))

    const result = await verifyTurnstileToken('token-ok', new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.4, 10.0.0.1' },
    }))

    expect(result).toEqual({ ok: true })
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string)
    expect(body.response).toBe('token-ok')
    expect(body.remoteip).toBe('203.0.113.4')
  })

  it('rechaza una respuesta no exitosa de Cloudflare', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret-test'
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ success: false }), { status: 200 })),
    ))

    const result = await verifyTurnstileToken('token-malo', new Request('http://localhost'))

    expect(result).toEqual({
      ok: false,
      error: 'Verificación anti-bot inválida. Intenta de nuevo.',
    })
  })
})
