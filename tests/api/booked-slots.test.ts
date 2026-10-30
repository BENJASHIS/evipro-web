import { describe, it, expect, beforeEach, vi } from 'vitest'

const estado = vi.hoisted(() => ({
  filas: [] as { slot_date: string; slot_time: string }[],
  llamadas: [] as [string, unknown[]][],
}))

vi.mock('@/lib/supabase-server', () => ({
  createServiceClient: () => {
    const q: Record<string, unknown> = {}
    for (const m of ['select', 'eq', 'gte', 'not', 'is']) {
      q[m] = (...a: unknown[]) => { estado.llamadas.push([m, a]); return q }
    }
    q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: estado.filas, error: null }).then(ok)
    return { from: () => q }
  },
}))

vi.mock('@/lib/google-calendar', async importActual => ({
  ...(await importActual<typeof import('@/lib/google-calendar')>()),
  ocupadosEnGoogle: vi.fn(),
}))

import { GET } from '../../app/api/consejeria/booked-slots/route'
import { ocupadosEnGoogle, hoyEnLima } from '@/lib/google-calendar'

const ocupados = vi.mocked(ocupadosEnGoogle)
const pedir = (slug: string) => new Request(`http://localhost/api/consejeria/booked-slots?doctor_slug=${slug}`)

beforeEach(() => {
  estado.filas = []
  estado.llamadas = []
  ocupados.mockReset().mockResolvedValue([])
})

describe('GET /api/consejeria/booked-slots', () => {
  it('junta lo reservado en la web con lo ocupado en Google, sin duplicados', async () => {
    estado.filas = [{ slot_date: '2026-11-03', slot_time: '09:00' }]
    ocupados.mockResolvedValue(['2026-11-03T09:00', '2026-11-04T15:00'])
    const { booked } = await (await GET(pedir('dr-jara'))).json()
    expect(booked.sort()).toEqual(['2026-11-03T09:00', '2026-11-04T15:00'])
  })

  it('pide a Google 21 días desde hoy en Lima, con el horario del médico', async () => {
    await GET(pedir('dr-jara'))
    const [slug, fechas, horario] = ocupados.mock.calls[0]
    expect(slug).toBe('dr-jara')
    expect(fechas).toHaveLength(21)
    expect(fechas[0]).toBe(hoyEnLima())
    expect(horario).toEqual(['09:00', '10:00', '11:00', '15:00', '16:00'])
  })

  it('las reservas canceladas no ocupan el turno', async () => {
    await GET(pedir('dr-jara'))
    expect(estado.llamadas).toContainEqual(['is', ['cancelled_at', null]])
  })

  it('slug inexistente → 400', async () => {
    expect((await GET(pedir('nadie'))).status).toBe(400)
    expect(ocupados).not.toHaveBeenCalled()
  })
})
