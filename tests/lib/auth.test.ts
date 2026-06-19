import { describe, it, expect } from 'vitest'
import { isAdminUser } from '../../lib/auth'

describe('isAdminUser', () => {
  it('true si role es admin', () => {
    expect(isAdminUser({ user_metadata: { role: 'admin' } })).toBe(true)
  })
  it('false si role no es admin', () => {
    expect(isAdminUser({ user_metadata: { role: 'member' } })).toBe(false)
  })
  it('false si no hay metadata', () => {
    expect(isAdminUser({})).toBe(false)
  })
  it('false si user es null', () => {
    expect(isAdminUser(null)).toBe(false)
  })
})
