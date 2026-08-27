import { describe, expect, it } from 'vitest'
import { ADMIN_EMAILS } from '../../lib/auth'
import { buildMemberAccess, canUseMemberTools } from '../../lib/member-access'

describe('member access', () => {
  it('habilita herramientas cuando hay suscripción activa', () => {
    const access = buildMemberAccess(
      { id: 'u1', email: 'paciente@example.com' },
      { id: 's1', membership_plans: { type: 'evipro' } },
    )
    expect(access.hasActiveMembership).toBe(true)
    expect(access.adminPreview).toBe(false)
    expect(access.planType).toBe('evipro')
    expect(canUseMemberTools(access)).toBe(true)
  })

  it('bloquea herramientas si no hay suscripción activa', () => {
    const access = buildMemberAccess({ id: 'u1', email: 'paciente@example.com' }, null)
    expect(access.hasActiveMembership).toBe(false)
    expect(access.adminPreview).toBe(false)
    expect(canUseMemberTools(access)).toBe(false)
  })

  it('permite vista previa al admin sin convertirlo en miembro activo', () => {
    const access = buildMemberAccess({ id: 'admin', email: ADMIN_EMAILS[0] }, null)
    expect(access.hasActiveMembership).toBe(false)
    expect(access.adminPreview).toBe(true)
    expect(canUseMemberTools(access)).toBe(true)
  })
})
