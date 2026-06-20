import type { SenderRole } from '@/lib/types'

export const MAX_MESSAGE_LENGTH = 2000

export interface MessageBodyValidation {
  ok: boolean
  error?: string
  body?: string
}

export function validateMessageBody(raw: unknown): MessageBodyValidation {
  if (typeof raw !== 'string') return { ok: false, error: 'Mensaje inválido' }
  const body = raw.trim()
  if (!body) return { ok: false, error: 'El mensaje no puede estar vacío' }
  if (body.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres` }
  }
  return { ok: true, body }
}

export function buildPreview(body: string, max = 80): string {
  const clean = body.trim().replace(/\s+/g, ' ')
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + '…'
}

export interface ConversationUnreadInput {
  last_message_at: string | null
  last_sender_role: SenderRole | null
  member_last_read_at: string | null
  admin_last_read_at: string | null
}

export function hasUnread(conv: ConversationUnreadInput, side: SenderRole): boolean {
  if (!conv.last_message_at || !conv.last_sender_role) return false
  if (conv.last_sender_role === side) return false
  const lastRead = side === 'member' ? conv.member_last_read_at : conv.admin_last_read_at
  if (!lastRead) return true
  return new Date(conv.last_message_at).getTime() > new Date(lastRead).getTime()
}
