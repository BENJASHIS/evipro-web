export function isAdminUser(user: { user_metadata?: { role?: string } } | null): boolean {
  return user?.user_metadata?.role === 'admin'
}
