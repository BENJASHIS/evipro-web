import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HabitTracker from '../../app/miembros/herramientas/habitos/HabitTracker'

const saved = vi.hoisted(() => ({
  payload: null as Record<string, unknown> | null,
}))

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  saved.payload = null
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
    if (!init?.method) {
      return jsonResponse({ logs: [], summary: { daysLogged: 0 } })
    }

    saved.payload = JSON.parse(String(init.body)) as Record<string, unknown>
    return jsonResponse({
      log: {
        id: 'h1',
        version: 'test',
        ...saved.payload,
        created_at: '2026-08-27T00:00:00Z',
        updated_at: '2026-08-27T00:00:00Z',
      },
      alerts: [],
    })
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('HabitTracker', () => {
  it('muestra registro, resumen y alertas prudentes', async () => {
    render(<HabitTracker />)

    expect(screen.getByText('Registro diario')).toBeInTheDocument()
    expect(screen.getByText('Resumen semanal')).toBeInTheDocument()
    expect(screen.getByText('Alertas prudentes')).toBeInTheDocument()
    expect(await screen.findByText('Aún no hay registros guardados.')).toBeInTheDocument()
  })

  it('actualiza alertas y guarda un registro saneado', async () => {
    render(<HabitTracker />)
    await screen.findByText('Aún no hay registros guardados.')

    fireEvent.change(screen.getByLabelText(/alcohol/i), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/somnolencia/i), { target: { value: '2' } })

    expect(screen.getByText('Alcohol y somnolencia el mismo día: coméntalo en consulta si se repite.')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Guardar registro'))

    await waitFor(() => expect(saved.payload).not.toBeNull())
    expect(saved.payload).toMatchObject({
      alcohol_units: 2,
      sleepiness: 2,
      medication_status: 'not_applicable',
    })
    expect(saved.payload).not.toHaveProperty('user_id')
  })
})
