import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from '../../app/login/page'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  signInWithPassword: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}))

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({ auth: { signInWithPassword: mocks.signInWithPassword } }),
}))

function completarLogin() {
  fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'paciente@example.com' } })
  fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: 'clave-segura' } })
}

describe('LoginPage', () => {
  beforeEach(() => {
    mocks.push.mockReset()
    mocks.refresh.mockReset()
    mocks.signInWithPassword.mockReset()
    mocks.signInWithPassword.mockResolvedValue({ error: null })
  })

  it('envía credenciales a Supabase Auth y entra a miembros', async () => {
    render(<LoginPage />)
    completarLogin()

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => expect(mocks.signInWithPassword).toHaveBeenCalled())
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'paciente@example.com',
      password: 'clave-segura',
    })
    expect(mocks.push).toHaveBeenCalledWith('/miembros')
    expect(mocks.refresh).toHaveBeenCalled()
  })

  it('muestra un mensaje neutro cuando falla el login', async () => {
    mocks.signInWithPassword.mockResolvedValueOnce({ error: new Error('invalid_credentials') })
    render(<LoginPage />)
    completarLogin()

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
  })
})
