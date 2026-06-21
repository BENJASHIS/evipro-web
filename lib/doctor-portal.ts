import { createHmac, timingSafeEqual } from 'node:crypto'

// Token de acceso al portal del médico: HMAC-SHA256 del slug con un secreto del
// servidor (DOCTOR_PORTAL_SECRET). Estable por médico, revocable rotando el
// secreto. No requiere cuentas: el médico abre un link privado con su token.
export function doctorPortalToken(
  slug: string,
  secret = process.env.DOCTOR_PORTAL_SECRET ?? '',
): string {
  return createHmac('sha256', secret).update(slug).digest('hex')
}

export function verifyDoctorPortalToken(
  slug: string,
  token: string | undefined | null,
  secret = process.env.DOCTOR_PORTAL_SECRET ?? '',
): boolean {
  if (!secret || !token) return false
  const expected = doctorPortalToken(slug, secret)
  if (token.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}
