import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecuperarContrasenaPage from '../../app/recuperar-contrasena/page'

const mocks = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: { resetPasswordForEmail: mocks.resetPasswordForEmail },
  }),
}))

describe('RecuperarContrasenaPage', () => {
  beforeEach(() => {
    mocks.resetPasswordForEmail.mockReset()
    mocks.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null })
  })

  it('envía un enlace de recuperación con redirect a actualizar contraseña', async () => {
    render(<RecuperarContrasenaPage />)

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'paciente@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }))

    await waitFor(() => expect(mocks.resetPasswordForEmail).toHaveBeenCalled())
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith('paciente@example.com', expect.objectContaining({
      redirectTo: expect.stringContaining('/actualizar-contrasena'),
    }))
    expect(await screen.findByText(/si el correo está registrado/i)).toBeInTheDocument()
  })

  it('muestra un mensaje claro si falla captcha', async () => {
    mocks.resetPasswordForEmail.mockResolvedValueOnce({
      data: null,
      error: new Error('captcha protection: request disallowed'),
    })
    render(<RecuperarContrasenaPage />)

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'paciente@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(await screen.findByText(/verificación anti-bot/i)).toBeInTheDocument()
  })
})
