import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validarSolicitudFarmacia } from '../../lib/farmacia'

const estado = vi.hoisted(() => ({
  user: { id: 'u1' } as { id: string } | null,
  subs: [] as unknown[],
  insertado: null as Record<string, unknown> | null,
  errorInsert: null as { message: string } | null,
}))

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: async () => ({ data: { user: estado.user } }) },
    from: () => ({
      select: () => ({
        // El usuario puede tener varias suscripciones activas: la consulta
        // devuelve una lista, no una fila.
        eq: () => ({ eq: async () => ({ data: estado.subs }) }),
      }),
    }),
  }),
  createServiceClient: () => ({
    from: () => ({
      insert: (fila: Record<string, unknown>) => {
        estado.insertado = fila
        return Promise.resolve({ error: estado.errorInsert })
      },
    }),
  }),
}))

import { POST } from '../../app/api/farmacia/route'

const valida = { product_notes: 'Aceite CBD 20:1, 30ml', shalom_address: 'Shalom Sicuani' }

function pedir(body: unknown) {
  return new Request('http://localhost/api/farmacia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const conDerecho = { id: 's1', membership_plans: { includes_pharmacy_coord: true } }
const sinDerecho = { id: 's2', membership_plans: { includes_pharmacy_coord: false } }

beforeEach(() => {
  estado.user = { id: 'u1' }
  estado.subs = [conDerecho]
  estado.insertado = null
  estado.errorInsert = null
})

describe('validarSolicitudFarmacia', () => {
  it('acepta una solicitud completa y recorta espacios', () => {
    const r = validarSolicitudFarmacia({ product_notes: '  Aceite  ', shalom_address: ' Shalom ' })
    expect(r.ok && r.data.product_notes).toBe('Aceite')
  })
  it('rechaza sin notas o sin agencia', () => {
    expect(validarSolicitudFarmacia({ ...valida, product_notes: '  ' }).ok).toBe(false)
    expect(validarSolicitudFarmacia({ ...valida, shalom_address: '' }).ok).toBe(false)
  })
  it('rechaza notas pasadas de largo', () => {
    expect(validarSolicitudFarmacia({ ...valida, product_notes: 'x'.repeat(1001) }).ok).toBe(false)
  })
})

describe('POST /api/farmacia', () => {
  it('guarda la solicitud de un miembro con derecho', async () => {
    const res = await POST(pedir(valida))
    expect(res.status).toBe(200)
    expect(estado.insertado).toMatchObject({ user_id: 'u1', subscription_id: 's1' })
  })

  it('rechaza a quien no inició sesión', async () => {
    estado.user = null
    const res = await POST(pedir(valida))
    expect(res.status).toBe(401)
    expect(estado.insertado).toBeNull()
  })

  it('rechaza a un miembro cuyo plan no incluye farmacia (el caso de la Básica)', async () => {
    estado.subs = [sinDerecho]
    const res = await POST(pedir(valida))
    expect(res.status).toBe(403)
    expect(estado.insertado).toBeNull()
  })

  it('rechaza a quien no tiene suscripción activa', async () => {
    estado.subs = []
    const res = await POST(pedir(valida))
    expect(res.status).toBe(403)
    expect(estado.insertado).toBeNull()
  })

  it('el cliente no puede elegir el estado ni el dueño de la solicitud', async () => {
    await POST(pedir({ ...valida, status: 'delivered', user_id: 'otro' }))
    expect(estado.insertado).not.toHaveProperty('status')
    expect(estado.insertado).toMatchObject({ user_id: 'u1' })
  })

  it('con varias suscripciones activas basta que UNA incluya farmacia', async () => {
    // El caso de Carlos: cuatro membresías activas a la vez. Pedir una sola
    // fila devolvía error y se leía como "no tiene derecho".
    estado.subs = [sinDerecho, conDerecho]
    const res = await POST(pedir(valida))
    expect(res.status).toBe(200)
    expect(estado.insertado).toMatchObject({ subscription_id: 's1' })
  })

  it('ante fallo de base de datos responde genérico', async () => {
    estado.errorInsert = { message: 'column "shalom_address" does not exist' }
    const res = await POST(pedir(valida))
    expect(res.status).toBe(500)
    const cuerpo = await res.json() as { error: string }
    expect(cuerpo.error).not.toContain('column')
  })
})
