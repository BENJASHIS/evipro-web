import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetRateLimitForTests } from '../../lib/rate-limit'

const estado = vi.hoisted(() => ({
  insertado: null as Record<string, unknown> | null,
  error: null as { message: string } | null,
}))

vi.mock('@/lib/supabase-server', () => ({
  createServiceClient: () => ({
    from: () => ({
      insert: (fila: Record<string, unknown>) => {
        estado.insertado = fila
        return Promise.resolve({ error: estado.error })
      },
    }),
  }),
}))

import { POST } from '../../app/api/complaints/route'

const valid = {
  tipo: 'reclamo',
  full_name: 'Paciente Prueba',
  dni: '12345678',
  email: 'paciente@example.com',
  phone: '987654321',
  servicio: 'Membresía EVIPro',
  descripcion: 'No pude acceder al área de miembros.',
  pretension: 'Solicito revisión del acceso.',
}

function pedir(body: unknown) {
  return new Request('http://localhost/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  estado.insertado = null
  estado.error = null
  resetRateLimitForTests()
})

describe('POST /api/complaints', () => {
  it('guarda un reclamo válido', async () => {
    const res = await POST(pedir(valid))
    expect(res.status).toBe(200)
    expect(estado.insertado).toMatchObject({ code: expect.stringMatching(/^LR-\d{4}-\d{5}$/), full_name: 'Paciente Prueba' })
  })

  it('descarta la trampa de bots sin escribir', async () => {
    const res = await POST(pedir({ ...valid, website: 'https://spam.example' }))
    expect(res.status).toBe(200)
    expect(estado.insertado).toBeNull()
  })

  it('rechaza un reclamo inválido', async () => {
    const res = await POST(pedir({ ...valid, email: 'correo-malo' }))
    expect(res.status).toBe(400)
    expect(estado.insertado).toBeNull()
  })
})
