import { render, screen, fireEvent } from '@testing-library/react'
import { it, expect } from 'vitest'
import { LanguageProvider } from '@/app/components/Language'
import SimuladorCalor from '@/app/miembros/contenido/que-hay-en-la-planta/SimuladorCalor'

const montar = (locale: 'es' | 'en' = 'es') => render(<LanguageProvider locale={locale}><SimuladorCalor /></LanguageProvider>)

it('110 °C y 30 min: casi cero, medido', () => {
  montar()
  fireEvent.change(screen.getByRole('slider', { name: /tiempo/i }), { target: { value: '30' } })
  expect(screen.getByText(/THCA que queda: 3,7 %/)).toBeInTheDocument()
  expect(screen.getByText(/medido/i)).toBeInTheDocument()
  expect(screen.getByText(/casi cero a los 30 min/)).toBeInTheDocument()
})
it('130 °C se rotula estimado', () => {
  montar()
  fireEvent.click(screen.getByRole('radio', { name: /130/ }))
  expect(screen.getByText(/estimado/i)).toBeInTheDocument()
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
