import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
const capturado = vi.hoisted(() => ({ beforeSend: undefined as undefined | ((e: { type: string; url: string }) => unknown) }))
vi.mock('@vercel/analytics/next', () => ({ Analytics: (p: { beforeSend?: typeof capturado.beforeSend }) => { capturado.beforeSend = p.beforeSend; return null } }))
import { rutaSinToken } from '@/lib/analitica'
import AnaliticaVercel from '@/app/components/AnaliticaVercel'
import { metadata } from '@/app/guia-frasco/[token]/page'

// Revisión final (20-nov): la URL de la guía lleva el token con la composición; la analítica no debe recibirlo.
it('quita el token de la guía y deja intacto lo demás', () => {
  expect(rutaSinToken('/guia-frasco/eyJ2IjoxfQ.abc')).toBe('/guia-frasco/[token]')
  expect(rutaSinToken('https://www.evipro.pe/guia-frasco/eyJ2IjoxfQ.abc?x=1#thc=0.9')).toBe('https://www.evipro.pe/guia-frasco/[token]')
  expect(rutaSinToken('https://www.evipro.pe/frasco')).toBe('https://www.evipro.pe/frasco')
  expect(rutaSinToken('/consulta-cannabis-medicinal')).toBe('/consulta-cannabis-medicinal')
})
it('Vercel Analytics recibe la guía sin token', () => {
  render(<AnaliticaVercel />)
  expect(capturado.beforeSend!({ type: 'pageview', url: 'https://www.evipro.pe/guia-frasco/eyJ2IjoxfQ.abc' }))
    .toEqual({ type: 'pageview', url: 'https://www.evipro.pe/guia-frasco/[token]' })
})
it('Google Analytics no se configura en la guía y la guía no manda su dirección como referente', () => {
  const layout = readFileSync('app/layout.tsx', 'utf8')
  expect(layout).toMatch(/if \(!location\.pathname\.startsWith\('\/guia-frasco\/'\)\) gtag\('config'/)
  expect(layout).toContain('<AnaliticaVercel />')
  expect(layout).not.toContain('<Analytics />')
  expect(metadata.referrer).toBe('no-referrer')
})
