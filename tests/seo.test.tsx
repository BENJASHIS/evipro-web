import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import sitemap from '@/app/sitemap'
import robots from '@/app/robots'
import config from '../next.config'
import ConsultaPage from '@/app/consulta-cannabis-medicinal/page'
import { publicMetadata, SITE_URL, CONSULTA_PATH } from '@/lib/seo'
import { precioConsulta } from '@/lib/consulta-pricing'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

describe('descubrimiento público sin indexar áreas operativas', () => {
  it('publica URLs únicas sin tokens, formularios ni redirects', () => {
    const urls = sitemap().map(entry => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls).toContain(`${SITE_URL}${CONSULTA_PATH}`)
    expect(urls).toContain(`${SITE_URL}/medicos/dr-jara`)
    for (const url of urls) {
      expect(new URL(url).origin).toBe(SITE_URL)
      expect(new URL(url).search).toBe('')
      expect(url).not.toMatch(/miembros|admin|checkout|agendar|reservas|login|registro|consejeria/)
    }
  })

  it('no bloquea el rastreo necesario para leer noindex y protege el portal médico', async () => {
    const rules = robots().rules
    expect(rules).toEqual({ userAgent: '*', allow: '/', disallow: '/api/' })
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`)
    const headers = await config.headers!()
    for (const source of ['/miembros/:path*', '/admin/:path*', '/medicos/:slug/reservas/:path*', '/checkout/:path*']) {
      expect(headers.find(entry => entry.source === source)?.headers)
        .toContainEqual({ key: 'X-Robots-Tag', value: 'noindex, nofollow' })
    }
    expect(headers.some(entry => entry.source === CONSULTA_PATH || entry.source === '/')).toBe(false)
  })

  it('cada canonical identifica la página, sin enviar todas a la portada', () => {
    for (const path of ['/', CONSULTA_PATH, '/planes', '/medicos/dr-jara']) {
      const meta = publicMetadata(path, 'Título', 'Descripción')
      expect(meta.alternates?.canonical).toBe(new URL(path, SITE_URL).toString())
    }
  })
})

describe('servicio que se ofrece y reserva', () => {
  it('publica precios coherentes con la tarifa y el JSON-LD, y lleva al médico correcto', () => {
    const { container } = render(<ConsultaPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Consulta de cannabis medicinal en Cusco y online')
    expect(screen.getByRole('link', { name: 'Reservar con el Dr. Jara →' }))
      .toHaveAttribute('href', '/medicos/dr-jara/agendar')
    const schema = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!)
    expect(schema.offers.map((offer: { price: number }) => offer.price))
      .toEqual([precioConsulta('presencial', 'regular', 1), precioConsulta('virtual', 'regular', 1)])
    for (const modalidad of ['presencial', 'virtual'] as const) {
      expect(screen.getByText(`S/${precioConsulta(modalidad, 'regular', 1)}`)).toBeVisible()
    }
    expect(screen.getByText(/reservar una consulta no garantiza una receta/)).toBeVisible()
  })
})
