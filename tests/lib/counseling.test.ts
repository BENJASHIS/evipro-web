import { describe, it, expect } from 'vitest'
import { getPrice, getPaymentMethod } from '../../lib/counseling'

describe('getPrice', () => {
  it('video is S/.15 for first session', () => {
    expect(getPrice('video', true)).toBe(15)
  })
  it('video is S/.15 for recurring', () => {
    expect(getPrice('video', false)).toBe(15)
  })
  it('messaging is free for first session', () => {
    expect(getPrice('messaging', true)).toBe(0)
  })
  it('messaging is S/.5 for recurring', () => {
    expect(getPrice('messaging', false)).toBe(5)
  })
  it('whatsapp is S/.5 for first session (sin 1ra gratis)', () => {
    expect(getPrice('whatsapp', true)).toBe(5)
  })
  it('whatsapp is S/.5 for recurring', () => {
    expect(getPrice('whatsapp', false)).toBe(5)
  })
})

describe('getPaymentMethod', () => {
  it('zero price returns free', () => {
    expect(getPaymentMethod(0)).toBe('free')
  })
  it('S/.15 returns mercadopago', () => {
    expect(getPaymentMethod(15)).toBe('mercadopago')
  })
  it('S/.3 returns mercadopago', () => {
    expect(getPaymentMethod(3)).toBe('mercadopago')
  })
})
