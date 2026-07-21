import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReservaForm from '../../app/reservar/ReservaForm'

const doctors = [
  { slug: 'dr-jara', name: 'Dr. Jara', whatsapp: '51999999999', schedule: ['09:00', '10:00'] },
]

beforeEach(() => {
  // ponytail: booked-slots se llama al elegir médico; devolvemos vacío.
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ booked: [] }) }),
  ))
})

describe('ReservaForm', () => {
  it('al elegir presencial muestra la escalera de esa modalidad', () => {
    render(<ReservaForm doctors={doctors} />)
    fireEvent.click(screen.getByText('Dr. Jara'))
    fireEvent.click(screen.getByText('Presencial'))
    expect(screen.getByText(/1ª S\/100 · reconsulta S\/50 · desde 3ª S\/25/)).toBeInTheDocument()
  })

  it('domicilio muestra el precio plano sin escalera', () => {
    render(<ReservaForm doctors={doctors} />)
    fireEvent.click(screen.getByText('Dr. Jara'))
    fireEvent.click(screen.getByText('A domicilio'))
    expect(screen.getByText(/Desde S\/150 \(sin escalera\)/)).toBeInTheDocument()
  })
})
