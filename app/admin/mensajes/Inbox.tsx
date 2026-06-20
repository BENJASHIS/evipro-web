'use client'
import { useState, useEffect } from 'react'
import type { Message } from '@/lib/types'

interface ConvRow {
  user_id: string
  email: string | null
  last_message_preview: string | null
  last_message_at: string | null
  unread: boolean
}

export default function Inbox() {
  const [convs, setConvs] = useState<ConvRow[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  async function loadConvs() {
    const res = await fetch('/api/admin/messages')
    const data = await res.json()
    setConvs(data.conversations ?? [])
  }
  useEffect(() => {
    async function run() { await loadConvs() }
    run()
  }, [])

  async function openConv(userId: string) {
    setActive(userId)
    const res = await fetch(`/api/admin/messages/${userId}`)
    const data = await res.json()
    setMessages(data.messages ?? [])
    loadConvs()
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!active || !body.trim()) return
    setSending(true)
    const res = await fetch(`/api/admin/messages/${active}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    setSending(false)
    if (res.ok) { setBody(''); openConv(active) }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 border border-subtle rounded-lg divide-y divide-subtle max-h-[32rem] overflow-y-auto">
        {convs.length === 0 && <p className="text-faint text-sm p-4">Sin conversaciones.</p>}
        {convs.map(c => (
          <button key={c.user_id} onClick={() => openConv(c.user_id)}
            className={`w-full text-left p-3 hover:bg-white/5 transition-colors ${active === c.user_id ? 'bg-white/5' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white truncate">{c.email ?? c.user_id}</span>
              {c.unread && <span className="w-2 h-2 rounded-full bg-brand shrink-0 ml-2" />}
            </div>
            <p className="text-xs text-faint truncate">{c.last_message_preview ?? '—'}</p>
          </button>
        ))}
      </div>

      <div className="md:col-span-2 border border-subtle rounded-lg p-4 flex flex-col min-h-[32rem]">
        {!active && <p className="text-faint text-sm">Selecciona una conversación.</p>}
        {active && (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto mb-4">
              {messages.map(m => (
                <div key={m.id} className={m.sender_role === 'admin' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                    m.sender_role === 'admin' ? 'bg-brand-deep text-white' : 'border border-subtle text-white'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className="text-[10px] text-faint font-mono mt-1">{new Date(m.created_at).toLocaleString('es-PE')}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="space-y-2">
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={2} maxLength={2000}
                placeholder="Responder..."
                className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand resize-none" />
              <button type="submit" disabled={sending || !body.trim()}
                className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50">
                {sending ? 'Enviando...' : 'Responder'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
