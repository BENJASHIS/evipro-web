import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
import { validateMessageBody, buildPreview } from '@/lib/messages'

const CONV_COLS = 'id, user_id, last_message_at, last_message_preview, last_sender_role, member_last_read_at, admin_last_read_at, created_at'
const MSG_COLS = 'id, conversation_id, sender_role, body, created_at'

async function getConversation(service: ReturnType<typeof createServiceClient>, userId: string) {
  const { data } = await service.from('conversations').select(CONV_COLS).eq('user_id', userId).maybeSingle()
  return data
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { userId } = await params
  const service = createServiceClient()
  const conversation = await getConversation(service, userId)
  if (!conversation) return NextResponse.json({ conversation: null, messages: [] })

  const { data: messages } = await service.from('messages').select(MSG_COLS)
    .eq('conversation_id', conversation.id).order('created_at', { ascending: true }).limit(50)

  await service.from('conversations')
    .update({ admin_last_read_at: new Date().toISOString() }).eq('id', conversation.id)

  return NextResponse.json({ conversation, messages: messages ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { userId } = await params
  const { body } = await req.json().catch(() => ({ body: null }))
  const valid = validateMessageBody(body)
  if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 })

  const service = createServiceClient()
  const conversation = await getConversation(service, userId)
  if (!conversation) return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })

  const { data: message, error } = await service.from('messages')
    .insert({ conversation_id: conversation.id, sender_role: 'admin', body: valid.body })
    .select(MSG_COLS).single()
  if (error || !message) return NextResponse.json({ error: 'Error enviando el mensaje' }, { status: 500 })

  await service.from('conversations').update({
    last_message_at: message.created_at,
    last_message_preview: buildPreview(valid.body!),
    last_sender_role: 'admin',
    admin_last_read_at: message.created_at,
  }).eq('id', conversation.id)

  return NextResponse.json({ message })
}
