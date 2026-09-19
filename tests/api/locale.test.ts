import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/locale/route'

function request(body: unknown, origin = 'https://www.evipro.pe') {
  return new NextRequest('https://www.evipro.pe/api/locale', {
    method: 'POST', headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('language cookie', () => {
  it('persists only a validated language as a secure site-wide cookie', async () => {
    const response = await POST(request({ locale: 'en' }))
    expect(response.status).toBe(200)
    expect(response.cookies.get('evipro_locale')).toMatchObject({
      value: 'en', path: '/', httpOnly: true, secure: true, sameSite: 'lax',
    })
  })
  it('rejects unsupported languages and cross-origin writes', async () => {
    expect((await POST(request({ locale: 'fr' }))).status).toBe(400)
    expect((await POST(request({ locale: 'en' }, 'https://other.example'))).status).toBe(403)
  })
  it('uses the original Host when Next normalizes the local request URL', async () => {
    const response = await POST(new NextRequest('http://localhost:3100/api/locale', {
      method: 'POST', headers: { host: '127.0.0.1:3100', origin: 'http://127.0.0.1:3100' },
      body: JSON.stringify({ locale: 'es' }),
    }))
    expect(response.status).toBe(200)
  })
})
