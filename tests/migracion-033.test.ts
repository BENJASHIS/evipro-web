import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'

// 032 ya está aplicada en producción: 033 rehace el índice del número de operación.
// Un número no sirve para dos reservas vivas ni para reutilizar el de un pago real (aunque se haya
// cancelado); el código de una reserva cancelada sin pagar vuelve a servir. Sin importar el medio.
it('033 rehace el índice único del número de operación sin el medio y contando los pagos cancelados', () => {
  const sql = readFileSync('supabase/migrations/033_referencia_pago_unica.sql', 'utf8').replace(/\s+/g, ' ')
  expect(sql).toContain('drop index if exists public.counseling_bookings_payment_reference_unique;')
  expect(sql).toMatch(/create unique index counseling_bookings_payment_reference_unique on public\.counseling_bookings \(payment_reference\) where payment_reference is not null and \(cancelled_at is null or paid\);/)
})
