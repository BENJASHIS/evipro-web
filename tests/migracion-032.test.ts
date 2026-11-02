import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'

// Un código de consulta gratis (o un número de operación) de una reserva cancelada debe poder
// usarse en otra: el índice único solo cuenta las reservas vivas.
it('el índice único del número de operación ignora las reservas canceladas', () => {
  const sql = readFileSync('supabase/migrations/032_pago_reserva.sql', 'utf8').replace(/\s+/g, ' ')
  expect(sql).toMatch(/counseling_bookings_payment_reference_unique on public\.counseling_bookings \(payment_method, payment_reference\) where payment_reference is not null and cancelled_at is null;/)
})
