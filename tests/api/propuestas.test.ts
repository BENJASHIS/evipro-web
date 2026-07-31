import { describe, it, expect, beforeEach, vi } from 'vitest'

const supa = vi.hoisted(() => ({
  insertado: null as Record<string, unknown> | null,
  error: null as { message: string } | null,
}))

vi.mock('@/lib/supabase-server', () => ({
  createServiceClient: () => ({
    from: () => ({
      insert: (fila: Record<string, unknown>) => {
        supa.insertado = fila
        return Promise.resolve({ error: supa.error })
      },
    }),
  }),
}))

import { POST } from '../../app/api/propuestas/route'

const valida = {
  full_name: 'Ana Quispe',
  phone: '987654321',
  email: 'ana@fisio.pe',
  occupation: 'Fisioterapeuta',
  license: 'CTP 1234',
  city: 'Cusco',
  proposal: 'Derivar pacientes con dolor cronico.',
  contribution: 'Consultorio y dos terapeutas.',
  needs: 'Criterios de derivacion.',
}

function pedir(body: unknown) {
  return new Request('http://localhost/api/propuestas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  supa.insertado = null
  supa.error = null
})

describe('POST /api/propuestas', () => {
  it('guarda una propuesta completa', async () => {
    const res = await POST(pedir(valida))
    expect(res.status).toBe(200)
    expect(supa.insertado).toMatchObject({ full_name: 'Ana Quispe', city: 'Cusco' })
  })

  it('rechaza una propuesta incompleta con 400 y no escribe nada', async () => {
    const res = await POST(pedir({ ...valida, needs: '' }))
    expect(res.status).toBe(400)
    expect(supa.insertado).toBeNull()
  })

  it('nunca guarda el estado que mande el cliente', async () => {
    await POST(pedir({ ...valida, status: 'contestada' }))
    expect(supa.insertado).not.toHaveProperty('status')
  })

  it('descarta el envio si la trampa de bots viene rellena', async () => {
    const res = await POST(pedir({ ...valida, website: 'http://spam.example' }))
    expect(res.status).toBe(200)
    expect(supa.insertado).toBeNull()
  })

  it('ante fallo de base de datos responde generico, sin filtrar el error interno', async () => {
    supa.error = { message: 'relation "partnership_proposals" does not exist' }
    const res = await POST(pedir(valida))
    expect(res.status).toBe(500)
    const cuerpo = await res.json() as { error: string }
    expect(cuerpo.error).not.toContain('relation')
  })

  it('un cuerpo que no es JSON responde 400, no revienta', async () => {
    const res = await POST(new Request('http://localhost/api/propuestas', {
      method: 'POST',
      body: 'no soy json',
    }))
    expect(res.status).toBe(400)
  })
})
