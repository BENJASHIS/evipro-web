import { render, screen, waitFor } from '@testing-library/react'
import { it, expect, vi, afterEach } from 'vitest'
import { LanguageProvider } from '@/app/components/Language'
import VisorMolecula from '@/app/miembros/contenido/que-hay-en-la-planta/VisorMolecula'

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.doUnmock('3dmol'); vi.resetModules() })

it('sin 3D muestra imagen 2D y texto', async () => {
  render(<LanguageProvider locale="es"><VisorMolecula molecula="thc" /></LanguageProvider>)
  expect(await screen.findByAltText(/THC|tetrahidrocannabinol/i)).toHaveAttribute('src', '/moleculas/thc.png')
  expect(screen.getByText(/C21H30O2/)).toBeInTheDocument()
})

it('si la librería falla, también cae al respaldo', async () => {
  vi.stubGlobal('IntersectionObserver', class {
    constructor(cb: IntersectionObserverCallback) { setTimeout(() => cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never)) }
    observe() {}
    disconnect() {}
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as never)
  vi.doMock('3dmol', () => { throw new Error('sin red') })
  const { container } = render(<LanguageProvider locale="es"><VisorMolecula molecula="cbd" /></LanguageProvider>)
  await waitFor(() => expect(container.querySelector('img')).toHaveAttribute('src', '/moleculas/cbd.png'))
  expect(screen.getByText(/C21H30O2/)).toBeInTheDocument()
})
