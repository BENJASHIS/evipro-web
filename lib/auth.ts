// Lista de cuentas con privilegios de administración. Fuente de verdad única
// para el gate del panel admin (app/admin/layout.tsx) y para isAdminUser().
export const ADMIN_EMAILS = ['drecs2003@gmail.com', 'consulta@evipro.pe']

export function isAdminUser(
  user: { email?: string | null } | null,
): boolean {
  if (!user) return false
  // Solo la allowlist de emails. NO confiar en user_metadata: es editable por el
  // propio usuario (supabase.auth.updateUser) → sería escalada a admin.
  const email = user.email?.toLowerCase() ?? ''
  return ADMIN_EMAILS.includes(email)
}
