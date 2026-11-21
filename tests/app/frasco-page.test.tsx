import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
vi.mock('@/app/miembros/contenido/explora-cbd-thc/VisorFrasco', () => ({ default: (p: { src?: string }) => <iframe data-src={p.src ?? '/frasco/visor/index.html'} /> }))
vi.mock('@/app/components/Nav', () => ({ default: () => null }))
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND') } }))
import FrascoPage, { metadata } from '@/app/frasco/page'

beforeEach(() => { localStorage.clear(); vi.stubEnv('FRASCO_PUBLICO', '1') })
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs() })

it('pregunta la edad antes de mostrar nada y no guarda un «No»', () => {
  render(<FrascoPage />)
  expect(screen.getByText(/mayores de 18 años en Perú \(21 donde la ley de tu país lo exija\)/)).toBeInTheDocument()
  expect(document.querySelector('iframe')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'No' }))
  expect(screen.getByText('Este contenido es solo para mayores de edad.')).toBeInTheDocument()
  expect(localStorage.getItem('evipro-mayor-edad')).toBeNull()
})
it('al confirmar muestra visor, secciones y fuente oficial, y lo recuerda', () => {
  render(<FrascoPage />); fireEvent.click(screen.getByRole('button', { name: 'Sí, soy mayor de edad' }))
  expect(document.querySelector('iframe[data-src="/frasco/visor/index.html"]')).not.toBeNull()
  for (const id of ['etiqueta', 'senales', 'si-falta', 'limite', 'farmacias', 'seguridad']) expect(document.getElementById(id), id).not.toBeNull()
  // Carlos (20-nov): sin declaración de conflicto de interés en la página.
  expect(document.getElementById('conflicto')).toBeNull()
  expect(document.body.textContent).not.toMatch(/Conflicto de interés|no recibe pagos/)
  expect(screen.getAllByText(/16 de junio de 2026/).length).toBeGreaterThan(0)
  expect(localStorage.getItem('evipro-mayor-edad')).toBe('1')
  expect(document.body.textContent).not.toMatch(/Cannavital|S\/\s?\d|Puede causar dependencia/)
})
it('quien ya confirmó entra directo', () => {
  localStorage.setItem('evipro-mayor-edad', '1'); render(<FrascoPage />)
  expect(screen.getByRole('heading', { level: 1, name: 'Cómo reconocer un preparado de cannabis medicinal' })).toBeInTheDocument()
})
it('con el almacenamiento bloqueado pregunta igual y deja pasar', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('bloqueado') })
  render(<FrascoPage />); fireEvent.click(screen.getByRole('button', { name: 'Sí, soy mayor de edad' }))
  expect(document.querySelector('iframe')).not.toBeNull()
})
it('no se indexa', () => { expect(metadata.robots).toEqual({ index: false, follow: false }) })

it('sin FRASCO_PUBLICO=1 la página no existe (sale cuando la declaración de conflicto sea cierta)', () => {
  for (const valor of ['', '0', 'true']) {
    vi.stubEnv('FRASCO_PUBLICO', valor)
    expect(() => FrascoPage()).toThrow('NEXT_NOT_FOUND')
  }
})
