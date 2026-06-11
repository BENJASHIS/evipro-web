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
  it('messaging is S/.3 for recurring', () => {
    expect(getPrice('messaging', false)).toBe(3)
  })
  it('whatsapp is free for first session', () => {
    expect(getPrice('whatsapp', true)).toBe(0)
  })
  it('whatsapp is S/.3 for recurring', () => {
    expect(getPrice('whatsapp', false)).toBe(3)
  })
})

describe('getPaymentMethod', () => {
  it('zero price returns free', () => {
    expect(getPaymentMethod(0)).toBe('free')
  })
  it('S/.15 returns culqi', () => {
    expect(getPaymentMethod(15)).toBe('culqi')
  })
  it('S/.3 returns culqi', () => {
    expect(getPaymentMethod(3)).toBe('culqi')
  })
})
