import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Guia from '../../app/miembros/recetas/Guia'

describe('Guia de envío', () => {
  it('muestra el código y enlaza al rastreador de Shalom', () => {
    render(<Guia codigo="SH-123456" />)
    expect(screen.getByText('SH-123456')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /rastrear en Shalom/ }))
      .toHaveAttribute('href', 'https://shalom.com.pe/rastrea-tu-envio')
  })

  it('copia el código al portapapeles', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    render(<Guia codigo="SH-123456" />)
    fireEvent.click(screen.getByText('copiar'))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('SH-123456'))
    expect(await screen.findByText('✓ copiado')).toBeInTheDocument()
  })

  it('si el portapapeles falla no rompe la pantalla', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: () => Promise.reject(new Error('denegado')) } })
    render(<Guia codigo="SH-999" />)
    fireEvent.click(screen.getByText('copiar'))
    await waitFor(() => expect(screen.getByText('copiar')).toBeInTheDocument())
  })
})
