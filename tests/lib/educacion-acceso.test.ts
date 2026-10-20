import { it, expect } from 'vitest'
import { buildMemberAccess } from '@/lib/member-access'
import { ADMIN_EMAILS } from '@/lib/auth'
import { nivelModulo, moduloVisible } from '@/lib/educacion/acceso-modulo'

const socio = (type: string | null) => buildMemberAccess({ id: 'u', email: 'p@example.com' }, type ? { id: 's', membership_plans: { type } } : null)
const admin = buildMemberAccess({ id: 'a', email: ADMIN_EMAILS[0] }, null)

it('Membresía EVIPro ve todo', () => expect(nivelModulo(socio('evipro'))).toBe('completo'))
it.each(['basica', 'turista_inicio', 'turista_plus', 'acceso'])('%s ve la parte abierta', t => expect(nivelModulo(socio(t))).toBe('parcial'))
it('sin membresía no accede', () => expect(nivelModulo(socio(null))).toBe('sin_acceso'))
it('admin sin membresía ve todo', () => expect(nivelModulo(admin)).toBe('completo'))
it('sin publicar solo lo ve el admin', () => {
  expect(moduloVisible(socio('evipro'), false)).toBe(false)
  expect(moduloVisible(admin, false)).toBe(true)
  expect(moduloVisible(socio('basica'), true)).toBe(true)
})
