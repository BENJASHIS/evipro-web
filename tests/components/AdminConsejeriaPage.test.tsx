import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

const base = {
  patient_phone: '999', patient_note: null, doctor_slug: 'dr-jara', modality: 'virtual',
  slot_date: '2026-11-03', slot_time: '09:00:00', price_soles: 80, paid: false,
  payment_method: 'manual', created_at: '2026-11-01T14:00:00Z',
}
const reservas = [
  // Cancelada después de confirmarla (así quedó la prueba del 2026-11-01).
  { ...base, id: 'a', patient_name: 'Prueba cancelada', confirmed_at: '2026-11-01T21:38:00Z', cancelled_at: '2026-11-01T22:00:00Z' },
  { ...base, id: 'b', patient_name: 'Paciente activo', confirmed_at: null, cancelled_at: null },
  { ...base, id: 'c', patient_name: 'Pago por verificar', confirmed_at: null, cancelled_at: null,
    pago_hasta: '2026-11-01T15:00:00Z', payment_reported_at: '2026-11-01T14:30:00Z' },
]

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: async () => ({
    from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: reservas }) }) }) }),
  }),
}))
vi.mock('@/app/admin/actions', () => ({ confirmBooking: vi.fn() }))

it('una reserva cancelada se ve cancelada, no cuenta como por cobrar y no ofrece confirmar ni WhatsApp', async () => {
  const { default: AdminConsejeriaPage } = await import('../../app/admin/consejeria/page')
  render(await AdminConsejeriaPage())

  const cancelada = screen.getByText('Prueba cancelada').closest('div.border')!
  expect(cancelada.textContent).toContain('Cancelada')
  expect(cancelada.textContent).not.toContain('Confirmada')
  expect(cancelada.querySelector('form')).toBeNull()
  expect(cancelada.textContent).not.toContain('WA →')

  const porCobrar = screen.getByText('Por cobrar', { selector: 'p' }).nextElementSibling
  expect(porCobrar?.textContent).toBe('2')
})

it('una reserva con pago al reservar muestra su estado y manda a confirmar el pago al panel del médico', async () => {
  const { default: AdminConsejeriaPage } = await import('../../app/admin/consejeria/page')
  render(await AdminConsejeriaPage())
  const fila = screen.getByText('Pago por verificar', { selector: 'p' }).closest('div.border')!
  expect(fila.textContent).toContain('Pago por verificar')
  expect(fila.textContent).toContain('Confirmar pago en el panel del médico')
  expect(fila.querySelector('form')).toBeNull()
  expect(fila.textContent).not.toContain('WA →')
})
