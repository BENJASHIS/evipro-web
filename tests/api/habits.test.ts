import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  user: { id: 'u1', email: 'paciente@evipro.pe' } as { id: string; email: string } | null,
  member: true,
  logs: [] as Record<string, unknown>[],
  selectError: null as { message: string } | null,
  upsertError: null as { message: string } | null,
  upserted: null as Record<string, unknown> | null,
}))

vi.mock('@/lib/member-access', () => ({
  getMemberAccess: async () => ({
    user: state.user,
    isAdmin: false,
    hasActiveMembership: state.member,
    adminPreview: false,
    subscriptionId: state.member ? 's1' : null,
    planType: state.member ? 'integral' : null,
  }),
  canUseMemberTools: (access: { hasActiveMembership: boolean; adminPreview: boolean }) =>
    access.hasActiveMembership || access.adminPreview,
}))

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: async () => ({ data: { user: state.user } }) },
  }),
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: async () => ({ data: state.logs, error: state.selectError }),
          }),
        }),
      }),
      upsert: (row: Record<string, unknown>) => {
        state.upserted = row
        return {
          select: () => ({
            single: async () => ({
              data: state.upsertError ? null : {
                id: 'h1',
                created_at: '2026-08-27T00:00:00Z',
                updated_at: '2026-08-27T00:00:00Z',
                ...row,
              },
              error: state.upsertError,
            }),
          }),
        }
      },
    }),
  }),
}))

import { GET, POST } from '../../app/api/habits/route'

const validPayload = {
  log_date: '2026-08-27',
  sleep_hours: 6,
  sleep_quality: 3,
  sleepiness: 1,
  water_ml: 1200,
  alcohol_units: 0,
  medication_status: 'taken',
  meals_regular: true,
  symptoms: { pain: 0, anxiety: 1, nausea: 0, dizziness: 0, appetite: 0 },
}

function postRequest(body: unknown) {
  return new NextRequest('http://localhost/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  state.user = { id: 'u1', email: 'paciente@evipro.pe' }
  state.member = true
  state.logs = []
  state.selectError = null
  state.upsertError = null
  state.upserted = null
})

describe('GET /api/habits', () => {
  it('devuelve registros y resumen del miembro', async () => {
    state.logs = [{
      id: 'h1',
      user_id: 'u1',
      version: 'test',
      log_date: '2026-08-27',
      sleep_hours: 6,
      sleep_quality: 3,
      sleepiness: 1,
      water_ml: 1000,
      alcohol_units: 0,
      medication_status: 'taken',
      meals_regular: true,
      symptoms: { pain: 0, anxiety: 0, nausea: 0, dizziness: 0, appetite: 0 },
      created_at: '2026-08-27T00:00:00Z',
      updated_at: '2026-08-27T00:00:00Z',
    }]

    const res = await GET(new NextRequest('http://localhost/api/habits?limit=5'))
    expect(res.status).toBe(200)
    const body = await res.json() as { logs: unknown[]; summary: { daysLogged: number } }
    expect(body.logs).toHaveLength(1)
    expect(body.summary.daysLogged).toBe(1)
  })
})

describe('POST /api/habits', () => {
  it('guarda un registro saneado para el usuario autenticado', async () => {
    const res = await POST(postRequest({ ...validPayload, user_id: 'otro', notes: 'texto libre' }))
    expect(res.status).toBe(200)
    expect(state.upserted).toMatchObject({
      user_id: 'u1',
      log_date: '2026-08-27',
      medication_status: 'taken',
    })
    expect(state.upserted).not.toHaveProperty('notes')
  })

  it('rechaza sin sesión o sin membresía activa', async () => {
    state.user = null
    expect((await POST(postRequest(validPayload))).status).toBe(401)

    state.user = { id: 'u1', email: 'paciente@evipro.pe' }
    state.member = false
    expect((await POST(postRequest(validPayload))).status).toBe(403)
  })

  it('rechaza datos inválidos sin escribir', async () => {
    const res = await POST(postRequest({ ...validPayload, sleep_hours: 25 }))
    expect(res.status).toBe(400)
    expect(state.upserted).toBeNull()
  })

  it('ante fallo de base responde genérico', async () => {
    state.upsertError = { message: 'relation "habit_logs" does not exist' }
    const res = await POST(postRequest(validPayload))
    expect(res.status).toBe(500)
    const body = await res.json() as { error: string }
    expect(body.error).not.toContain('relation')
  })
})
