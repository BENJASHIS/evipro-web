import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  user: { id: 'u1', email: 'paciente@example.test' } as { id: string; email: string } | null,
  member: true,
  logs: [] as Record<string, unknown>[],
  error: null as { message: string; code?: string } | null,
  written: null as Record<string, unknown> | null,
  reads: [] as { columns: string; filters: [string, string, unknown][]; limit?: number }[],
}))

vi.mock('@/lib/member-access', () => ({
  getMemberAccess: async () => ({ hasActiveMembership: state.member, adminPreview: false }),
  canUseMemberTools: (access: { hasActiveMembership: boolean }) => access.hasActiveMembership,
}))

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: state.user } }) } }),
  createServiceClient: () => ({
    from: () => {
      const query = { columns: '', filters: [] as [string, string, unknown][], limit: undefined as number | undefined }
      let mutation: 'insert' | 'update' | undefined
      let row: Record<string, unknown> | undefined
      const result = () => {
        if (state.error) return { data: null, error: state.error }
        const matches = (record: Record<string, unknown>) => query.filters.every(([op, key, value]) =>
          op === 'eq' ? record[key] === value : String(record[key]) <= String(value))
        if (mutation === 'insert') {
          if (state.logs.some(log => log.user_id === row?.user_id && log.log_date === row?.log_date)) {
            return { data: null, error: { code: '23505', message: 'duplicate' } }
          }
          const inserted = { id: 'new', created_at: '2026-08-28T02:00:00Z', ...row }
          state.logs.push(inserted)
          state.written = inserted
          return { data: inserted, error: null }
        }
        if (mutation === 'update') {
          const existing = state.logs.find(matches)
          if (!existing) return { data: null, error: null }
          Object.assign(existing, row)
          state.written = existing
          return { data: existing, error: null }
        }
        state.reads.push(query)
        const logs = state.logs.filter(matches).sort((a, b) => String(b.log_date).localeCompare(String(a.log_date)))
        return { data: logs.slice(0, query.limit), error: null }
      }
      const builder = {
        select: (columns: string) => { query.columns = columns; return builder },
        eq: (key: string, value: unknown) => { query.filters.push(['eq', key, value]); return builder },
        lte: (key: string, value: unknown) => { query.filters.push(['lte', key, value]); return builder },
        order: () => builder,
        limit: (limit: number) => { query.limit = limit; return builder },
        insert: (value: Record<string, unknown>) => { mutation = 'insert'; row = value; return builder },
        update: (value: Record<string, unknown>) => { mutation = 'update'; row = value; return builder },
        maybeSingle: async () => { const response = result(); return { ...response, data: Array.isArray(response.data) ? response.data[0] ?? null : response.data } },
        single: async () => result(),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve),
      }
      return builder
    },
  }),
}))

import { GET, POST } from '../../app/api/habits/route'

const validPayload = {
  log_date: '2026-08-27', sleep_hours: 6, sleep_quality: 3, sleepiness: 1, water_ml: 1200,
  alcohol_units: 0, medication_status: 'taken', meals_regular: true,
  symptoms: { pain: 0, anxiety: 1, nausea: 0, dizziness: 0, appetite: 0 },
  expected_updated_at: null,
}
const existing = {
  ...validPayload, id: 'h1', user_id: 'u1', version: 'test',
  created_at: '2026-08-27T00:00:00Z', updated_at: '2026-08-27T01:00:00Z',
}

function postRequest(body: unknown) {
  return new NextRequest('http://localhost/api/habits', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-08-28T02:00:00Z'))
  state.user = { id: 'u1', email: 'paciente@example.test' }
  state.member = true
  state.logs = []
  state.error = null
  state.written = null
  state.reads = []
})
afterEach(() => vi.useRealTimers())

describe('GET /api/habits', () => {
  it('devuelve un día fuera del historial sin exponer otros usuarios ni columnas privadas', async () => {
    state.logs = [existing, { ...existing, id: 'old', log_date: '2025-01-01' }, { ...existing, id: 'other', user_id: 'u2' }]
    const res = await GET(new NextRequest('http://localhost/api/habits?limit=1&date=2025-01-01'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.logs).toHaveLength(1)
    expect(body.log).toMatchObject({ id: 'old', log_date: '2025-01-01' })
    expect(body.logs[0]).not.toHaveProperty('user_id')
    expect(body.summary).toMatchObject({ daysLogged: 1, missingDays: 6, endDate: '2026-08-27' })
    expect(state.reads.every(read => read.columns !== '*' && read.filters.some(([, key, value]) => key === 'user_id' && value === 'u1'))).toBe(true)
    expect(state.reads.every(read => read.limit !== undefined && read.limit <= 30)).toBe(true)
  })

  it('el resumen sigue teniendo todos los días recientes aunque limit sea uno', async () => {
    state.logs = [existing, { ...existing, id: 'second', log_date: '2026-08-26' }]
    const res = await GET(new NextRequest('http://localhost/api/habits?limit=1'))
    const body = await res.json()
    expect(body.logs).toHaveLength(1)
    expect(body.summary.daysLogged).toBe(2)
  })

  it('preserva alcohol y síntomas desconocidos como null', async () => {
    state.logs = [{ ...existing, alcohol_units: null, symptoms: { pain: 0 } }]
    const res = await GET(new NextRequest('http://localhost/api/habits'))
    const body = await res.json()
    expect(body.log.alcohol_units).toBeNull()
    expect(body.log.symptoms).toMatchObject({ pain: 0, anxiety: null })
  })

  it('rechaza fechas inválidas antes de consultar', async () => {
    expect((await GET(new NextRequest('http://localhost/api/habits?date=2026-99-99'))).status).toBe(400)
    expect(state.reads).toHaveLength(0)
  })

  it('requiere sesión y membresía también en lecturas', async () => {
    state.user = null
    expect((await GET(new NextRequest('http://localhost/api/habits'))).status).toBe(401)
    state.user = { id: 'u1', email: 'paciente@example.test' }
    state.member = false
    expect((await GET(new NextRequest('http://localhost/api/habits'))).status).toBe(403)
    expect(state.reads).toHaveLength(0)
  })
})

describe('POST /api/habits', () => {
  it('crea un registro saneado para el usuario autenticado', async () => {
    const res = await POST(postRequest({ ...validPayload, user_id: 'otro', notes: 'texto libre' }))
    expect(res.status).toBe(200)
    expect(state.written).toMatchObject({ user_id: 'u1', log_date: '2026-08-27', medication_status: 'taken' })
    expect(state.written).not.toHaveProperty('notes')
    expect(state.written).not.toHaveProperty('expected_updated_at')
  })

  it('actualiza solo la versión que el usuario cargó', async () => {
    state.logs = [{ ...existing }]
    expect((await POST(postRequest({ ...validPayload, sleep_hours: 8, expected_updated_at: existing.updated_at }))).status).toBe(200)
    expect(state.written).toMatchObject({ id: 'h1', sleep_hours: 8, user_id: 'u1' })
    expect(state.written?.updated_at).not.toBe(existing.updated_at)
  })

  it.each([null, '2026-08-27T00:00:00Z'])('rechaza una creación duplicada o edición obsoleta (%s) sin reemplazar datos', async expected_updated_at => {
    state.logs = [{ ...existing }]
    const res = await POST(postRequest({ ...validPayload, sleep_hours: 1, expected_updated_at }))
    expect(res.status).toBe(409)
    expect(state.written).toBeNull()
    expect(state.logs[0].sleep_hours).toBe(6)
  })

  it('no permite editar la fila de otro usuario', async () => {
    state.logs = [{ ...existing, user_id: 'u2' }]
    expect((await POST(postRequest({ ...validPayload, expected_updated_at: existing.updated_at }))).status).toBe(409)
    expect(state.written).toBeNull()
  })

  it.each([{ sleep_hours: 25 }, { sleep_hours: 'texto' }, { expected_updated_at: undefined }, { expected_updated_at: 'ayer' }])('rechaza datos inválidos sin escribir: %j', async invalid => {
    expect((await POST(postRequest({ ...validPayload, ...invalid }))).status).toBe(400)
    expect(state.written).toBeNull()
  })

  it('rechaza sin sesión o sin membresía activa', async () => {
    state.user = null
    expect((await POST(postRequest(validPayload))).status).toBe(401)
    state.user = { id: 'u1', email: 'paciente@example.test' }
    state.member = false
    expect((await POST(postRequest(validPayload))).status).toBe(403)
  })

  it('ante fallo de base responde genérico', async () => {
    state.error = { message: 'relation "habit_logs" does not exist' }
    const res = await POST(postRequest(validPayload))
    expect(res.status).toBe(500)
    expect((await res.json()).error).not.toContain('relation')
  })
})
