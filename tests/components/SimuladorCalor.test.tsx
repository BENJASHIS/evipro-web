import { render, screen, fireEvent } from '@testing-library/react'
import { it, expect, vi, afterEach } from 'vitest'
import { LanguageProvider } from '@/app/components/Language'
import SimuladorCalor from '@/app/miembros/contenido/que-hay-en-la-planta/SimuladorCalor'

afterEach(() => { delete (Element.prototype as { requestFullscreen?: unknown }).requestFullscreen })

const montar = (locale: 'es' | 'en' = 'es') => render(<LanguageProvider locale={locale}><SimuladorCalor /></LanguageProvider>)

it('110 °C y 30 min: casi cero; la constante es medida y el porcentaje, calculado con el modelo', () => {
  montar()
  fireEvent.change(screen.getByRole('slider', { name: /tiempo/i }), { target: { value: '30' } })
  expect(screen.getByText(/THCA que queda: 3,7 %/)).toBeInTheDocument()
  expect(screen.getByText('calculado con un modelo de primer orden')).toBeInTheDocument()
  expect(screen.getByText('constante medida (Tabla 2)')).toBeInTheDocument()
  expect(screen.getByText(/casi cero a los 30 min/)).toBeInTheDocument()
})
it('130 °C se rotula con constante estimada', () => {
  montar()
  fireEvent.click(screen.getByRole('radio', { name: /130/ }))
  expect(screen.getByText('constante estimada (Arrhenius)')).toBeInTheDocument()
  expect(screen.queryByText('constante medida (Tabla 2)')).not.toBeInTheDocument()
})
it('la temperatura elegida lleva una marca visible además del color', () => {
  montar()
  const elegida = screen.getByRole('radio', { name: '110 °C' }).closest('label')!
  expect(elegida).toHaveTextContent('● 110 °C')
  expect(elegida).toHaveClass('font-semibold')
  expect(screen.getByRole('radio', { name: '130 °C' }).closest('label')).not.toHaveTextContent('●')
})
it('el deslizador anuncia los minutos', () => {
  montar()
  const slider = screen.getByRole('slider', { name: /tiempo/i })
  fireEvent.change(slider, { target: { value: '15' } })
  expect(slider).toHaveAttribute('aria-valuetext', '15 min')
})
it('curva: modelo rotulado, punto medido y tiempo actual, también en texto', () => {
  montar()
  fireEvent.change(screen.getByRole('slider', { name: /tiempo/i }), { target: { value: '15' } })
  const curva = screen.getByRole('img', { name: /modelo de primer orden a 110 °C/ })
  expect(curva).toHaveAccessibleName(/constante medida \(Tabla 2\).*15 min y 19 %.*casi cero a los 30 min/)
  expect(curva).toHaveTextContent('modelo')
  expect(curva).toHaveTextContent('medido')
  expect(curva).toHaveTextContent('15 min')
  fireEvent.click(screen.getByRole('radio', { name: /145/ }))
  expect(screen.getByRole('img', { name: /a 145 °C \(constante estimada \(Arrhenius\)\)/ })).toHaveTextContent('modelo · constante estimada')
  fireEvent.click(screen.getByRole('radio', { name: /80/ }))
  const lenta = screen.getByRole('img', { name: /a 80 °C.*no se completó en 60 min/ })
  expect(lenta).not.toHaveTextContent('medido')
})
it('el simulador tiene su propio botón de pantalla completa', () => {
  const pedir = vi.fn(() => Promise.resolve())
  Object.defineProperty(Element.prototype, 'requestFullscreen', { value: pedir, configurable: true })
  const { container } = montar()
  fireEvent.click(screen.getByRole('button', { name: 'Pantalla completa' }))
  expect(pedir.mock.contexts[0]).toBe(container.querySelector('section'))
})
it('sin la API de pantalla completa no hay botón', () => {
  montar()
  expect(screen.queryByRole('button', { name: 'Pantalla completa' })).not.toBeInTheDocument()
})
it('80 °C no se completó en 60 min', () => {
  montar()
  fireEvent.click(screen.getByRole('radio', { name: /80/ }))
  expect(screen.getByText(/no se completó en 60 min/)).toBeInTheDocument()
})
it('tiempo 0 es 100 % en cualquier temperatura', () => {
  montar()
  fireEvent.click(screen.getByRole('radio', { name: /145/ }))
  expect(screen.getByText(/THCA que queda: 100 %/)).toBeInTheDocument()
})
it('condiciones, cifra de 110 °C y cita siempre visibles', () => {
  montar()
  expect(screen.getByText(/horno al vacío/i)).toBeInTheDocument()
  expect(screen.getByText(/cerca de 92 % se recuperó como THC/)).toBeInTheDocument()
  expect(screen.getByText(/28861498/)).toBeInTheDocument()
})
it('el visor pasa de THCA a THC bajo 50 %', () => {
  montar()
  expect(screen.getByText(/grupo ácido · sale CO₂/)).toBeInTheDocument()
  fireEvent.change(screen.getByRole('slider', { name: /tiempo/i }), { target: { value: '30' } })
  expect(screen.queryByText(/grupo ácido · sale CO₂/)).not.toBeInTheDocument()
})
it('en inglés usa punto decimal', () => {
  montar('en')
  fireEvent.change(screen.getByRole('slider', { name: /time/i }), { target: { value: '30' } })
  expect(screen.getByText(/3\.7%/)).toBeInTheDocument()
})
