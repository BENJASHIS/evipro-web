import type { MemberAccess } from '@/lib/member-access'

export type NivelModulo = 'completo' | 'parcial' | 'sin_acceso'

export function nivelModulo(access: Pick<MemberAccess, 'isAdmin' | 'hasActiveMembership' | 'planType'>): NivelModulo {
  if (access.isAdmin) return 'completo'
  if (!access.hasActiveMembership) return 'sin_acceso'
  if (access.planType === 'evipro') return 'completo'
  return 'parcial'
}

export function moduloVisible(access: Pick<MemberAccess, 'isAdmin'>, publicado: boolean): boolean {
  return publicado || access.isAdmin
}
