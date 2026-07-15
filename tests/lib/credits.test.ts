// tests/lib/credits.test.ts
import { describe, it, expect } from 'vitest'
import { generateCreditCode, canActOnCredit, CREDIT_STATUS_LABEL } from '../../lib/credits'

describe('generateCreditCode', () => {
  it('formato EVI-XXXXXXXX sin caracteres ambiguos', () => {
    const code = generateCreditCode()
    expect(code).toMatch(/^EVI-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/)
  })
  it('no repite en 1000 tiradas (colisión ~nula)', () => {
    const seen = new Set(Array.from({ length: 1000 }, generateCreditCode))
    expect(seen.size).toBe(1000)
  })
})

describe('canActOnCredit', () => {
  it('solo activo se puede canjear/donar', () => {
    expect(canActOnCredit('active')).toBe(true)
    expect(canActOnCredit('redeemed')).toBe(false)
    expect(canActOnCredit('donated')).toBe(false)
  })
})

describe('CREDIT_STATUS_LABEL', () => {
  it('tiene label para cada estado', () => {
    expect(CREDIT_STATUS_LABEL.active.text).toBeTruthy()
    expect(CREDIT_STATUS_LABEL.redeemed.text).toBeTruthy()
    expect(CREDIT_STATUS_LABEL.donated.text).toBeTruthy()
  })
})
