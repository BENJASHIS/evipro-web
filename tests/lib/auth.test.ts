import { describe, it, expect } from 'vitest'
import { isAdminUser, ADMIN_EMAILS } from '../../lib/auth'

describe('isAdminUser', () => {
  it('true si role es admin', () => {
    expect(isAdminUser({ user_metadata: { role: 'admin' } })).toBe(true)
  })
  it('true si el email está en la lista de admins', () => {
    expect(isAdminUser({ email: ADMIN_EMAILS[0] })).toBe(true)
  })
  it('true si el email coincide sin importar mayúsculas', () => {
    expect(isAdminUser({ email: ADMIN_EMAILS[0].toUpperCase() })).toBe(true)
  })
  it('false si role no es admin y el email no está en la lista', () => {
    expect(isAdminUser({ email: 'otro@example.com', user_metadata: { role: 'member' } })).toBe(false)
  })
  it('false si no hay metadata', () => {
    expect(isAdminUser({})).toBe(false)
  })
  it('false si user es null', () => {
    expect(isAdminUser(null)).toBe(false)
  })
})
