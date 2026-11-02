import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const ID = '3f2b8c1e-0a4d-4e8f-9b7a-1c2d3e4f5a6b'
const filaBase = {
  id: ID, doctor_slug: 'dr-jara', patient_name: 'Ana Prueba', patient_phone: '999888777', modality: 'virtual',
  slot_date: '2099-11-03', slot_time: '09:00:00', price_soles: 70, paid: false, payment_method: 'manual',
  confirmed_at: null as string | null, cancelled_at: null as string | null, cancel_reason: null as string | null,
  pago_hasta: '2099-11-01T21:00:00.000Z' as string | null, payment_reported_at: null as string | null,
}
const estado = vi.hoisted(() => ({
  fila: null as Record<string, unknown> | null,
  updates: [] as Record<string, unknown>[],
  errorUpdate: null as { code?: string; message: string } | null,
  qr: true,
}))

vi.mock('@/lib/supabase-server', () => ({
  createServiceClient: () => ({
    from: () => {
      const q: Record<string, unknown> = {}
      let esUpdate = false
      for (const m of ['select', 'eq', 'is', 'lt']) q[m] = () => q
      q.update = (cambios: Record<string, unknown>) => { esUpdate = true; estado.updates.push(cambios); return q }
      q.maybeSingle = async () => ({ data: estado.fila, error: null })
      q.then = (ok: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: esUpdate && estado.updates.length > 1 ? estado.errorUpdate : null }).then(ok)
      return q
    },
    storage: {
      from: () => ({
        download: async () => estado.qr
          ? { data: new Blob(['png'], { type: 'image/png' }), error: null }
          : { data: null, error: { message: 'not found' } },
      }),
    },
  }),
}))
vi.mock('@/lib/google-calendar', () => ({ crearEventoTentativo: vi.fn() }))

import { GET, POST } from '../../app/api/reservar/pago/route'
import { GET as GETqr } from '../../app/api/reservar/qr/route'
import { crearEventoTentativo } from '@/lib/google-calendar'

const crear = vi.mocked(crearEventoTentativo)
const post = (body: unknown) => new NextRequest('http://localhost/api/reservar/pago', {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.0.0.${Math.floor(Math.random() * 250)}` },
  body: JSON.stringify(body),
})
const get = (q: string) => new NextRequest(`http://localhost/api/reservar/pago?${q}`)
const qr = (q: string) => new NextRequest(`http://localhost/api/reservar/qr?${q}`)
// El primer update de cada pedido es el de liberarVencidas; el del reporte es el último.
const reporte = () => estado.updates[estado.updates.length - 1]

beforeEach(() => {
  estado.fila = { ...filaBase }
  estado.updates = []
  estado.errorUpdate = null
  estado.qr = true
  crear.mockReset().mockResolvedValue(undefined)
})

describe('POST /api/reservar/pago', () => {
  it('guarda medio, número y payment_reported_at, y crea el evento tentativo', async () => {
    const r = await POST(post({ reserva: ID, medio: 'yape', referencia: '1234 5678' }))
    expect(r.status).toBe(200)
    expect(reporte()).toMatchObject({ payment_method: 'yape', payment_reference: '12345678' })
    expect(reporte().payment_reported_at).toEqual(expect.any(String))
    expect(crear).toHaveBeenCalledWith({
      id: ID, doctor_slug: 'dr-jara', patient_name: 'Ana Prueba', modality: 'virtual', slot_date: '2099-11-03', slot_time: '09:00:00',
    })
  })

  it('código de crédito se guarda con payment_method free y monto 0', async () => {
    await POST(post({ reserva: ID, medio: 'codigo', referencia: 'evi-abcd2345' }))
    expect(reporte()).toMatchObject({ payment_method: 'free', payment_reference: 'EVI-ABCD2345', price_soles: 0 })
  })

  it('número o código inválido → 400', async () => {
    let r = await POST(post({ reserva: ID, medio: 'yape', referencia: 'abc' }))
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('Número de operación inválido')
    r = await POST(post({ reserva: ID, medio: 'codigo', referencia: 'EVI-1' }))
    expect((await r.json()).error).toBe('Código inválido')
  })

  it('número repetido (23505) → 409', async () => {
    estado.errorUpdate = { code: '23505', message: 'counseling_bookings_payment_reference_unique' }
    const r = await POST(post({ reserva: ID, medio: 'plin', referencia: '12345678' }))
    expect(r.status).toBe(409)
    expect((await r.json()).error).toBe('Ese número de operación ya se usó en otra reserva')
  })

  it('reserva vencida → 410 con el aviso de WhatsApp', async () => {
    estado.fila = { ...filaBase, cancelled_at: '2099-11-01T21:00:01Z', cancel_reason: 'sin pago en 1 hora' }
    const r = await POST(post({ reserva: ID, medio: 'yape', referencia: '12345678' }))
    expect(r.status).toBe(410)
    expect((await r.json()).error).toBe('Tu turno venció. Si ya pagaste, escríbenos por WhatsApp con tu número de operación')
    expect(crear).not.toHaveBeenCalled()
  })

  it('reserva ya confirmada o por verificar → 409', async () => {
    estado.fila = { ...filaBase, payment_reported_at: '2099-11-01T20:10:00Z' }
    const r = await POST(post({ reserva: ID, medio: 'yape', referencia: '12345678' }))
    expect(r.status).toBe(409)
    expect((await r.json()).error).toBe('La reserva ya no está pendiente de pago')
  })

  it('id que no es UUID → 400', async () => {
    expect((await POST(post({ reserva: 'x', medio: 'yape', referencia: '12345678' }))).status).toBe(400)
  })
})

describe('GET /api/reservar/pago', () => {
  it('devuelve lo necesario para la pantalla de pago, sin nombre ni teléfono', async () => {
    const r = await GET(get(`reserva=${ID}`))
    const cuerpo = await r.json()
    expect(cuerpo).toMatchObject({
      estado: 'pending_payment', slot_date: '2099-11-03', slot_time: '09:00', modality: 'virtual',
      monto: 70, pago_hasta: '2099-11-01T21:00:00.000Z', medios: ['yape', 'plin'], whatsapp: '51942185939',
    })
    expect(JSON.stringify(cuerpo)).not.toContain('Ana Prueba')
    expect(JSON.stringify(cuerpo)).not.toContain('999888777')
  })

  it('reserva de un médico sin pago al reservar → 404', async () => {
    estado.fila = { ...filaBase, doctor_slug: 'dr-vera' }
    expect((await GET(get(`reserva=${ID}`))).status).toBe(404)
  })
})

describe('GET /api/reservar/qr', () => {
  it('pendiente o por verificar: 200 con no-store y noindex', async () => {
    let r = await GETqr(qr(`reserva=${ID}&medio=yape`))
    expect(r.status).toBe(200)
    expect(r.headers.get('Cache-Control')).toBe('private, no-store')
    expect(r.headers.get('X-Robots-Tag')).toBe('noindex')
    estado.fila = { ...filaBase, payment_reported_at: '2099-11-01T20:10:00Z' }
    r = await GETqr(qr(`reserva=${ID}&medio=plin`))
    expect(r.status).toBe(200)
  })

  it('confirmada, cancelada o medio desconocido → 404', async () => {
    estado.fila = { ...filaBase, confirmed_at: '2099-11-01T20:30:00Z' }
    expect((await GETqr(qr(`reserva=${ID}&medio=yape`))).status).toBe(404)
    estado.fila = { ...filaBase, cancelled_at: 'x', cancel_reason: 'sin pago en 1 hora' }
    expect((await GETqr(qr(`reserva=${ID}&medio=yape`))).status).toBe(404)
    estado.fila = { ...filaBase }
    expect((await GETqr(qr(`reserva=${ID}&medio=bim`))).status).toBe(404)
  })
})
