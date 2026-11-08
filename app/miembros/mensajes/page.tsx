'use client'
import { T, useLanguage } from '@/app/components/Language'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Message } from '@/lib/types'

const SUGERENCIA_PREFIX = '💡 Sugerencia de contenido: '

export default function MensajesPage() {
  const { t, locale } = useLanguage()
  const searchParams = useSearchParams()
  const sugerirContenido = searchParams.get('sugerir') === '1'
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState(() => (sugerirContenido ? t(SUGERENCIA_PREFIX) : ''))
  const [sending, setSending] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [adminPreview, setAdminPreview] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function load() {
    const res = await fetch('/api/messages')
    if (res.status === 403) { setBlocked(true); setLoaded(true); return }
    const data = await res.json()
    setMessages(data.messages ?? [])
    setAdminPreview(Boolean(data.adminPreview))
    setLoaded(true)
  }
  useEffect(() => {
    async function run() { await load() }
    run()
  }, [])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    setSending(false)
    if (res.ok) { setBody(''); await load() }
  }

  if (loaded && blocked) {
    return (
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>Mensajes</T></p>
        <h1 className="text-3xl font-light font-serif italic mb-8"><T>Mensajería</T></h1>
        <div className="border border-subtle rounded-lg p-8 text-center">
          <p className="text-muted text-sm"><T>Necesitas una suscripción activa para usar este canal.</T></p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-brand mb-2"><T>Mensajes</T></p>
      <h1 className="text-3xl font-light font-serif italic mb-4"><T>Mensajería con la clínica</T></h1>
      {adminPreview && (
        <div className="border border-brand/30 bg-brand/5 rounded-lg p-4 mb-4">
          <p className="text-brand text-sm">
            <T>Modo admin · vista previa del canal de mensajería (sin membresía activa).</T>
          </p>
        </div>
      )}
      <div className="border border-brand/30 bg-brand/5 rounded-lg p-4 mb-6">
        <p className="text-muted text-xs">
          <T>Canal de coordinación y soporte. No reemplaza una consulta médica; ante una urgencia clínica agenda una consulta.</T>
        </p>
      </div>

      <div className="space-y-3 mb-6 min-h-[8rem]">
        {messages.length === 0 && loaded && (
          <p className="text-faint text-sm"><T>Aún no hay mensajes. Escríbenos abajo.</T></p>
        )}
        {messages.map(m => (
          <div key={m.id} className={m.sender_role === 'member' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
              m.sender_role === 'member' ? 'bg-brand-deep text-white' : 'border border-subtle text-white'
            }`}>
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className="text-[10px] text-faint font-mono mt-1">
                {new Date(m.created_at).toLocaleString(locale === 'en' ? 'en-US' : 'es-PE')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="border border-subtle rounded-lg p-4 space-y-3">
        <textarea
          value={body} onChange={e => setBody(e.target.value)} rows={3} maxLength={2000}
          placeholder={t("Escribe tu mensaje...")}
          className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand resize-none"
        />
        <button type="submit" disabled={sending || !body.trim()}
          className="w-full py-2 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-50">
          <T>{sending ? 'Enviando...' : 'Enviar'}</T>
        </button>
      </form>
    </div>
  )
}
