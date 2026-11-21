import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import ListaFarmacias from '@/app/frasco/ListaFarmacias'
import { LanguageProvider } from '@/app/components/Language'
import { FUENTE_DIGEMID } from '@/lib/farmacias'

it('filtra la tabla, cuenta las filas y cita la fuente oficial', () => {
  render(<ListaFarmacias />)
  expect(screen.getByText('52 de 52')).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Busca por nombre, ciudad, distrito o RUC'), { target: { value: 'wanchaq' } })
  const filas = within(screen.getByRole('table')).getAllByRole('row').slice(1)
  expect(filas).toHaveLength(1)
  expect(filas[0]).toHaveTextContent('FARMACIA MAGISTRAL SOLIDARIDAD')
  expect(screen.getByText('1 de 52')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /lista actualizada al 16 de junio de 2026/ })).toHaveAttribute('href', FUENTE_DIGEMID.url)
})

it('en inglés traduce la interfaz y deja los datos oficiales como los publica DIGEMID', () => {
  render(<LanguageProvider locale="en"><ListaFarmacias /></LanguageProvider>)
  expect(screen.getByText('52 of 52')).toBeInTheDocument()
  expect(screen.getByLabelText('Search by name, city, district or RUC (tax ID)')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'DIGEMID, list updated June 16, 2026' })).toBeInTheDocument()
  expect(within(screen.getByRole('table')).getAllByText('ACTIVO').length).toBeGreaterThan(0)
})
