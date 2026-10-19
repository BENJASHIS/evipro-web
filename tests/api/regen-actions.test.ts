import { beforeEach, expect, it, vi } from 'vitest'
import { AMBITOS } from '@/lib/regen'

const state = vi.hoisted(() => ({
  user: { id: 'regen-test', email: 'member@example.test' } as { id: string; email: string } | null,
  member: true, error: false, throws: false, rows: [] as Record<string, unknown>[],
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/member-access', () => ({
  getMemberAccess: async () => ({ enabled: state.member }),
  canUseMemberTools: (access: { enabled: boolean }) => access.enabled,
}))
vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: state.user } }) } }),
  createServiceClient: () => ({ from: () => ({ insert: async (row: Record<string, unknown>) => {
    if (state.throws) throw new Error('connection')
    state.rows.push(row)
    return { error: state.error ? { message: 'storage' } : null }
  } }) }),
}))
import { saveRegenEvaluacion } from '@/app/miembros/regen/regen-actions'

const respuestas = AMBITOS.flatMap(a => a.preguntas.map(p => ({ preguntaId: p.id, valor: p.id === 'hogar_4' ? 1 : 0 })))
beforeEach(() => {
  state.user = { id: 'regen-test', email: 'member@example.test' }
  state.member = true; state.error = false; state.throws = false; state.rows = []
})

it('atribuye el registro al usuario y conserva la señal preventiva con versión', async () => {
  const result = await saveRegenEvaluacion(respuestas)
  expect(result).toMatchObject({ ok: true, saved: true, resultado: { supportFlags: ['hogar_4'], safetyTriggered: false } })
  expect(state.rows[0]).toMatchObject({ user_id: 'regen-test', version: '2026.10.19', flags: ['hogar_4'] })
})

it.each(['error', 'throws'] as const)('mantiene la orientación y avisa si falla guardar: %s', async key => {
  state[key] = true
  expect(await saveRegenEvaluacion(respuestas)).toMatchObject({ ok: true, saved: false, resultado: { supportFlags: ['hogar_4'] } })
})

it('no escribe sin permiso ni con respuestas incompletas', async () => {
  state.user = null
  expect(await saveRegenEvaluacion(respuestas)).toMatchObject({ ok: false })
  state.user = { id: 'regen-test', email: 'member@example.test' }
  state.member = false
  expect(await saveRegenEvaluacion(respuestas)).toMatchObject({ ok: false })
  state.member = true
  expect(await saveRegenEvaluacion([])).toMatchObject({ ok: false })
  expect(state.rows).toEqual([])
})

it('limita escrituras repetidas antes de acceder al almacenamiento', async () => {
  state.user = { id: 'regen-rate-test', email: 'member@example.test' }
  for (let i = 0; i < 20; i++) await saveRegenEvaluacion(respuestas)
  expect(await saveRegenEvaluacion(respuestas)).toMatchObject({ ok: false })
  expect(state.rows).toHaveLength(20)
})
