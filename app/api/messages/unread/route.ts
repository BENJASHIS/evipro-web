import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { hasUnread } from '@/lib/messages'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ count: 0 })

  const service = createServiceClient()
  const { data: conv } = await service.from('conversations')
    .select('last_message_at, last_sender_role, member_last_read_at, admin_last_read_at')
    .eq('user_id', user.id).maybeSingle()

  const count = conv && hasUnread(conv, 'member') ? 1 : 0
  return NextResponse.json({ count })
}
