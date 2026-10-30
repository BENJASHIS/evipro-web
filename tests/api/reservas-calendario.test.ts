import { describe, it, expect, beforeEach, vi } from 'vitest'

const estado = vi.hoisted(() => ({
  fila: {
    id: 'b1', doctor_slug: 'dr-jara', patient_name: 'Ana Prueba', modality: 'virtual',
    slot_date: '2099-01-06', slot_time: '09:00:00', cancelled_at: null as string | null,
  },
  llamadas: [] as [string, unknown[]][],
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/doctor-portal', () => ({ verifyDoctorPortalToken: vi.fn() }))
vi.mock('@/lib/auth', () => ({ isAdminUser: () => true }))
vi.mock('@/lib/google-calendar', () => ({ confirmarEvento: vi.fn(), cancelarEvento: vi.fn() }))
vi.mock('@/lib/supabase-server', () => {
  // Cadena de Supabase: cada método devuelve la consulta; al final da la fila de la reserva.
  // Como la BD, .is('cancelled_at', null) no devuelve una reserva cancelada.
  const consulta = () => {
    const q: Record<string, unknown> = {}
    let soloActivas = false
    for (const m of ['select', 'update', 'eq', 'is']) {
      q[m] = (...a: unknown[]) => {
        estado.llamadas.push([m, a])
        if (m === 'is' && a[0] === 'cancelled_at' && a[1] === null) soloActivas = true
        return q
      }
    }
    q.maybeSingle = async () => ({ data: soloActivas && estado.fila.cancelled_at ? null : estado.fila, error: null })
    q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(ok)
    return q
  }
  return {
    createServiceClient: () => ({ from: consulta }),
    createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) } }),
  }
})

import { confirmBooking, cancelBooking } from '../../app/medicos/[slug]/reservas/actions'
import { confirmBooking as confirmarDesdeAdmin } from '../../app/admin/actions'
import { cancelMyBooking } from '../../app/miembros/citas-actions'
import { verifyDoctorPortalToken } from '@/lib/doctor-portal'
import { confirmarEvento, cancelarEvento } from '@/lib/google-calendar'

const confirmar = vi.mocked(confirmarEvento)
const cancelar = vi.mocked(cancelarEvento)

beforeEach(() => {
  estado.llamadas = []
  estado.fila.cancelled_at = null
  vi.mocked(verifyDoctorPortalToken).mockReturnValue(true)
  confirmar.mockReset().mockResolvedValue(undefined)
  cancelar.mockReset().mockResolvedValue(undefined)
})

describe('confirmar y cancelar reflejan la reserva en Google Calendar', () => {
  it('confirmar en el portal del médico pasa el evento a confirmado', async () => {
    expect(await confirmBooking('dr-jara', 'tok', 'b1')).toEqual({ ok: true })
    expect(confirmar).toHaveBeenCalledWith(expect.objectContaining({ id: 'b1', doctor_slug: 'dr-jara', slot_time: '09:00:00' }))
  })

  it('confirmar desde /admin también', async () => {
    const datos = new FormData()
    datos.set('id', 'b1')
    await confirmarDesdeAdmin(datos)
    expect(confirmar).toHaveBeenCalledWith(expect.objectContaining({ id: 'b1', doctor_slug: 'dr-jara' }))
  })

  it('confirmar desde /admin una reserva ya cancelada no revive su evento', async () => {
    estado.fila.cancelled_at = '2026-11-01T10:00:00Z'
    const datos = new FormData()
    datos.set('id', 'b1')
    await confirmarDesdeAdmin(datos)
    expect(confirmar).not.toHaveBeenCalled()
  })

  it('cancelar en el portal del médico cancela el evento', async () => {
    expect(await cancelBooking('dr-jara', 'tok', 'b1', 'El paciente pidió otra fecha')).toEqual({ ok: true })
    expect(cancelar).toHaveBeenCalledWith({ id: 'b1', doctor_slug: 'dr-jara' })
  })

  it('el miembro que cancela su cita también cancela el evento', async () => {
    expect(await cancelMyBooking('b1', 'Me surgió un viaje')).toEqual({ ok: true })
    expect(cancelar).toHaveBeenCalledWith({ id: 'b1', doctor_slug: 'dr-jara' })
  })

  it('si Google falla al confirmar, la acción igual responde ok', async () => {
    confirmar.mockRejectedValue(new Error('x'))
    expect(await confirmBooking('dr-jara', 'tok', 'b1')).toEqual({ ok: true })
  })

  it('una acción rechazada (token inválido) no toca el calendario', async () => {
    vi.mocked(verifyDoctorPortalToken).mockReturnValue(false)
    await confirmBooking('dr-jara', 'malo', 'b1')
    await cancelBooking('dr-jara', 'malo', 'b1', 'motivo válido')
    expect(confirmar).not.toHaveBeenCalled()
    expect(cancelar).not.toHaveBeenCalled()
  })
})
