import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PagoReserva from '../../app/medicos/[slug]/agendar/PagoReserva'

const pendiente = {
  estado: 'pending_payment', vencida: false, slot_date: '2026-11-03', slot_time: '09:00', modality: 'virtual',
  monto: 70, pago_hasta: '2099-11-01T21:00:00.000Z', medios: ['yape', 'plin'], whatsapp: '51942185939',
}
let info: Record<string, unknown>
let respuestaPost: { status: number; body: Record<string, unknown> }
const fetchFalso = vi.fn(async (url: string, init?: RequestInit) => {
  if (url.startsWith('/api/reservar/pago?')) return new Response(JSON.stringify(info), { status: 200 })
  if (url === '/api/reservar/pago') return new Response(JSON.stringify(respuestaPost.body), { status: respuestaPost.status })
  if (url === '/api/reservar/mercadopago') return new Response(JSON.stringify({ init_point: 'https://mp/checkout' }), { status: 200 })
  throw new Error(`fetch inesperado ${url} ${init?.method}`)
})

beforeEach(() => {
  info = { ...pendiente }
  respuestaPost = { status: 200, body: { ok: true } }
  fetchFalso.mockClear()
  vi.stubGlobal('fetch', fetchFalso)
})

const pagar = async (medio: RegExp, referencia: string) => {
  fireEvent.click(await screen.findByRole('radio', { name: medio }))
  fireEvent.change(screen.getByRole('textbox'), { target: { value: referencia } })
  fireEvent.click(screen.getByRole('button', { name: 'Ya pagué' }))
}

describe('PagoReserva', () => {
  it('pendiente: monto, QR de Yape y Plin con el id de la reserva, y la regla antes de pagar', async () => {
    render(<PagoReserva reservaId="r1" />)
    expect(await screen.findByText('S/ 70')).toBeTruthy()
    expect(screen.getByAltText('QR Yape').getAttribute('src')).toBe('/api/reservar/qr?reserva=r1&medio=yape')
    expect(screen.getByAltText('QR Plin').getAttribute('src')).toBe('/api/reservar/qr?reserva=r1&medio=plin')
    expect(screen.getByText(/Puedes cancelar o cambiar la fecha hasta 24 h antes/)).toBeTruthy()
    expect(screen.getByText('Al pagar aceptas esta regla.')).toBeTruthy()
  })

  it('"Ya pagué" manda medio y número, y luego ofrece "Avisar al doctor" con el texto del pago', async () => {
    render(<PagoReserva reservaId="r1" />)
    await pagar(/Yape/, '12345678')
    const aviso = await screen.findByRole('link', { name: 'Avisar al doctor' })
    expect(JSON.parse(String(fetchFalso.mock.calls.find(([u]) => u === '/api/reservar/pago')![1]!.body)))
      .toEqual({ reserva: 'r1', medio: 'yape', referencia: '12345678' })
    expect(aviso.getAttribute('href')).toBe(
      `https://wa.me/51942185939?text=${encodeURIComponent('Pagué mi reserva del 2026-11-03 09:00, Yape operación 12345678')}`)
  })

  it('con código: el aviso dice que reservó con su código de consulta gratis', async () => {
    render(<PagoReserva reservaId="r1" />)
    await pagar(/código de consulta gratis/, 'EVI-ABCD2345')
    const aviso = await screen.findByRole('link', { name: 'Avisar al doctor' })
    expect(aviso.getAttribute('href')).toBe(
      `https://wa.me/51942185939?text=${encodeURIComponent('Reservé el 2026-11-03 09:00 con mi código de consulta gratis EVI-ABCD2345')}`)
  })

  it('confirmada: "Tu cita está confirmada" y sin QR', async () => {
    info = { ...pendiente, estado: 'confirmed' }
    render(<PagoReserva reservaId="r1" />)
    expect(await screen.findByText('Tu cita está confirmada')).toBeTruthy()
    expect(screen.queryByAltText('QR Yape')).toBeNull()
  })

  it('si el turno venció al mandar el número, muestra el aviso de la respuesta', async () => {
    respuestaPost = { status: 410, body: { error: 'Tu turno venció. Si ya pagaste, escríbenos por WhatsApp con tu número de operación' } }
    render(<PagoReserva reservaId="r1" />)
    await pagar(/Plin/, '12345678')
    expect(await screen.findByText('Tu turno venció. Si ya pagaste, escríbenos por WhatsApp con tu número de operación')).toBeTruthy()
    const enlace = screen.getByRole('link', { name: 'Escribir al doctor' }).getAttribute('href')!
    expect(decodeURIComponent(enlace)).toContain('Plin operación 12345678, pero el turno venció.')
  })

  it('pagó con tarjeta y el turno ya no estaba: dice que recibimos su pago, no que se canceló', async () => {
    info = { ...pendiente, estado: 'cancelled', pagada: true }
    render(<PagoReserva reservaId="r1" />)
    expect(await screen.findByText(/Recibimos tu pago, pero ese turno ya no está disponible/)).toBeTruthy()
    expect(screen.queryByText(/fue cancelada/)).toBeNull()
  })

  it('"Pagar desde el extranjero (tarjeta)" lleva al checkout de Mercado Pago', async () => {
    const irA = vi.fn()
    render(<PagoReserva reservaId="r1" irA={irA} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Pagar desde el extranjero (tarjeta)' }))
    await waitFor(() => expect(irA).toHaveBeenCalledWith('https://mp/checkout'))
  })
})

describe('vuelta de Mercado Pago', () => {
  it('con collection_status=approved no muestra los QR y vuelve a consultar hasta ver la cita confirmada', async () => {
    window.history.pushState({}, '', '/medicos/dr-jara/agendar?reserva=r1&collection_status=approved')
    let consultas = 0
    fetchFalso.mockImplementation(async (url: string) => {
      if (url.startsWith('/api/reservar/pago?')) {
        consultas++
        return new Response(JSON.stringify(consultas < 3 ? pendiente : { ...pendiente, estado: 'confirmed' }), { status: 200 })
      }
      throw new Error(`fetch inesperado ${url}`)
    })
    render(<PagoReserva reservaId="r1" reintentoMs={5} />)
    expect(await screen.findByText('Recibimos tu pago con tarjeta. Estamos confirmando tu reserva…')).toBeTruthy()
    expect(screen.queryByAltText('QR Yape')).toBeNull()
    expect(await screen.findByText('Tu cita está confirmada')).toBeTruthy()
    window.history.pushState({}, '', '/')
  })
})
