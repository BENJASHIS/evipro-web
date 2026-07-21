import { describe, it, expect } from 'vitest'
import { computePeriodEnd, computeCartTotal, buildCartItems } from '../../lib/billing'

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

describe('computeCartTotal', () => {
  it('base sin add-ons = base', () => {
    expect(computeCartTotal(49, [])).toBe(49)
  })
  it('base + add-ons suma todo', () => {
    expect(computeCartTotal(49, [20, 20])).toBe(89)
  })
})

describe('buildCartItems', () => {
  it('un item por base y por cada add-on', () => {
    const items = buildCartItems(
      { title: 'Membresía EVIPro · mensual', price: 49 },
      [{ title: 'Cannabis (Dr. Jara)', price: 20 }],
    )
    expect(items).toHaveLength(2)
    expect(items[0]).toEqual({ title: 'Membresía EVIPro · mensual', unit_price: 49, quantity: 1 })
    expect(items[1]).toEqual({ title: 'Cannabis (Dr. Jara)', unit_price: 20, quantity: 1 })
  })
})
