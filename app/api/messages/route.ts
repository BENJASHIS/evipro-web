import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { validateMessageBody, buildPreview } from '@/lib/messages'

const CONV_COLS = 'id, user_id, last_message_at, last_message_preview, last_sender_role, member_last_read_at, admin_last_read_at, created_at'
const MSG_COLS = 'id, conversation_id, sender_role, body, created_at'

async function getOrCreateConversation(service: ReturnType<typeof createServiceClient>, userId: string) {
  const { data: existing } = await service.from('conversations').select(CONV_COLS).eq('user_id', userId).maybeSingle()
  if (existing) return existing
  const { data: created } = await service.from('conversations').insert({ user_id: userId }).select(CONV_COLS).single()
  return created
}

async function requireActiveMember(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }
  const { data: sub } = await supabase
    .from('subscriptions').select('id').eq('user_id', user.id).eq('status', 'active').maybeSingle()
  if (!sub) return { error: NextResponse.json({ error: 'Necesitas una suscripción activa' }, { status: 403 }) }
  return { user }
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const auth = await requireActiveMember(supabase)
  if (auth.error) return auth.error

  const service = createServiceClient()
  const conversation = await getOrCreateConversation(service, auth.user.id)
  if (!conversation) return NextResponse.json({ error: 'Error creando la conversación' }, { status: 500 })

  const { data: messages } = await service
    .from('messages').select(MSG_COLS)
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true }).limit(50)

  await service.from('conversations')
    .update({ member_last_read_at: new Date().toISOString() }).eq('id', conversation.id)

  return NextResponse.json({ conversation, messages: messages ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const auth = await requireActiveMember(supabase)
  if (auth.error) return auth.error

  const { body } = await req.json().catch(() => ({ body: null }))
  const valid = validateMessageBody(body)
  if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 })

  const service = createServiceClient()
  const conversation = await getOrCreateConversation(service, auth.user.id)
  if (!conversation) return NextResponse.json({ error: 'Error creando la conversación' }, { status: 500 })

  const { data: message, error } = await service.from('messages')
    .insert({ conversation_id: conversation.id, sender_role: 'member', body: valid.body })
    .select('id, conversation_id, sender_role, body, created_at').single()
  if (error || !message) return NextResponse.json({ error: 'Error enviando el mensaje' }, { status: 500 })

  await service.from('conversations').update({
    last_message_at: message.created_at,
    last_message_preview: buildPreview(valid.body!),
    last_sender_role: 'member',
    member_last_read_at: message.created_at,
  }).eq('id', conversation.id)

  return NextResponse.json({ message })
}
