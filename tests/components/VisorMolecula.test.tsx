import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { it, expect, vi, afterEach } from 'vitest'
import { LanguageProvider } from '@/app/components/Language'
import VisorMolecula from '@/app/miembros/contenido/que-hay-en-la-planta/VisorMolecula'

// cleanup primero: desmontar con los dobles aún puestos (la limpieza del visor llama a getContext).
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.doUnmock('3dmol'); vi.resetModules() })

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

// 3D simulado: un IntersectionObserver controlable, un contexto WebGL falso y un visor 3Dmol de mentira
// cuyo canvas registra los eventos que le llegan (como hace 3Dmol en initContainer).
function montar3D() {
  let avisar: (visible: boolean) => unknown = () => {}
  vi.stubGlobal('IntersectionObserver', class {
    constructor(cb: IntersectionObserverCallback) { avisar = v => cb([{ isIntersecting: v } as IntersectionObserverEntry], this as never) }
    observe() {}
    disconnect() {}
  })
  const loseContext = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ getExtension: () => ({ loseContext }) } as never)
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => 'sdf' })))
  const canvas = document.createElement('canvas')
  const recibidos: string[] = []
  for (const t of ['wheel', 'touchstart', 'touchmove']) canvas.addEventListener(t, () => recibidos.push(t))
  const visor = { addModel: () => ({ selectedAtoms: () => [] }), setStyle() {}, zoomTo() {}, zoom() {}, render() {},
    spin: vi.fn(), clear: vi.fn(), getCanvas: () => canvas }
  const createViewer = vi.fn((el: HTMLElement) => { el.append(canvas); return visor })
  vi.doMock('3dmol', () => ({ createViewer }))
  const r = render(<LanguageProvider locale="es"><VisorMolecula molecula="cbd" /></LanguageProvider>)
  const verse = async (v: boolean) => { await act(async () => { await avisar(v) }) }
  return { ...r, verse, canvas, recibidos, visor, createViewer, loseContext }
}

it('la rueda y el dedo desplazan la página; el dedo gira solo con «Girar con el dedo»', async () => {
  const { verse, canvas, recibidos, createViewer } = montar3D()
  await verse(true)
  await waitFor(() => expect(createViewer).toHaveBeenCalled())
  fireEvent.wheel(canvas); fireEvent.touchStart(canvas); fireEvent.touchMove(canvas)
  expect(recibidos).toEqual([])
  const boton = screen.getByRole('button', { name: /Girar con el dedo/ })
  expect(boton).toHaveAttribute('aria-pressed', 'false')
  fireEvent.click(boton)
  expect(boton).toHaveAttribute('aria-pressed', 'true')
  fireEvent.wheel(canvas); fireEvent.touchStart(canvas); fireEvent.touchMove(canvas)
  expect(recibidos).toEqual(['touchstart', 'touchmove'])
})

it('gira solo mientras está en pantalla', async () => {
  const { verse, visor } = montar3D()
  await verse(true)
  await waitFor(() => expect(visor.spin).toHaveBeenLastCalledWith('y', 0.4))
  await verse(false)
  expect(visor.spin).toHaveBeenLastCalledWith(false, 0.4)
  await verse(true)
  expect(visor.spin).toHaveBeenLastCalledWith('y', 0.4)
})

it('con movimiento reducido no gira', async () => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce') }))
  const { verse, visor } = montar3D()
  await verse(true)
  await waitFor(() => expect(visor.spin).toHaveBeenCalled())
  expect(visor.spin).not.toHaveBeenCalledWith('y', 0.4)
})

it('al desmontar detiene el giro y libera el contexto WebGL del lienzo', async () => {
  const { verse, createViewer, visor, loseContext, unmount } = montar3D()
  await verse(true)
  await waitFor(() => expect(createViewer).toHaveBeenCalled())
  const antes = loseContext.mock.calls.length
  unmount()
  expect(visor.spin).toHaveBeenLastCalledWith(false)
  expect(visor.clear).toHaveBeenCalled()
  expect(loseContext).toHaveBeenCalledTimes(antes + 1)
})

it('el respaldo 2D conserva la etiqueta pero sin el punto naranja', async () => {
  const { container } = render(<LanguageProvider locale="es">
    <VisorMolecula molecula="thc" resaltar="anillo" etiquetaResaltado="anillo cerrado" /></LanguageProvider>)
  expect(await screen.findByText('anillo cerrado')).toBeInTheDocument()
  expect(container.querySelector('img')).toBeInTheDocument()
  expect(container.textContent).not.toContain('●')
})
