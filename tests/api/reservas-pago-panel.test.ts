import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/doctor-portal', () => ({ verifyDoctorPortalToken: vi.fn() }))
vi.mock('@/lib/supabase-server', () => ({ createServiceClient: () => ({}) }))
vi.mock('@/lib/google-calendar', () => ({ confirmarEvento: vi.fn(), cancelarEvento: vi.fn() }))
vi.mock('@/lib/pago-reserva', () => ({ confirmarPago: vi.fn() }))

import { confirmarPagoReserva } from '../../app/medicos/[slug]/reservas/actions'
import { verifyDoctorPortalToken } from '@/lib/doctor-portal'
import { confirmarPago } from '@/lib/pago-reserva'

const confirmar = vi.mocked(confirmarPago)

beforeEach(() => {
  vi.mocked(verifyDoctorPortalToken).mockReturnValue(true)
  confirmar.mockReset().mockResolvedValue({ ok: true, sinTurno: false })
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
