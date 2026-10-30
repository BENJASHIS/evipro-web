import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const estado = vi.hoisted(() => ({ insertado: null as Record<string, unknown> | null }))

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
  createServiceClient: () => ({
    from: () => ({
      insert: (fila: Record<string, unknown>) => {
        estado.insertado = fila
        return { select: () => ({ single: async () => ({ data: { id: 'b1' }, error: null }) }) }
      },
    }),
  }),
}))
vi.mock('@/lib/turnstile', () => ({ readTurnstileToken: () => 't', verifyTurnstileToken: async () => ({ ok: true }) }))
vi.mock('@/lib/mercadopago', () => ({ createMPPreference: vi.fn(), describeMPError: vi.fn() }))
vi.mock('@/lib/google-calendar', () => ({ ocupadosEnGoogle: vi.fn(), crearEventoTentativo: vi.fn() }))

import { POST } from '../../app/api/reservar/book/route'
import { POST as POSTConsejeria } from '../../app/api/consejeria/book/route'
import { ocupadosEnGoogle, crearEventoTentativo } from '@/lib/google-calendar'

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

  it('guarda y crea el evento tentativo con los datos de la reserva', async () => {
    expect((await POST(pedir(cuerpoValido))).status).toBe(200)
    expect(ocupados).toHaveBeenCalledWith('dr-jara', ['2026-11-03'], ['09:00'])
    expect(crear).toHaveBeenCalledWith({
      id: 'b1', doctor_slug: 'dr-jara', patient_name: 'Ana Prueba',
      modality: 'virtual', slot_date: '2026-11-03', slot_time: '09:00',
    })
  })

  it('si crear el evento falla, la reserva igual responde 200', async () => {
    crear.mockRejectedValue(new Error('x'))
    expect((await POST(pedir(cuerpoValido))).status).toBe(200)
  })

  it('a domicilio sin horario no consulta Google', async () => {
    const r = await POST(pedir({ ...cuerpoValido, modality: 'domicilio', slot_date: null, slot_time: null }))
    expect(r.status).toBe(200)
    expect(ocupados).not.toHaveBeenCalled()
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
