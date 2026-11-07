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

const aceptar = () => fireEvent.click(screen.getByRole('checkbox', { name: /acepto/i }))

function completarFormulario(password: string, confirmacion: string) {
  fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'paciente@example.com' } })
  fireEvent.change(screen.getByLabelText(/^contraseña/i), { target: { value: password } })
  fireEvent.change(screen.getByLabelText(/repite tu contraseña/i), { target: { value: confirmacion } })
  aceptar()
}

describe('RegistroPage', () => {
  beforeEach(() => {
    window.history.replaceState({},'', '/registro')
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

  it('no crea cuenta sin aceptar los Términos y guarda la fecha al aceptar', async () => {
    render(<RegistroPage />)
    completarFormulario('clave-segura', 'clave-segura')
    aceptar()
    expect(screen.getByRole('checkbox', { name: /acepto/i })).not.toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(mocks.signUp).not.toHaveBeenCalled()

    expect(screen.getByRole('link', { name: 'Términos y Condiciones' })).toHaveAttribute('href', '/terminos')
    aceptar()
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    await waitFor(() => expect(mocks.signUp).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({ data: { terms_accepted_at: expect.any(String) } }),
    })))
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
    expect(mocks.push).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent(/confirma/i)
  })
})

it('registro educativo sin documento vuelve al visor si hay sesión',async()=>{
  mocks.push.mockReset()
  window.history.replaceState({},'', '/registro?next=%2Fmiembros%2Fcontenido%2Fexplora-cbd-thc')
  mocks.signUp.mockResolvedValue({data:{user:{id:'free'},session:{access_token:'test'}},error:null})
  render(<RegistroPage />)
  expect(screen.queryByLabelText(/número de documento/i)).toBeNull()
  expect(screen.queryByLabelText(/nombre completo/i)).toBeNull()
  for(const [label,value] of [[/correo electrónico/i,'persona@example.com'],[/^contraseña/i,'clave-segura'],[/repite tu contraseña/i,'clave-segura']] as const)fireEvent.change(screen.getByLabelText(label),{target:{value}})
  aceptar()
  fireEvent.click(screen.getByRole('button',{name:/crear cuenta/i}))
  await waitFor(()=>expect(mocks.push).toHaveBeenCalledWith('/miembros/contenido/explora-cbd-thc'))
})
it('si requiere confirmar correo no anuncia acceso ni envía a planes',async()=>{
  mocks.push.mockReset()
  window.history.replaceState({},'', '/registro?next=%2Fmiembros%2Fcontenido%2Fexplora-cbd-thc')
  mocks.signUp.mockResolvedValue({data:{user:{id:'free'},session:null},error:null})
  render(<RegistroPage />)
  for(const [label,value] of [[/correo electrónico/i,'persona@example.com'],[/^contraseña/i,'clave-segura'],[/repite tu contraseña/i,'clave-segura']] as const)fireEvent.change(screen.getByLabelText(label),{target:{value}})
  aceptar()
  fireEvent.click(screen.getByRole('button',{name:/crear cuenta/i}))
  expect(await screen.findByText(/Revisa tu correo para confirmar/i)).toBeInTheDocument()
  expect(mocks.push).not.toHaveBeenCalled()
})

it('registro general solo pide correo y contraseña, sin documento ni contacto', () => {
  window.history.replaceState({},'', '/registro')
  render(<RegistroPage />)
  for (const label of [/nombre completo/i, /documento/i, /teléfono/i, /ciudad/i, /país/i]) expect(screen.queryByLabelText(label)).toBeNull()
})
it('registro general con sesión abre miembros sin enviar documento ni crear perfil ampliado', async () => {
  window.history.replaceState({}, '', '/registro')
  mocks.push.mockReset()
  mocks.signUp.mockResolvedValue({ data: { user: { id: 'new' }, session: { access_token: 'test' } }, error: null })
  render(<RegistroPage />)
  completarFormulario('clave-segura', 'clave-segura')
  fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/miembros'))
  expect(mocks.signUp).toHaveBeenLastCalledWith(expect.objectContaining({ options: expect.objectContaining({ emailRedirectTo: `${location.origin}/auth/confirm` }) }))
})
