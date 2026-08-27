import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RegistroPage from '../../app/registro/page'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  signUp: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({ auth: { signUp: mocks.signUp } }),
}))

function completarFormulario(password: string, confirmacion: string) {
  fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Paciente Prueba' } })
  fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'paciente@example.com' } })
  fireEvent.change(screen.getByLabelText(/^contraseña/i), { target: { value: password } })
  fireEvent.change(screen.getByLabelText(/repite tu contraseña/i), { target: { value: confirmacion } })
  fireEvent.change(screen.getByLabelText(/número de documento/i), { target: { value: '12345678' } })
}

describe('RegistroPage', () => {
  beforeEach(() => {
    mocks.push.mockReset()
    mocks.signUp.mockReset()
    mocks.signUp.mockResolvedValue({ data: { user: null }, error: null })
  })

  it('no crea cuenta si las contraseñas no coinciden', async () => {
    render(<RegistroPage />)
    completarFormulario('clave-segura', 'clave-distinta')

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(mocks.signUp).not.toHaveBeenCalled()
  })

  it('envía la contraseña confirmada a Supabase', async () => {
    render(<RegistroPage />)
    completarFormulario('clave-segura', 'clave-segura')

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => expect(mocks.signUp).toHaveBeenCalled())
    expect(mocks.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: 'paciente@example.com',
      password: 'clave-segura',
    }))
    expect(mocks.push).toHaveBeenCalledWith('/planes')
  })
})
