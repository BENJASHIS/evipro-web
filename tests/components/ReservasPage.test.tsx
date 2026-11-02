import { render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'

const base = {
  user_id: null, modality: 'virtual', slot_date: '2099-11-03', slot_time: '09:00:00', patient_phone: '999888777',
  patient_note: null, is_first_session: true, price_soles: 70, payment_method: 'manual', cancelled_at: null,
  cancel_reason: null, created_at: '2099-11-01T14:00:00Z', payment_reference: null, payment_reported_at: null,
  amount_received: null, visit_number: 1, reschedule_count: 0, refund_pending: false, refunded_at: null,
}
const proximas = [
  { ...base, id: 'a', patient_name: 'Pendiente Pago', paid: false, confirmed_at: null, pago_hasta: '2099-11-01T15:00:00Z' },
  { ...base, id: 'b', patient_name: 'Ya Confirmada', slot_time: '10:00:00', paid: true, confirmed_at: '2099-11-01T14:30:00Z', pago_hasta: '2099-11-01T15:00:00Z' },
  { ...base, id: 'c', patient_name: 'A Domicilio', modality: 'domicilio', slot_date: null, slot_time: null, paid: false, confirmed_at: null, pago_hasta: null },
]

vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('404') } }))
vi.mock('@/lib/doctor-portal', () => ({ verifyDoctorPortalToken: () => true }))
vi.mock('@/lib/pago-reserva', () => ({ liberarVencidas: vi.fn(), confirmarPago: vi.fn() }))
vi.mock('@/lib/supabase-server', () => {
  // Solo la primera consulta de reservas (las próximas) trae filas; el resto de secciones, vacías.
  let consultas = 0
  return {
    reiniciar: () => { consultas = 0 },
    createServiceClient: () => ({
      from: (tabla: string) => {
        const filas = tabla === 'counseling_bookings' && consultas++ === 0 ? proximas : []
        const q: Record<string, unknown> = {}
        for (const m of ['select', 'eq', 'is', 'gte', 'in', 'order', 'limit', 'lt']) q[m] = () => q
        q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: filas, error: null }).then(ok)
        return q
      },
    }),
  }
})

beforeEach(async () => {
  const sb = await import('@/lib/supabase-server') as unknown as { reiniciar: () => void }
  sb.reiniciar()
})

it('con pago al reservar, el WhatsApp de confirmación solo aparece cuando el pago ya está confirmado', async () => {
  const { default: ReservasPage } = await import('../../app/medicos/[slug]/reservas/page')
  render(await ReservasPage({ params: Promise.resolve({ slug: 'dr-jara' }), searchParams: Promise.resolve({ token: 't' }) }))
  const tarjeta = (nombre: string) => screen.getByText(nombre).closest('div.border')!
  expect(tarjeta('Pendiente Pago').textContent).not.toContain('Confirmar por WA')
  expect(tarjeta('Ya Confirmada').textContent).toContain('Confirmar por WA')
})

it('domicilio y reservas sin pago al reservar se confirman como siempre; una confirmada no ofrece «Confirmar pago»', async () => {
  const { default: ReservasPage } = await import('../../app/medicos/[slug]/reservas/page')
  render(await ReservasPage({ params: Promise.resolve({ slug: 'dr-jara' }), searchParams: Promise.resolve({ token: 't' }) }))
  const tarjeta = (nombre: string) => screen.getAllByText(nombre)[0].closest('div.border')!
  const domicilio = tarjeta('A Domicilio')
  expect(domicilio.textContent).toContain('Confirmar por WA')
  expect(domicilio.textContent).not.toContain('Confirmar pago')
  expect(domicilio.textContent).not.toContain('Cambiar fecha')
  expect([...domicilio.querySelectorAll('button')].some(b => b.textContent === 'Confirmar')).toBe(true)
  expect(tarjeta('Ya Confirmada').textContent).not.toContain('Confirmar pago')
  expect(tarjeta('Pendiente Pago').textContent).toContain('Confirmar pago')
})
