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

function existingLog(log_date = '2026-08-27') {
  return {
    id: log_date, version: 'test', log_date, sleep_hours: 7, sleep_quality: 4,
    sleepiness: 1, water_ml: 1800, alcohol_units: 0, medication_status: 'taken',
    meals_regular: true, symptoms: { pain: 2, anxiety: 1, nausea: 0, dizziness: 0, appetite: 0 },
    created_at: '2026-08-27T00:00:00Z', updated_at: '2026-08-27T01:00:00Z',
  }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-08-28T02:00:00Z'))
  saved.payload = null
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
    if (!init?.method) {
      return jsonResponse({ logs: [], log: null })
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
  vi.useRealTimers()
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
    expect(saved.payload).toMatchObject({
      expected_updated_at: null,
      symptoms: { pain: null, anxiety: null, nausea: null, dizziness: null, appetite: null },
    })
  })

  it('carga el registro de hoy en Lima y conserva los demás valores al editar', async () => {
    const log = existingLog()
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.method) return jsonResponse({ logs: [log], log })
      saved.payload = JSON.parse(String(init.body))
      return jsonResponse({ log: { ...log, ...saved.payload }, alerts: [] })
    }))
    render(<HabitTracker />)
    await waitFor(() => expect(screen.getByLabelText(/^Sueño/)).toHaveValue(7))
    expect(screen.getByLabelText('Fecha')).toHaveValue('2026-08-27')
    fireEvent.change(screen.getByLabelText(/^Agua/), { target: { value: '2000' } })
    fireEvent.click(screen.getByText('Guardar registro'))
    await waitFor(() => expect(saved.payload).toMatchObject({
      sleep_hours: 7, water_ml: 2000, expected_updated_at: '2026-08-27T01:00:00Z',
      symptoms: { pain: 2, anxiety: 1 },
    }))
  })

  it('no permite guardar ni editar antes de cargar el día', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))
    render(<HabitTracker />)
    expect(screen.getByText('Guardar registro')).toBeDisabled()
    expect(screen.getByLabelText(/^Sueño/)).toBeDisabled()
  })

  it.each([
    () => jsonResponse({ error: 'No disponible' }, 500),
    () => jsonResponse({ logs: [] }),
    () => jsonResponse({ logs: [], log: { id: 'incompleto', log_date: '2026-08-27' } }),
  ])('bloquea guardar cuando la carga falla o es incompleta', async response => {
    vi.stubGlobal('fetch', vi.fn(async () => response()))
    render(<HabitTracker />)
    await screen.findByRole('alert')
    expect(screen.getByText('Guardar registro')).toBeDisabled()
  })

  it('consulta la fecha elegida fuera del historial y Hoy vuelve a cargar el registro actual', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const date = new URL(url, 'http://localhost').searchParams.get('date')
      return jsonResponse({ logs: [existingLog()], log: existingLog(date ?? '2026-08-27') })
    }))
    render(<HabitTracker />)
    await waitFor(() => expect(screen.getByLabelText(/^Sueño/)).toHaveValue(7))
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2025-01-01' } })
    expect(screen.getByText('Guardar registro')).toBeDisabled()
    await waitFor(() => expect(screen.getByText('Guardar registro')).toBeEnabled())
    expect(screen.getByLabelText(/^Sueño/)).toHaveValue(7)
    fireEvent.click(screen.getByText('Hoy'))
    await waitFor(() => expect(screen.getByLabelText('Fecha')).toHaveValue('2026-08-27'))
    await waitFor(() => expect(screen.getByText('Guardar registro')).toBeEnabled())
    expect(screen.getByLabelText('Dolor')).toHaveValue('2')
  })

  it('bloquea el formulario ante un conflicto y permite recargar la versión vigente', async () => {
    let log = existingLog()
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.method) return jsonResponse({ logs: [log], log })
      log = { ...log, sleep_hours: 9, updated_at: '2026-08-27T02:00:00Z' }
      return jsonResponse({ error: 'El registro cambió. Vuelve a cargarlo antes de guardar.' }, 409)
    }))
    render(<HabitTracker />)
    await waitFor(() => expect(screen.getByLabelText(/^Sueño/)).toHaveValue(7))
    fireEvent.click(screen.getByText('Guardar registro'))
    await screen.findByRole('alert')
    expect(screen.getByText('Guardar registro')).toBeDisabled()
    fireEvent.click(screen.getByText('Volver a cargar'))
    await waitFor(() => expect(screen.getByLabelText(/^Sueño/)).toHaveValue(9))
    expect(screen.getByText('Guardar registro')).toBeEnabled()
  })

  it.each([400, 429])('conserva el borrador editable cuando el servidor rechaza sin escribir (%s)', async status => {
    const log = existingLog()
    let rejected = false
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.method) return jsonResponse({ logs: [log], log })
      if (!rejected) {
        rejected = true
        return jsonResponse({ error: 'Corrige los datos o vuelve a intentar.' }, status)
      }
      saved.payload = JSON.parse(String(init.body))
      return jsonResponse({ log: { ...log, ...saved.payload }, alerts: [] })
    }))
    render(<HabitTracker />)
    await waitFor(() => expect(screen.getByLabelText(/^Sueño/)).toHaveValue(7))
    fireEvent.change(screen.getByLabelText(/^Sueño/), { target: { value: '25' } })
    fireEvent.change(screen.getByLabelText(/^Agua/), { target: { value: '1500.5' } })
    fireEvent.click(screen.getByText('Guardar registro'))
    await screen.findByRole('alert')
    expect(screen.getByText('Guardar registro')).toBeEnabled()
    expect(screen.getByLabelText(/^Sueño/)).toBeEnabled()
    expect(screen.getByLabelText(/^Sueño/)).toHaveValue(25)
    expect(screen.getByLabelText(/^Agua/)).toHaveValue(1500.5)
    expect(screen.queryByText('Volver a cargar')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/^Sueño/), { target: { value: '8' } })
    fireEvent.change(screen.getByLabelText(/^Agua/), { target: { value: '1500' } })
    fireEvent.click(screen.getByText('Guardar registro'))
    await waitFor(() => expect(saved.payload).toMatchObject({
      sleep_hours: 8, water_ml: 1500, expected_updated_at: '2026-08-27T01:00:00Z',
      symptoms: { pain: 2, anxiety: 1 },
    }))
    expect(await screen.findByText('Registro guardado.')).toBeInTheDocument()
  })

  it('exige recargar si se pierde la respuesta de un guardado que pudo completarse', async () => {
    let log = existingLog()
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.method) return jsonResponse({ logs: [log], log })
      log = { ...log, sleep_hours: 9, updated_at: '2026-08-27T02:00:00Z' }
      throw new TypeError('Failed to fetch')
    }))
    render(<HabitTracker />)
    await waitFor(() => expect(screen.getByLabelText(/^Sueño/)).toHaveValue(7))
    fireEvent.click(screen.getByText('Guardar registro'))
    await screen.findByRole('alert')
    expect(screen.getByText('Guardar registro')).toBeDisabled()
    expect(screen.getByLabelText(/^Sueño/)).toBeDisabled()
    fireEvent.click(screen.getByText('Volver a cargar'))
    await waitFor(() => expect(screen.getByLabelText(/^Sueño/)).toHaveValue(9))
    expect(screen.getByText('Guardar registro')).toBeEnabled()
  })

  it('no permite cambiar de fecha mientras guarda', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.method) return jsonResponse({ logs: [], log: null })
      return new Promise<Response>(() => {})
    }))
    render(<HabitTracker />)
    await screen.findByText('Aún no hay registros guardados.')
    fireEvent.click(screen.getByText('Guardar registro'))
    expect(screen.getByLabelText('Fecha')).toBeDisabled()
    expect(screen.getByText('Hoy')).toBeDisabled()
  })
})
