import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ActualizarContrasenaPage from '../../app/actualizar-contrasena/page'

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  getSession: vi.fn(),
  updateUser: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      getSession: mocks.getSession,
      updateUser: mocks.updateUser,
    },
  }),
}))

describe('ActualizarContrasenaPage', () => {
  beforeEach(() => {
    mocks.exchangeCodeForSession.mockReset()
    mocks.getSession.mockReset()
    mocks.updateUser.mockReset()
    mocks.exchangeCodeForSession.mockResolvedValue({ data: {}, error: null })
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } }, error: null })
    mocks.updateUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  })

  it('actualiza la contraseña cuando el enlace ya creó sesión', async () => {
    render(<ActualizarContrasenaPage />)

    await screen.findByLabelText(/^nueva contraseña$/i)
    fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), { target: { value: 'clave-nueva' } })
    fireEvent.change(screen.getByLabelText(/repite tu nueva contraseña/i), { target: { value: 'clave-nueva' } })
    fireEvent.click(screen.getByRole('button', { name: /actualizar contraseña/i }))

    await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'clave-nueva' }))
    expect(await screen.findByText(/contraseña actualizada/i)).toBeInTheDocument()
  })

  it('pide abrir la página desde el enlace de recuperación si no hay sesión', async () => {
    mocks.getSession.mockResolvedValueOnce({ data: { session: null }, error: null })

    render(<ActualizarContrasenaPage />)

    expect(await screen.findByText(/desde el enlace de recuperación/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /actualizar contraseña/i })).toBeDisabled()
  })
})
