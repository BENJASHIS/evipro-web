import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { LanguageProvider, LanguageSelect, T } from '@/app/components/Language'
import { Hero, Modalidades } from '@/app/components/home/secciones'
import AgendarForm from '@/app/medicos/[slug]/agendar/AgendarForm'
import { DOCTORS } from '@/lib/doctors'

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
vi.mock('@/app/components/Turnstile', () => ({ default: () => null, TURNSTILE_CLIENT_ENABLED: false }))
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks() })

describe('English public journey', () => {
  it('renders the home page and medical qualification without machine translation', () => {
    render(<LanguageProvider locale="en"><Hero /><Modalidades /><T>Médico Cirujano</T></LanguageProvider>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Better care for ourselves.')
    expect(screen.getByText('Physician')).toBeVisible()
    expect(screen.getByText(/Prescribing depends on the doctor's clinical judgment/)).toBeVisible()
    expect(screen.queryByText('Consulta presencial')).not.toBeInTheDocument()
  })
  it('translates booking controls while sending unchanged values and patient text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ booked: [], booking_id: 'test-booking' }) })
    vi.stubGlobal('fetch', fetchMock)
    render(<LanguageProvider locale="en"><AgendarForm doctor={DOCTORS[0]} /></LanguageProvider>)
    fireEvent.click(screen.getByRole('button', { name: /Home visit/ }))
    fireEvent.change(screen.getByLabelText('Full name *'), { target: { value: 'Test Patient' } })
    fireEvent.change(screen.getByLabelText('WhatsApp / Phone *'), { target: { value: '999999999' } })
    fireEvent.change(screen.getByLabelText('Reason for your visit (optional)'), { target: { value: 'Mi texto original' } })
    fireEvent.click(screen.getByRole('button', { name: 'Request a consultation →' }))
    await screen.findByRole('heading', { name: 'Request received' })
    const sent = fetchMock.mock.calls.find(call => call[0] === '/api/reservar/book')!
    expect(JSON.parse(sent[1].body)).toMatchObject({ modality: 'domicilio', patient_name: 'Test Patient', patient_note: 'Mi texto original' })
    expect(screen.getByRole('link', { name: 'Send details to the doctor →' }).getAttribute('href')).toContain('Hello')
  })
  it('persists the selection and refreshes the server-rendered page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    render(<LanguageProvider locale="es"><LanguageSelect /></LanguageProvider>)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } })
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce())
    expect(fetch).toHaveBeenCalledWith('/api/locale', expect.objectContaining({ body: '{"locale":"en"}' }))
  })
})
