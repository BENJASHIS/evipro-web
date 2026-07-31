import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PropuestaForm from '../../app/aliados/PropuestaForm'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) }),
  ))
})

const CAMPOS: [RegExp, string][] = [
  [/Nombre/, 'Ana Quispe'],
  [/WhatsApp/, '987654321'],
  [/Correo/, 'ana@fisio.pe'],
  [/Profesi/, 'Fisioterapeuta'],
  [/Ciudad/, 'Cusco'],
  [/Qué quieres hacer/, 'Derivar pacientes con dolor cronico.'],
  [/Qué pones/, 'Consultorio y dos terapeutas.'],
  [/Qué necesitas/, 'Criterios de derivacion.'],
]

function llenar() {
  for (const [etiqueta, valor] of CAMPOS) {
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })
  }
}

describe('PropuestaForm', () => {
  it('pide las tres cosas concretas, que son el filtro', () => {
    render(<PropuestaForm />)
    expect(screen.getByLabelText(/Qué quieres hacer/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Qué pones/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Qué necesitas/)).toBeInTheDocument()
  })

  it('la colegiatura se pide como opcional', () => {
    render(<PropuestaForm />)
    expect(screen.getByLabelText(/Colegiatura/)).not.toBeRequired()
  })

  it('envia la propuesta y muestra el acuse', async () => {
    render(<PropuestaForm />)
    llenar()
    fireEvent.click(screen.getByRole('button', { name: /Enviar propuesta/ }))
    await waitFor(() =>
      expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/propuestas'),
    )
    expect(await screen.findByText(/La recibimos/)).toBeInTheDocument()
  })

  it('muestra el error que devuelve el servidor', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Falta ciudad.' }),
    } as Response)
    render(<PropuestaForm />)
    llenar()
    fireEvent.click(screen.getByRole('button', { name: /Enviar propuesta/ }))
    expect(await screen.findByText('Falta ciudad.')).toBeInTheDocument()
  })
})
