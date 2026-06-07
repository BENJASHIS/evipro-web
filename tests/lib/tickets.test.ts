import { describe, it, expect } from 'vitest'
import { generateTicketCode, generateTicketBatch } from '../../lib/tickets'

describe('generateTicketCode', () => {
  it('genera código con formato EVP-YYYY-NNNNN', () => {
    const code = generateTicketCode(42)
    const year = new Date().getFullYear()
    expect(code).toBe(`EVP-${year}-00042`)
  })

  it('rellena con ceros hasta 5 dígitos', () => {
    expect(generateTicketCode(1)).toMatch(/EVP-\d{4}-00001/)
    expect(generateTicketCode(99999)).toMatch(/EVP-\d{4}-99999/)
  })
})

describe('generateTicketBatch', () => {
  it('genera N tickets únicos', () => {
    const tickets = generateTicketBatch(3, 100)
    expect(tickets).toHaveLength(3)
    expect(tickets[0]).toBe(`EVP-${new Date().getFullYear()}-00100`)
    expect(tickets[1]).toBe(`EVP-${new Date().getFullYear()}-00101`)
    expect(tickets[2]).toBe(`EVP-${new Date().getFullYear()}-00102`)
  })

  it('genera 0 tickets si qty es 0', () => {
    expect(generateTicketBatch(0, 50)).toHaveLength(0)
  })
})
