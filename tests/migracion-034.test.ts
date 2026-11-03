import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'

it('034 agrega a las reservas la columna del aliado que mandó al paciente', () => {
  const sql = readFileSync('supabase/migrations/034_convenio_reserva.sql', 'utf8').replace(/\s+/g, ' ')
  expect(sql).toContain('alter table public.counseling_bookings add column if not exists convenio text;')
})
