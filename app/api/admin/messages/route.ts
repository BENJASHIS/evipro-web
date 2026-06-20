import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
import { hasUnread } from '@/lib/messages'

const CONV_COLS = 'id, user_id, last_message_at, last_message_preview, last_sender_role, member_last_read_at, admin_last_read_at, created_at'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const service = createServiceClient()
  const { data: convs } = await service.from('conversations')
    .select(CONV_COLS).order('last_message_at', { ascending: false, nullsFirst: false }).limit(100)

  const { data: usersList } = await service.auth.admin.listUsers({ perPage: 1000 })
  const emailById = new Map((usersList?.users ?? []).map(u => [u.id, u.email ?? null]))

  const conversations = (convs ?? []).map(c => ({
    ...c,
    email: emailById.get(c.user_id) ?? null,
    unread: hasUnread(c, 'admin'),
  }))
  return NextResponse.json({ conversations })
}
