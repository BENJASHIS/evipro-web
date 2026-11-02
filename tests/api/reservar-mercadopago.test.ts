import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const ID = '3f2b8c1e-0a4d-4e8f-9b7a-1c2d3e4f5a6b'
const filaBase = {
  id: ID, doctor_slug: 'dr-jara', patient_name: 'Ana Prueba', modality: 'virtual',
  slot_date: '2099-11-03', slot_time: '09:00:00', price_soles: 70, paid: false, payment_method: 'manual',
  confirmed_at: null as string | null, cancelled_at: null, cancel_reason: null,
  pago_hasta: '2099-11-01T21:00:00.000Z', payment_reported_at: null, mp_payment_id: null as string | null,
}
const estado = vi.hoisted(() => ({ fila: null as Record<string, unknown> | null }))

vi.mock('@/lib/supabase-server', () => ({
  createServiceClient: () => ({
    from: () => {
      const q: Record<string, unknown> = {}
      for (const m of ['select', 'eq', 'is', 'lt', 'update']) q[m] = () => q
      q.maybeSingle = async () => ({ data: estado.fila, error: null })
      q.single = async () => ({ data: null, error: null })
      q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(ok)
      return q
    },
  }),
}))
vi.mock('@/lib/mercadopago', () => ({
  createMPPreference: vi.fn(), describeMPError: () => 'x', verifyMPWebhook: vi.fn(), getMPPayment: vi.fn(),
}))
vi.mock('@/lib/pago-reserva', async importActual => ({
  ...(await importActual<typeof import('@/lib/pago-reserva')>()),
  confirmarPago: vi.fn(),
}))
vi.mock('@/lib/google-calendar', () => ({ confirmarEvento: vi.fn() }))

import { POST } from '../../app/api/reservar/mercadopago/route'
import { POST as webhook } from '../../app/api/webhooks/mercadopago/route'
import { createMPPreference, verifyMPWebhook, getMPPayment } from '@/lib/mercadopago'
import { confirmarPago } from '@/lib/pago-reserva'

const pedir = (body: unknown) => new NextRequest('http://localhost/api/reservar/mercadopago', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})
const aviso = () => new NextRequest('http://localhost/api/webhooks/mercadopago', {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-signature': 's', 'x-request-id': 'r' },
  body: JSON.stringify({ type: 'payment', data: { id: 'mp1' } }),
})

beforeEach(() => {
  estado.fila = { ...filaBase }
  process.env.MP_WEBHOOK_SECRET = 'secreto'
  process.env.NEXT_PUBLIC_SITE_URL = 'https://www.evipro.pe'
  vi.mocked(createMPPreference).mockReset().mockResolvedValue({ id: 'pref1', init_point: 'https://mp/checkout' } as never)
  vi.mocked(verifyMPWebhook).mockReset().mockResolvedValue(true)
  vi.mocked(getMPPayment).mockReset().mockResolvedValue({ id: 'mp1', status: 'approved', external_reference: `reserva:${ID}`, transaction_amount: 70 } as never)
  vi.mocked(confirmarPago).mockReset().mockResolvedValue({ ok: true, sinTurno: false })
})

describe('POST /api/reservar/mercadopago', () => {
  it('crea la preferencia por el monto de la reserva y vuelve a la pantalla de pago', async () => {
    const r = await POST(pedir({ reserva: ID }))
    expect(await r.json()).toEqual({ init_point: 'https://mp/checkout' })
    const vuelta = `https://www.evipro.pe/medicos/dr-jara/agendar?reserva=${ID}`
    expect(createMPPreference).toHaveBeenCalledWith(expect.objectContaining({
      items: [{ title: 'EVIPro · Consulta Virtual (teleconsulta)', unit_price: 70, quantity: 1 }],
      external_reference: `reserva:${ID}`,
      back_urls: { success: vuelta, failure: vuelta, pending: vuelta },
    }))
  })

  it('reserva que no está pendiente de pago → 409', async () => {
    estado.fila = { ...filaBase, confirmed_at: '2099-11-01T20:30:00Z' }
    expect((await POST(pedir({ reserva: ID }))).status).toBe(409)
    expect(createMPPreference).not.toHaveBeenCalled()
  })
})

describe('webhook de Mercado Pago con reservas', () => {
  it('pago aprobado → confirmarPago con medio mercadopago, monto y id del pago', async () => {
    expect((await webhook(aviso())).status).toBe(200)
    expect(confirmarPago).toHaveBeenCalledWith(expect.anything(), ID, { medio: 'mercadopago', monto: 70, mpPaymentId: 'mp1' })
  })

  it('aviso repetido con el mismo mp_payment_id → no confirma de nuevo', async () => {
    estado.fila = { ...filaBase, mp_payment_id: 'mp1' }
    await webhook(aviso())
    expect(confirmarPago).not.toHaveBeenCalled()
  })

  it('firma inválida → 401', async () => {
    vi.mocked(verifyMPWebhook).mockResolvedValue(false)
    expect((await webhook(aviso())).status).toBe(401)
    expect(confirmarPago).not.toHaveBeenCalled()
  })
})
