import { describe, it, expect, beforeEach, vi } from 'vitest'

const filaBase = {
  id: 'b1', doctor_slug: 'dr-jara', patient_name: 'Ana Prueba', modality: 'virtual',
  slot_date: '2099-01-06', slot_time: '09:00:00', paid: true, confirmed_at: '2099-01-01T10:00:00Z' as string | null,
  payment_reported_at: '2099-01-01T09:50:00Z' as string | null, cancelled_at: null as string | null,
  cancel_reason: null as string | null, reschedule_count: 0, refund_pending: false,
}
const estado = vi.hoisted(() => ({
  fila: null as Record<string, unknown> | null,
  updates: [] as Record<string, unknown>[],
  errorUpdate: null as { code?: string; message: string } | null,
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/doctor-portal', () => ({ verifyDoctorPortalToken: vi.fn() }))
vi.mock('@/lib/supabase-server', () => ({
  createServiceClient: () => ({
    from: () => {
      const q: Record<string, unknown> = {}
      let esUpdate = false
      for (const m of ['select', 'eq', 'is']) q[m] = () => q
      q.update = (cambios: Record<string, unknown>) => { esUpdate = true; estado.updates.push(cambios); return q }
      q.maybeSingle = async () => ({ data: estado.fila, error: null })
      q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: null, error: esUpdate ? estado.errorUpdate : null }).then(ok)
      return q
    },
  }),
}))
vi.mock('@/lib/google-calendar', () => ({
  confirmarEvento: vi.fn(), cancelarEvento: vi.fn(), moverEvento: vi.fn(), ocupadosEnGoogle: vi.fn(),
}))
vi.mock('@/lib/pago-reserva', () => ({ confirmarPago: vi.fn() }))

import { confirmarPagoReserva, cambiarFecha } from '../../app/medicos/[slug]/reservas/actions'
import { verifyDoctorPortalToken } from '@/lib/doctor-portal'
import { confirmarPago } from '@/lib/pago-reserva'
import { moverEvento, ocupadosEnGoogle } from '@/lib/google-calendar'

const confirmar = vi.mocked(confirmarPago)

beforeEach(() => {
  estado.fila = { ...filaBase }
  estado.updates = []
  estado.errorUpdate = null
  vi.mocked(verifyDoctorPortalToken).mockReturnValue(true)
  confirmar.mockReset().mockResolvedValue({ ok: true, sinTurno: false })
  vi.mocked(moverEvento).mockReset().mockResolvedValue(undefined)
  vi.mocked(ocupadosEnGoogle).mockReset().mockResolvedValue([])
})

// El 2099-01-08 es jueves: día de atención de dr-jara.
describe('cambiarFecha', () => {
  it('a un turno fuera de agenda → Horario no disponible', async () => {
    expect(await cambiarFecha('dr-jara', 't', 'b1', '2099-01-08', '13:00')).toEqual({ ok: false, error: 'Horario no disponible' })
    expect(estado.updates).toHaveLength(0)
  })

  it('a un turno ocupado en Google o en la base → Ese horario ya fue reservado', async () => {
    vi.mocked(ocupadosEnGoogle).mockResolvedValue(['2099-01-08T11:00'])
    expect(await cambiarFecha('dr-jara', 't', 'b1', '2099-01-08', '11:00')).toEqual({ ok: false, error: 'Ese horario ya fue reservado. Elige otro.' })
    vi.mocked(ocupadosEnGoogle).mockResolvedValue([])
    estado.errorUpdate = { code: '23505', message: 'counseling_bookings_slot_unique' }
    expect(await cambiarFecha('dr-jara', 't', 'b1', '2099-01-08', '11:00')).toEqual({ ok: false, error: 'Ese horario ya fue reservado. Elige otro.' })
  })

  it('mueve la reserva, suma 1 al contador de cambios y mueve el evento', async () => {
    estado.fila = { ...filaBase, reschedule_count: 1 }
    expect(await cambiarFecha('dr-jara', 't', 'b1', '2099-01-08', '11:00')).toEqual({ ok: true })
    expect(estado.updates[0]).toEqual({ slot_date: '2099-01-08', slot_time: '11:00', reschedule_count: 2 })
    expect(moverEvento).toHaveBeenCalledWith(
      { id: 'b1', doctor_slug: 'dr-jara', patient_name: 'Ana Prueba', modality: 'virtual', slot_date: '2099-01-08', slot_time: '11:00' }, 'confirmed')
  })

  it('una reserva pagada sin turno revive en la fecha nueva', async () => {
    estado.fila = { ...filaBase, confirmed_at: null, cancelled_at: '2099-01-01T11:00:00Z', cancel_reason: 'pagó sin turno', refund_pending: true }
    expect(await cambiarFecha('dr-jara', 't', 'b1', '2099-01-08', '11:00')).toEqual({ ok: true })
    expect(estado.updates[0]).toMatchObject({ cancelled_at: null, cancel_reason: null, refund_pending: false })
    expect(estado.updates[0].confirmed_at).toEqual(expect.any(String))
  })

  it('una reserva cancelada sin devolución pendiente no se mueve', async () => {
    estado.fila = { ...filaBase, cancelled_at: '2099-01-01T11:00:00Z', cancel_reason: 'no puede' }
    expect(await cambiarFecha('dr-jara', 't', 'b1', '2099-01-08', '11:00')).toEqual({ ok: false, error: 'Reserva cancelada' })
  })

  it('una reserva aún pendiente de pago se mueve sin crear evento', async () => {
    estado.fila = { ...filaBase, paid: false, confirmed_at: null, payment_reported_at: null }
    expect(await cambiarFecha('dr-jara', 't', 'b1', '2099-01-08', '11:00')).toEqual({ ok: true })
    expect(moverEvento).not.toHaveBeenCalled()
  })
})

describe('confirmarPagoReserva', () => {
  it('sin token válido → No autorizado', async () => {
    vi.mocked(verifyDoctorPortalToken).mockReturnValue(false)
    expect(await confirmarPagoReserva('dr-jara', 'x', 'b1', '', '')).toEqual({ ok: false, error: 'No autorizado' })
    expect(confirmar).not.toHaveBeenCalled()
  })

  it('monto vacío usa el precio de la reserva; con coma decimal también vale', async () => {
    await confirmarPagoReserva('dr-jara', 't', 'b1', '', '')
    expect(confirmar).toHaveBeenLastCalledWith(expect.anything(), 'b1', { monto: undefined, referencia: null }, 'dr-jara')
    await confirmarPagoReserva('dr-jara', 't', 'b1', '35,50', '')
    expect(confirmar).toHaveBeenLastCalledWith(expect.anything(), 'b1', { monto: 35.5, referencia: null }, 'dr-jara')
  })

  it('monto no numérico o fuera de 0..10000 → Monto inválido', async () => {
    for (const malo of ['abc', '-1', '10001']) {
      expect(await confirmarPagoReserva('dr-jara', 't', 'b1', malo, '')).toEqual({ ok: false, error: 'Monto inválido' })
    }
    expect(confirmar).not.toHaveBeenCalled()
  })

  it('número de operación opcional de hasta 40 caracteres', async () => {
    await confirmarPagoReserva('dr-jara', 't', 'b1', '', ' 12345678 ')
    expect(confirmar).toHaveBeenLastCalledWith(expect.anything(), 'b1', { monto: undefined, referencia: '12345678' }, 'dr-jara')
    expect(await confirmarPagoReserva('dr-jara', 't', 'b1', '', 'x'.repeat(41))).toEqual({ ok: false, error: 'Número de operación inválido' })
  })

  it('devuelve sinTurno cuando el turno ya lo tomó otro', async () => {
    confirmar.mockResolvedValue({ ok: true, sinTurno: true })
    expect(await confirmarPagoReserva('dr-jara', 't', 'b1', '', '')).toEqual({ ok: true, sinTurno: true })
  })

  it('pasa el error de confirmarPago', async () => {
    confirmar.mockResolvedValue({ ok: false, error: 'Reserva cancelada' })
    expect(await confirmarPagoReserva('dr-jara', 't', 'b1', '', '')).toEqual({ ok: false, error: 'Reserva cancelada' })
  })
})
