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
  it('no deja reservar sin autorizar el uso de los datos y envía el consentimiento', async () => {
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('A domicilio'))
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: '987654321' } })
    const casilla = screen.getByRole('checkbox', { name: /autorizo a evipro/i })
    expect(casilla).not.toBeChecked()
    expect(screen.getByRole('link', { name: 'Términos y Condiciones' })).toHaveAttribute('href', '/terminos')
    expect(screen.getByRole('button', { name: /solicitar/i })).toBeDisabled()
    fireEvent.click(casilla)
    fireEvent.click(screen.getByRole('button', { name: /solicitar/i }))
    await waitFor(() => {
      const llamada = vi.mocked(fetch).mock.calls.find(([url]) => String(url).includes('/api/reservar/book'))
      expect(JSON.parse(String(llamada?.[1]?.body)).consent).toBe(true)
    })
  })

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
    fireEvent.click(screen.getByRole('checkbox', { name: /autorizo a evipro/i }))
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
    fireEvent.click(screen.getByRole('checkbox', { name: /autorizo a evipro/i }))
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
    fireEvent.click(screen.getByRole('checkbox', { name: /autorizo a evipro/i }))
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
    fireEvent.click(screen.getByRole('checkbox', { name: /autorizo a evipro/i }))
    fireEvent.click(screen.getByText(/Pagar/))
    await waitFor(() => expect(loc.href).toBe('https://mp.example/checkout/xyz'))
  })
})

describe('AgendarForm — precios en el paso 1', () => {
  it('cada modalidad muestra UN precio, no la escalera entera', () => {
    render(<AgendarForm doctor={doctor} />)
    // La línea larga («1ª S/100 · reconsulta S/50 · desde 3ª S/25») se salía de
    // la pantalla en el móvil: ahora vive plegada, no en la tarjeta.
    expect(screen.getByText('S/. 100')).toBeInTheDocument()
    expect(screen.getByText('S/. 80')).toBeInTheDocument()
    expect(screen.getByText(/desde S\/\. 150/)).toBeInTheDocument()
    expect(screen.getByText(/Cómo baja el precio/)).toBeInTheDocument()
  })
})

describe('AgendarForm — enlace de convenio', () => {
  it('?convenio=ascamed muestra el precio del aliado y lo manda al servidor', async () => {
    Object.defineProperty(window, 'location', { value: { search: '?convenio=ascamed' }, writable: true, configurable: true })
    render(<AgendarForm doctor={doctor} />)
    expect(await screen.findByText(/Precio por convenio con ASCAMED/)).toBeInTheDocument()
    expect(screen.getByText('S/. 40')).toBeInTheDocument()
    expect(screen.getByText('S/. 100')).toBeInTheDocument()
    fireEvent.click(screen.getByText('A domicilio'))
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: '987654321' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /autorizo a evipro/i }))
    fireEvent.click(screen.getByText(/Solicitar/))
    await waitFor(() => {
      const call = vi.mocked(fetch).mock.calls.find(c => c[0] === '/api/reservar/book')
      expect(JSON.parse((call?.[1] as RequestInit).body as string).convenio).toBe('ascamed')
    })
  })
})

it('al reservar con pago, la dirección guarda el enlace para volver a los QR', async () => {
  // Otra prueba deja window.location como un objeto falso: aquí se fija una dirección completa.
  Object.defineProperty(window, 'location', {
    value: new URL('https://www.evipro.pe/medicos/dr-jara/agendar'), writable: true, configurable: true,
  })
  const guardar = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/api/reservar/book')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ booking_id: 'r-123', pago: true }) })
    }
    if (url.includes('/api/reservar/pago')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({
        estado: 'pending_payment', vencida: false, slot_date: '2099-11-03', slot_time: '09:00', modality: 'domicilio',
        monto: 70, pago_hasta: '2099-11-01T21:00:00.000Z', medios: ['yape'], paypal: null, whatsapp: '51942185939',
      }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ booked: [], is_first: true }) })
  }))
  render(<AgendarForm doctor={{ ...doctor, pagoAlReservar: { qr: { yape: '/qr.png' } } } as unknown as Doctor} />)
  fireEvent.click(screen.getByText('A domicilio'))
  fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana' } })
  fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: '987654321' } })
  fireEvent.click(screen.getByRole('checkbox', { name: /autorizo a evipro/i }))
  fireEvent.click(screen.getByRole('button', { name: /solicitar|pagar/i }))
  await waitFor(() => expect(String(guardar.mock.calls.at(-1)?.[2])).toBe(
    'https://www.evipro.pe/medicos/dr-jara/agendar?reserva=r-123'))
  // Espera la pantalla de pago: sin esto la prueba terminaba antes de que llegara la respuesta.
  expect(await screen.findByText('Paga escaneando el código:')).toBeTruthy()
  guardar.mockRestore()
})

