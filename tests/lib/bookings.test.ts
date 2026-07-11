// tests/lib/bookings.test.ts
import { describe, it, expect } from 'vitest'
import { bookingStatus, validateCancelReason, MAX_CANCEL_REASON, canPatientCancel } from '../../lib/bookings'

const base = { confirmed_at: null, cancelled_at: null, paid: false, payment_method: null }

describe('bookingStatus', () => {
  it('cancelled gana sobre todo lo demás', () => {
    expect(bookingStatus({ ...base, cancelled_at: 'x', confirmed_at: 'y', paid: true })).toBe('cancelled')
  })
  it('confirmed cuando hay confirmed_at y no cancelada', () => {
    expect(bookingStatus({ ...base, confirmed_at: 'x' })).toBe('confirmed')
  })
  it('pending_confirm cuando está pagada o es gratis', () => {
    expect(bookingStatus({ ...base, paid: true })).toBe('pending_confirm')
    expect(bookingStatus({ ...base, payment_method: 'free' })).toBe('pending_confirm')
  })
  it('unpaid cuando no hay pago ni confirmación', () => {
    expect(bookingStatus(base)).toBe('unpaid')
  })
})

describe('validateCancelReason', () => {
  it('rechaza no-string', () => {
    expect(validateCancelReason(null).ok).toBe(false)
  })
  it('rechaza vacío o solo espacios', () => {
    expect(validateCancelReason('   ').ok).toBe(false)
  })
  it('rechaza motivo demasiado largo', () => {
    expect(validateCancelReason('a'.repeat(MAX_CANCEL_REASON + 1)).ok).toBe(false)
  })
  it('acepta y recorta un motivo válido', () => {
    expect(validateCancelReason('  paciente no responde  ')).toEqual({ ok: true, reason: 'paciente no responde' })
  })
})

describe('canPatientCancel', () => {
  const TODAY = '2026-07-10'
  it('no cancelable si ya está cancelada', () => {
    expect(canPatientCancel({ cancelled_at: 'x', slot_date: '2026-07-20' }, TODAY)).toBe(false)
  })
  it('cancelable si no tiene fecha (mensajería/WA)', () => {
    expect(canPatientCancel({ cancelled_at: null, slot_date: null }, TODAY)).toBe(true)
  })
  it('cancelable si el slot es futuro', () => {
    expect(canPatientCancel({ cancelled_at: null, slot_date: '2026-07-20' }, TODAY)).toBe(true)
  })
  it('cancelable el mismo día (lenient)', () => {
    expect(canPatientCancel({ cancelled_at: null, slot_date: '2026-07-10' }, TODAY)).toBe(true)
  })
  it('no cancelable si el slot ya pasó', () => {
    expect(canPatientCancel({ cancelled_at: null, slot_date: '2026-07-01' }, TODAY)).toBe(false)
  })
})
