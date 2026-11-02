import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/google-calendar', () => ({ confirmarEvento: vi.fn() }))

import { normalizarReferencia, liberarVencidas, confirmarPago, type ServiceClient } from '../../lib/pago-reserva'
import { confirmarEvento } from '@/lib/google-calendar'

type Llamada = [string, unknown[]]
const fila = {
  id: 'b1', doctor_slug: 'dr-jara', patient_name: 'Ana Prueba', modality: 'virtual',
  slot_date: '2026-11-03', slot_time: '09:00:00', price_soles: 70,
  cancelled_at: null as string | null, cancel_reason: null as string | null,
}
let llamadas: Llamada[][]
let errores: Array<{ code?: string; message: string } | null>
let reserva: typeof fila | null

// Cada from() es una consulta: registra la cadena; un update toma el siguiente error de la cola.
const sb = {
  from: () => {
    const cadena: Llamada[] = []
    llamadas.push(cadena)
    const q: Record<string, unknown> = {}
    for (const m of ['select', 'update', 'eq', 'is', 'lt']) {
      q[m] = (...a: unknown[]) => { cadena.push([m, a]); return q }
    }
    q.maybeSingle = async () => ({ data: reserva, error: null })
    q.then = (ok: (v: unknown) => unknown) =>
      Promise.resolve({ data: null, error: cadena.some(([m]) => m === 'update') ? errores.shift() ?? null : null }).then(ok)
    return q
  },
} as unknown as ServiceClient

const updates = () => llamadas.filter(c => c.some(([m]) => m === 'update')).map(c => c.find(([m]) => m === 'update')![1][0] as Record<string, unknown>)

beforeEach(() => {
  llamadas = []
  errores = []
  reserva = { ...fila }
  vi.mocked(confirmarEvento).mockReset().mockResolvedValue(undefined)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('normalizarReferencia', () => {
  it('normaliza dígitos con espacios o guiones', () => {
    expect(normalizarReferencia('yape', ' 1234 5678 ')).toBe('12345678')
    expect(normalizarReferencia('plin', '1234-5678')).toBe('12345678')
    expect(normalizarReferencia('yape', '12a4')).toBeNull()
    expect(normalizarReferencia('yape', '123')).toBeNull()
  })
  it('acepta solo códigos de crédito con el alfabeto de lib/credits', () => {
    expect(normalizarReferencia('codigo', ' evi-abcd2345 ')).toBe('EVI-ABCD2345')
    expect(normalizarReferencia('codigo', 'EVI-ABCD234I')).toBeNull()
  })
})

describe('liberarVencidas', () => {
  it('cancela solo las de ese médico, sin pago ni reporte y con plazo vencido', async () => {
    await liberarVencidas(sb, 'dr-jara', new Date('2026-11-03T15:00:00Z'))
    expect(llamadas[0]).toEqual([
      ['update', [{ cancelled_at: '2026-11-03T15:00:00.000Z', cancel_reason: 'sin pago en 1 hora' }]],
      ['eq', ['doctor_slug', 'dr-jara']],
      ['is', ['cancelled_at', null]],
      ['is', ['confirmed_at', null]],
      ['eq', ['paid', false]],
      ['is', ['payment_reported_at', null]],
      ['lt', ['pago_hasta', '2026-11-03T15:00:00.000Z']],
    ])
  })
  it('si la base falla, lo anota y no lanza', async () => {
    errores = [{ message: 'caída' }]
    await expect(liberarVencidas(sb, 'dr-jara')).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalled()
  })
})

describe('confirmarPago', () => {
  it('marca pagada y confirmada, guarda el monto y pasa el evento a confirmado', async () => {
    expect(await confirmarPago(sb, 'b1', { referencia: '12345678', medio: 'yape' })).toEqual({ ok: true, sinTurno: false })
    expect(updates()[0]).toMatchObject({
      paid: true, cancelled_at: null, cancel_reason: null, amount_received: 70,
      payment_reference: '12345678', payment_method: 'yape',
    })
    expect(updates()[0].confirmed_at).toEqual(expect.any(String))
    expect(confirmarEvento).toHaveBeenCalledWith({
      id: 'b1', doctor_slug: 'dr-jara', patient_name: 'Ana Prueba', modality: 'virtual', slot_date: '2026-11-03', slot_time: '09:00:00',
    })
  })
  it('el monto que corrige Carlos reemplaza al precio', async () => {
    await confirmarPago(sb, 'b1', { monto: 35 })
    expect(updates()[0].amount_received).toBe(35)
  })
  it('soloMedico filtra por doctor_slug', async () => {
    await confirmarPago(sb, 'b1', {}, 'dr-jara')
    expect(llamadas[0]).toContainEqual(['eq', ['doctor_slug', 'dr-jara']])
  })
  it('revive una reserva vencida (sin pago en 1 hora) si el turno sigue libre', async () => {
    reserva = { ...fila, cancelled_at: '2026-11-03T15:00:00Z', cancel_reason: 'sin pago en 1 hora' }
    expect(await confirmarPago(sb, 'b1', {})).toEqual({ ok: true, sinTurno: false })
    expect(updates()[0]).toMatchObject({ cancelled_at: null, cancel_reason: null })
  })
  it('no revive una reserva que canceló Carlos', async () => {
    reserva = { ...fila, cancelled_at: '2026-11-03T15:00:00Z', cancel_reason: 'paciente no puede' }
    expect(await confirmarPago(sb, 'b1', {})).toEqual({ ok: false, error: 'Reserva cancelada' })
    expect(updates()).toHaveLength(0)
  })
  it('reserva inexistente → No encontrado', async () => {
    reserva = null
    expect(await confirmarPago(sb, 'b1', {})).toEqual({ ok: false, error: 'No encontrado' })
  })
  it('si el turno ya lo tomó otro: pagada sin turno, devolución pendiente y sin evento', async () => {
    reserva = { ...fila, cancelled_at: '2026-11-03T15:00:00Z', cancel_reason: 'sin pago en 1 hora' }
    errores = [{ code: '23505', message: 'duplicate key value violates unique constraint "counseling_bookings_slot_unique"' }]
    expect(await confirmarPago(sb, 'b1', { monto: 70 })).toEqual({ ok: true, sinTurno: true })
    expect(updates()[1]).toMatchObject({ paid: true, refund_pending: true, cancel_reason: 'pagó sin turno', amount_received: 70 })
    expect(updates()[1]).not.toHaveProperty('cancelled_at')
    expect(confirmarEvento).not.toHaveBeenCalled()
  })
  it('número de operación repetido → error, no sin turno', async () => {
    errores = [{ code: '23505', message: 'duplicate key value violates unique constraint "counseling_bookings_payment_reference_unique"' }]
    expect(await confirmarPago(sb, 'b1', { referencia: '12345678', medio: 'yape' }))
      .toEqual({ ok: false, error: 'Ese número de operación ya se usó en otra reserva' })
  })
  it('si Google falla, la confirmación igual vale', async () => {
    vi.mocked(confirmarEvento).mockRejectedValue(new Error('google'))
    expect(await confirmarPago(sb, 'b1', {})).toEqual({ ok: true, sinTurno: false })
  })
})
