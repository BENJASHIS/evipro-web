// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/guia-frasco/[token]/visor/[...asset]/route'
import { firmarGuia } from '@/lib/guia-frasco'
import { NOINDEX_ROUTES } from '@/lib/seo'

const pedir = (token: string, asset: string[]) =>
  GET(new Request(`http://localhost/guia-frasco/${token}/visor/${asset.join('/')}`), { params: Promise.resolve({ token, asset }) })

let t = ''
beforeAll(() => {
  vi.stubEnv('FRASCO_GUIDE_SECRET', 's')
  t = firmarGuia({ thc: 0.9, cbd: 10, dias: 90 })
})

describe('visor del frasco servido con el enlace de la guía', () => {
  it('con enlace válido sirve el visor completo, THC incluido', async () => {
    const r = await pedir(t, ['index.html'])
    expect(r.status).toBe(200)
    expect(r.headers.get('content-security-policy')).toContain("frame-ancestors 'self'")
    expect(r.headers.get('cache-control')).toBe('private, no-store')
    expect((await pedir(t, ['assets', 'thc.json'])).status).toBe(200)
  })
  it('con enlace inválido no sirve nada', async () => {
    expect((await pedir('x.y', ['index.html'])).status).toBe(404)
  })
  it('rechaza traversal y archivos fuera del manifiesto', async () => {
    for (const a of [['..', '.env'], ['manifest.json'], ['assets', 'otro.json']]) expect((await pedir(t, a)).status).toBe(404)
  })
  it('la guía no se indexa', () => { expect(NOINDEX_ROUTES).toContain('/guia-frasco/:path*') })
})
