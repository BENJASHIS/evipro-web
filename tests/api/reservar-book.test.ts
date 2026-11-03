import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const estado = vi.hoisted(() => ({
  insertado: null as Record<string, unknown> | null,
  usuario: null as { id: string } | null,
  plan: null as string | null,
  orden: [] as string[],
}))

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: estado.usuario } }) } }),
  createServiceClient: () => ({
    from: (tabla: string) => {
      if (tabla === 'subscriptions') {
        const q: Record<string, unknown> = {}
        for (const m of ['select', 'eq', 'order', 'limit']) q[m] = () => q
        q.maybeSingle = async () => ({ data: estado.plan ? { membership_plans: { type: estado.plan } } : null, error: null })
        return q
      }
      return {
        insert: (fila: Record<string, unknown>) => {
          estado.orden.push('insert')
          estado.insertado = fila
          return { select: () => ({ single: async () => ({ data: { id: 'b1' }, error: null }) }) }
        },
      }
    },
  }),
}))
vi.mock('@/lib/pago-reserva', () => ({ liberarVencidas: vi.fn(async () => { estado.orden.push('liberar') }) }))
vi.mock('@/lib/turnstile', () => ({ readTurnstileToken: () => 't', verifyTurnstileToken: async () => ({ ok: true }) }))
vi.mock('@/lib/mercadopago', () => ({ createMPPreference: vi.fn(), describeMPError: vi.fn() }))
vi.mock('@/lib/google-calendar', () => ({ ocupadosEnGoogle: vi.fn(), crearEventoTentativo: vi.fn() }))

import { POST } from '../../app/api/reservar/book/route'
import { POST as POSTConsejeria } from '../../app/api/consejeria/book/route'
import { ocupadosEnGoogle, crearEventoTentativo } from '@/lib/google-calendar'
import { liberarVencidas } from '@/lib/pago-reserva'

const ocupados = vi.mocked(ocupadosEnGoogle)
const crear = vi.mocked(crearEventoTentativo)

// El 2026-11-03 es martes.
const cuerpoValido = {
  doctor_slug: 'dr-jara', modality: 'virtual', slot_date: '2026-11-03', slot_time: '09:00',
  patient_name: 'Ana Prueba', patient_phone: '999888777', turnstile_token: 't',
}
const pedir = (body: unknown, ruta = 'reservar') => new NextRequest(`http://localhost/api/${ruta}/book`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

beforeEach(() => {
  estado.insertado = null
  estado.usuario = null
  estado.plan = null
  estado.orden = []
  vi.mocked(liberarVencidas).mockClear()
  ocupados.mockReset().mockResolvedValue([])
  crear.mockReset().mockResolvedValue(undefined)
})

describe('POST /api/reservar/book con Google Calendar', () => {
  it('si el turno se ocupó en Google después de cargar la página → 409 y no guarda', async () => {
    ocupados.mockResolvedValue(['2026-11-03T09:00'])
    const r = await POST(pedir(cuerpoValido))
    expect(r.status).toBe(409)
    expect((await r.json()).error).toBe('Ese horario ya fue reservado. Elige otro.')
    expect(estado.insertado).toBeNull()
    expect(crear).not.toHaveBeenCalled()
  })

  it('guarda sin crear el evento: se crea al reportar el pago o al confirmar', async () => {
    expect((await POST(pedir(cuerpoValido))).status).toBe(200)
    expect(ocupados).toHaveBeenCalledWith('dr-jara', ['2026-11-03'], ['09:00'])
    expect(crear).not.toHaveBeenCalled()
  })

  it('a domicilio sin horario no consulta Google', async () => {
    const r = await POST(pedir({ ...cuerpoValido, modality: 'domicilio', slot_date: null, slot_time: null }))
    expect(r.status).toBe(200)
    expect(ocupados).not.toHaveBeenCalled()
  })
})

describe('POST /api/reservar/book con pago al reservar', () => {
  afterEach(() => { vi.useRealTimers() })

  it('dr-jara virtual: guarda pago_hasta a 1 h, versión de la regla y precio de la visita', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-01T20:00:00Z'))
    const r = await POST(pedir({ ...cuerpoValido, visit_number: 2 }))
    const pago_hasta = '2026-11-01T21:00:00.000Z'
    expect(estado.insertado).toMatchObject({ price_soles: 35, visit_number: 2, pago_hasta, policy_version: '2026-11-01' })
    expect(await r.json()).toEqual({ booking_id: 'b1', pago: { monto: 35, pago_hasta } })
  })

  it('miembro con plan cannabis activo paga su tarifa', async () => {
    estado.usuario = { id: 'u1' }
    estado.plan = 'cannabis'
    await POST(pedir(cuerpoValido))
    expect(estado.insertado).toMatchObject({ price_soles: 40, user_id: 'u1' })
  })

  it('convenio ASCAMED: el servidor cobra 40 en la 1ª virtual', async () => {
    // IP propia: el límite de 8 por IP lo comparten las demás pruebas del archivo.
    await POST(new NextRequest('http://localhost/api/reservar/book', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-real-ip': '10.0.0.40' },
      body: JSON.stringify({ ...cuerpoValido, convenio: 'ascamed' }),
    }))
    expect(estado.insertado).toMatchObject({ price_soles: 40 })
  })

  it('visit_number fuera de 1..3 → 400', async () => {
    const r = await POST(pedir({ ...cuerpoValido, visit_number: 4 }))
    expect(r.status).toBe(400)
    expect(estado.insertado).toBeNull()
  })

  it('libera las vencidas de ese médico antes de insertar', async () => {
    await POST(pedir(cuerpoValido))
    expect(liberarVencidas).toHaveBeenCalledWith(expect.anything(), 'dr-jara')
    expect(estado.orden).toEqual(['liberar', 'insert'])
  })

  it('dr-vera y domicilio no llevan pago_hasta', async () => {
    await POST(pedir({ ...cuerpoValido, doctor_slug: 'dr-vera' }))
    expect(estado.insertado).toMatchObject({ doctor_slug: 'dr-vera', price_soles: 70 })
    expect(estado.insertado?.pago_hasta).toBeUndefined()
    await POST(pedir({ ...cuerpoValido, modality: 'domicilio', slot_date: null, slot_time: null }))
    expect(estado.insertado?.pago_hasta).toBeUndefined()
    expect(liberarVencidas).not.toHaveBeenCalled()
  })
})

describe('POST /api/consejeria/book', () => {
  it('consejería retirada (counseling.available=false) → 400 sin guardar', async () => {
    const r = await POSTConsejeria(pedir({ ...cuerpoValido, modality: 'video', is_first_session: true }, 'consejeria'))
    expect(r.status).toBe(400)
    expect((await r.json()).error).toBe('Canal no disponible')
    expect(estado.insertado).toBeNull()
  })
})
