import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
import { hasUnread } from '@/lib/messages'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) return NextResponse.json({ count: 0 })

  const service = createServiceClient()
  const { data: convs } = await service.from('conversations')
    .select('last_message_at, last_sender_role, member_last_read_at, admin_last_read_at')
  const count = (convs ?? []).filter(c => hasUnread(c, 'admin')).length
  return NextResponse.json({ count })
}
