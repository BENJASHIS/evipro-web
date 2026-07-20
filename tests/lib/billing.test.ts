import { describe, it, expect } from 'vitest'
import { computePeriodEnd } from '../../lib/billing'

describe('computePeriodEnd', () => {
  const from = new Date('2026-01-15T00:00:00.000Z')

  it('mensual suma 1 mes', () => {
    expect(computePeriodEnd('mensual', from).toISOString()).toBe('2026-02-15T00:00:00.000Z')
  })
  it('trimestral suma 3 meses', () => {
    expect(computePeriodEnd('trimestral', from).toISOString()).toBe('2026-04-15T00:00:00.000Z')
  })
  it('semestral suma 6 meses', () => {
    expect(computePeriodEnd('semestral', from).toISOString()).toBe('2026-07-15T00:00:00.000Z')
  })
  it('anual suma 12 meses', () => {
    expect(computePeriodEnd('anual', from).toISOString()).toBe('2027-01-15T00:00:00.000Z')
  })
  it('quincenal suma 15 días', () => {
    expect(computePeriodEnd('quincenal', from).toISOString()).toBe('2026-01-30T00:00:00.000Z')
  })
  it('no muta la fecha de entrada', () => {
    const orig = new Date('2026-01-15T00:00:00.000Z')
    computePeriodEnd('mensual', orig)
    expect(orig.toISOString()).toBe('2026-01-15T00:00:00.000Z')
  })
})
