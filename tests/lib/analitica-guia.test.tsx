import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
const capturado = vi.hoisted(() => ({ beforeSend: undefined as undefined | ((e: { type: string; url: string }) => unknown) }))
vi.mock('@vercel/analytics/next', () => ({ Analytics: (p: { beforeSend?: typeof capturado.beforeSend }) => { capturado.beforeSend = p.beforeSend; return null } }))
import { rutaSinToken } from '@/lib/analitica'
import AnaliticaVercel from '@/app/components/AnaliticaVercel'
import { metadata } from '@/app/g/[token]/page'
import { NOINDEX_ROUTES } from '@/lib/seo'

// Revisión final (20-nov): la URL de la guía lleva el token con la composición; la analítica no debe recibirlo.
it('quita el token de la guía y deja intacto lo demás', () => {
  expect(rutaSinToken('/g/q3Zx9AbCdEfGhIjKlMnOpQ0.9-10-tsdk3k')).toBe('/g/[token]')
  expect(rutaSinToken('https://www.evipro.pe/g/q3Zx9AbCdEfGhIjKlMnOpQ0.9-10-tsdk3k?x=1#thc=0.9')).toBe('https://www.evipro.pe/g/[token]')
  expect(rutaSinToken('https://www.evipro.pe/blog/g/algo')).toBe('https://www.evipro.pe/blog/g/algo')
  expect(rutaSinToken('https://www.evipro.pe/frasco')).toBe('https://www.evipro.pe/frasco')
  expect(rutaSinToken('/consulta-cannabis-medicinal')).toBe('/consulta-cannabis-medicinal')
})
it('Vercel Analytics recibe la guía sin token', () => {
  render(<AnaliticaVercel />)
  expect(capturado.beforeSend!({ type: 'pageview', url: 'https://www.evipro.pe/g/q3Zx9AbCdEfGhIjKlMnOpQ0.9-10-tsdk3k' }))
    .toEqual({ type: 'pageview', url: 'https://www.evipro.pe/g/[token]' })
})
it('Google Analytics no se configura en la guía y la guía no manda su dirección como referente', () => {
  const layout = readFileSync('app/layout.tsx', 'utf8')
  expect(layout).toMatch(/if \(!location\.pathname\.startsWith\('\/g\/'\)\) gtag\('config'/)
  expect(NOINDEX_ROUTES).toContain('/g/:path*')
  expect(layout).toContain('<AnaliticaVercel />')
  expect(layout).not.toContain('<Analytics />')
  expect(metadata.referrer).toBe('no-referrer')
})
