import { describe, it, expect } from 'vitest'
import { isAdminUser, ADMIN_EMAILS } from '../../lib/auth'

describe('isAdminUser', () => {
  it('NO da admin por user_metadata.role (el usuario lo edita → escalada)', () => {
    expect(isAdminUser({ email: 'otro@example.com', user_metadata: { role: 'admin' } } as { email?: string | null })).toBe(false)
  })
  it('true si el email está en la lista de admins', () => {
    expect(isAdminUser({ email: ADMIN_EMAILS[0] })).toBe(true)
  })
  it('true si el email coincide sin importar mayúsculas', () => {
    expect(isAdminUser({ email: ADMIN_EMAILS[0].toUpperCase() })).toBe(true)
  })
  it('false si el email no está en la lista', () => {
    expect(isAdminUser({ email: 'otro@example.com' })).toBe(false)
  })
  it('false si no hay metadata', () => {
    expect(isAdminUser({})).toBe(false)
  })
  it('false si user es null', () => {
    expect(isAdminUser(null)).toBe(false)
  })
})
