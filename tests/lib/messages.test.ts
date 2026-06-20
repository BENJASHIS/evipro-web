import { describe, it, expect } from 'vitest'
import {
  validateMessageBody,
  buildPreview,
  hasUnread,
  MAX_MESSAGE_LENGTH,
} from '../../lib/messages'

describe('validateMessageBody', () => {
  it('acepta un mensaje válido y lo recorta', () => {
    expect(validateMessageBody('  hola  ')).toEqual({ ok: true, body: 'hola' })
  })
  it('rechaza vacío', () => {
    const r = validateMessageBody('   ')
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/vacío/)
  })
  it('rechaza no-string', () => {
    expect(validateMessageBody(42).ok).toBe(false)
  })
  it('rechaza sobre el límite', () => {
    const r = validateMessageBody('a'.repeat(MAX_MESSAGE_LENGTH + 1))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/2000/)
  })
})

describe('buildPreview', () => {
  it('colapsa espacios y deja corto intacto', () => {
    expect(buildPreview('hola   mundo')).toBe('hola mundo')
  })
  it('trunca con elipsis', () => {
    expect(buildPreview('a'.repeat(100), 10)).toBe('aaaaaaaaa…')
  })
})

describe('hasUnread', () => {
  const base = {
    last_message_at: '2026-06-20T10:00:00Z',
    last_sender_role: 'admin' as const,
    member_last_read_at: null,
    admin_last_read_at: null,
  }
  it('sin mensajes → false', () => {
    expect(hasUnread({ ...base, last_message_at: null, last_sender_role: null }, 'member')).toBe(false)
  })
  it('último del otro lado y nunca leído → true', () => {
    expect(hasUnread(base, 'member')).toBe(true)
  })
  it('último del mismo lado → false', () => {
    expect(hasUnread(base, 'admin')).toBe(false)
  })
  it('leído después del último mensaje → false', () => {
    expect(hasUnread({ ...base, member_last_read_at: '2026-06-20T11:00:00Z' }, 'member')).toBe(false)
  })
  it('leído antes del último mensaje → true', () => {
    expect(hasUnread({ ...base, member_last_read_at: '2026-06-20T09:00:00Z' }, 'member')).toBe(true)
  })
})
