import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { LanguageProvider } from '../../app/components/Language'
import Guia from '../../app/miembros/recetas/Guia'
import MensajesPage from '../../app/miembros/mensajes/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('Member interface language', () => {
  it('translates pharmacy controls and preserves the tracking code', () => {
    render(<LanguageProvider locale="en"><Guia codigo="GUÍA-PERÚ-123" /></LanguageProvider>)
    expect(screen.getByRole('button', { name: 'copy' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'track on Shalom →' })).toHaveAttribute('href', 'https://shalom.com.pe/rastrea')
    expect(screen.getByText('GUÍA-PERÚ-123')).toBeInTheDocument()
  })

  it('translates messaging controls and dates without translating received messages', async () => {
    const createdAt = '2026-11-08T14:00:00Z'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ messages: [{ id: '1', sender_role: 'member', body: 'Mi mensaje personal en español', created_at: createdAt }] }),
    }))
    render(<LanguageProvider locale="en"><MensajesPage /></LanguageProvider>)
    expect(screen.getByRole('heading', { name: 'Message the clinic' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Write your message...')).toBeInTheDocument()
    expect(await screen.findByText('Mi mensaje personal en español')).toBeInTheDocument()
    expect(screen.getByText(new Date(createdAt).toLocaleString('en-US'))).toBeInTheDocument()
  })

  it('keeps the Spanish pharmacy interface when selected', () => {
    render(<LanguageProvider locale="es"><Guia codigo="123" /></LanguageProvider>)
    expect(screen.getByRole('button', { name: 'copiar' })).toBeInTheDocument()
  })
})
