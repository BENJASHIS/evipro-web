import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'

// Las server actions se exponen como endpoints POST y NO heredan el gate de
// app/admin/layout.tsx. Cada una debe verificar admin por su cuenta.
export async function requireAdmin() {
  const { data: { user } } = await (await createServerSupabaseClient()).auth.getUser()
  if (!isAdminUser(user)) throw new Error('No autorizado')
}
