import { isAdminUser } from '@/lib/auth'
import type { SupabaseClient } from '@supabase/supabase-js'

type UserLike = {
  id: string
  email?: string | null
}

type PlanJoin = { type?: string | null } | null

type ActiveSubscriptionRow = {
  id: string
  membership_plans?: PlanJoin | PlanJoin[] | null
} | null

export type MemberAccess = {
  user: UserLike
  isAdmin: boolean
  hasActiveMembership: boolean
  adminPreview: boolean
  subscriptionId: string | null
  planType: string | null
}

function joinedPlan(row: ActiveSubscriptionRow): PlanJoin {
  if (!row?.membership_plans) return null
  return Array.isArray(row.membership_plans) ? row.membership_plans[0] ?? null : row.membership_plans
}

export function buildMemberAccess(user: UserLike, subscription: ActiveSubscriptionRow): MemberAccess {
  const isAdmin = isAdminUser(user)
  const hasActiveMembership = Boolean(subscription)
  const plan = joinedPlan(subscription)
  return {
    user,
    isAdmin,
    hasActiveMembership,
    adminPreview: isAdmin && !hasActiveMembership,
    subscriptionId: subscription?.id ?? null,
    planType: plan?.type ?? null,
  }
}

export function canUseMemberTools(access: Pick<MemberAccess, 'hasActiveMembership' | 'adminPreview'>) {
  return access.hasActiveMembership || access.adminPreview
}

export async function getMemberAccess(
  supabase: SupabaseClient,
  user: UserLike,
): Promise<MemberAccess> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, membership_plans(type)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return buildMemberAccess(user, (subscription ?? null) as ActiveSubscriptionRow)
}
