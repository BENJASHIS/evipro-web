// Lista de cuentas con privilegios de administración. Fuente de verdad única
// para el gate del panel admin (app/admin/layout.tsx) y para isAdminUser().
export const ADMIN_EMAILS = ['drecs2003@gmail.com', 'consulta@evipro.pe']

export function isAdminUser(
  user: { email?: string | null; user_metadata?: { role?: string } } | null,
): boolean {
  if (!user) return false
  const email = user.email?.toLowerCase() ?? ''
  if (ADMIN_EMAILS.includes(email)) return true
  return user.user_metadata?.role === 'admin'
}
