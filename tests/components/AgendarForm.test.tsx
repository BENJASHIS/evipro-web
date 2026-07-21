import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AgendarForm from '../../app/medicos/[slug]/agendar/AgendarForm'
import type { Doctor } from '../../lib/doctors'

const doctor = {
  slug: 'dr-jara',
  name: 'Dr. Jara',
  cmp: '82817',
  whatsapp: '51999999999',
  counseling: {
    available: true,
    description: '',
    modalities: ['video', 'whatsapp'],
    schedule: ['09:00', '10:00'],
  },
} as unknown as Doctor

beforeEach(() => {
  // booked-slots (mount) y check-first (debounce) devuelven vacío/ok; book devuelve un id
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/book')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ booking_id: 'abc12345' }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ booked: [], is_first: true }) })
  }))
})

describe('AgendarForm', () => {
  it('muestra las 5 modalidades: consejería (Video, WhatsApp) + consulta (Presencial, Virtual, A domicilio)', () => {
    render(<AgendarForm doctor={doctor} />)
    expect(screen.getByText('Video (15–20 min)')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Presencial')).toBeInTheDocument()
    expect(screen.getByText('Virtual (teleconsulta)')).toBeInTheDocument()
    expect(screen.getByText('A domicilio')).toBeInTheDocument()
  })

  it('presencial muestra el paso de horario', () => {
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('Presencial'))
    expect(screen.getByText(/Horario/)).toBeInTheDocument()
  })

  it('A domicilio NO muestra horario y salta a los datos', () => {
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('A domicilio'))
    expect(screen.queryByText(/Horario/)).not.toBeInTheDocument()
    expect(screen.getByText(/Tus datos/)).toBeInTheDocument()
  })

  it('consulta (A domicilio) envía a /api/reservar/book', async () => {
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('A domicilio'))
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: '987654321' } })
    fireEvent.click(screen.getByText(/Solicitar/))
    await waitFor(() =>
      expect(vi.mocked(fetch).mock.calls.some(c => c[0] === '/api/reservar/book')).toBe(true),
    )
  })

  it('consejería (WhatsApp) envía a /api/consejeria/book', async () => {
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('WhatsApp'))
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: '987654321' } })
    fireEvent.click(screen.getByText(/Pagar/))
    await waitFor(() =>
      expect(vi.mocked(fetch).mock.calls.some(c => c[0] === '/api/consejeria/book')).toBe(true),
    )
  })

  it('consejería (WhatsApp) envía el payload de pago correcto (paid, mercadopago, price_soles)', async () => {
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('WhatsApp'))
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: '987654321' } })
    fireEvent.click(screen.getByText(/Pagar/))
    await waitFor(() => {
      const call = vi.mocked(fetch).mock.calls.find(c => c[0] === '/api/consejeria/book')
      expect(call).toBeTruthy()
      const body = JSON.parse((call![1] as RequestInit).body as string)
      expect(body.paid).toBe(true)
      expect(body.payment_method).toBe('mercadopago')
      expect(body.price_soles).toBe(5) // getPrice('whatsapp', false) = MP_MIN_CHARGE
    })
  })

  it('consejería con init_point redirige al checkout de Mercado Pago', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/book')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ booking_id: 'abc12345', init_point: 'https://mp.example/checkout/xyz' }) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ booked: [], is_first: true }) })
    }))
    const loc = { href: '' }
    Object.defineProperty(window, 'location', { value: loc, writable: true, configurable: true })
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('WhatsApp'))
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: '987654321' } })
    fireEvent.click(screen.getByText(/Pagar/))
    await waitFor(() => expect(loc.href).toBe('https://mp.example/checkout/xyz'))
  })
})
