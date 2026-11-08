import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/components/Language'
import PagoReserva from '@/app/medicos/[slug]/agendar/PagoReserva'

afterEach(() => vi.unstubAllGlobals())

it('prepares a payment notification in English while preserving the transaction reference', async () => {
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => new Response(JSON.stringify(init ? { ok: true } : {
    estado: 'pending_payment', pagada: false, vencida: false,
    slot_date: '2026-11-03', slot_time: '09:00', modality: 'virtual', monto: 70,
    pago_hasta: '2099-11-01T21:00:00.000Z', medios: ['yape'], whatsapp: '51942185939',
  }), { status: 200 })))
  render(<LanguageProvider locale="en"><PagoReserva reservaId="r1" /></LanguageProvider>)
  fireEvent.change(await screen.findByRole('textbox'), { target: { value: 'REF-001' } })
  fireEvent.click(screen.getByRole('button', { name: "I've paid" }))
  const link = await screen.findByRole('link', { name: 'Notify the doctor' })
  expect(new URL(link.getAttribute('href')!).searchParams.get('text')).toBe(
    'I paid for my booking on 2026-11-03 09:00, Yape transaction REF-001')
})
