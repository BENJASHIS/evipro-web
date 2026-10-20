import { render, screen } from '@testing-library/react'
import { it, expect, vi } from 'vitest'
import { LanguageProvider } from '@/app/components/Language'
import VisorMolecula from '@/app/miembros/contenido/que-hay-en-la-planta/VisorMolecula'

it('sin 3D muestra imagen 2D y texto', async () => {
  render(<LanguageProvider locale="es"><VisorMolecula molecula="thc" /></LanguageProvider>)
  expect(await screen.findByRole('img', { name: /THC|tetrahidrocannabinol/i })).toHaveAttribute('src', '/moleculas/thc.png')
  expect(screen.getByText(/C21H30O2/)).toBeInTheDocument()
})

it('si la librería falla, también cae al respaldo', async () => {
  vi.stubGlobal('IntersectionObserver', class {
    constructor(cb: IntersectionObserverCallback) { setTimeout(() => cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never)) }
    observe() {}
    disconnect() {}
  })
  vi.doMock('3dmol', () => { throw new Error('sin red') })
  render(<LanguageProvider locale="es"><VisorMolecula molecula="cbd" /></LanguageProvider>)
  expect(await screen.findByRole('img', { name: /CBD|cannabidiol/i })).toBeInTheDocument()
  vi.unstubAllGlobals()
})
