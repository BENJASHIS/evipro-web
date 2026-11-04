import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { VISITA_MAX } from '../lib/consulta-pricing'

it('035 deja declarar hasta la visita que ofrece la reserva', () => {
  const sql = readFileSync('supabase/migrations/035_visita_hasta_5.sql', 'utf8').replace(/\s+/g, ' ')
  expect(sql).toContain('drop constraint if exists counseling_bookings_visit_number_check;')
  expect(sql).toContain(`check (visit_number between 1 and ${VISITA_MAX});`)
})
