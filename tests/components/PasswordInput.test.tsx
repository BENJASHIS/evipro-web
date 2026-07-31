import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PasswordInput from '../../app/components/ui/PasswordInput'

describe('PasswordInput', () => {
  it('arranca oculta y el ojo la muestra y la vuelve a ocultar', () => {
    const { container } = render(
      <PasswordInput value="secreta123" onChange={vi.fn()} autoComplete="new-password" />,
    )
    const input = container.querySelector('input')!
    expect(input.type).toBe('password')

    fireEvent.click(screen.getByLabelText('Mostrar contraseña'))
    expect(input.type).toBe('text')

    fireEvent.click(screen.getByLabelText('Ocultar contraseña'))
    expect(input.type).toBe('password')
  })

  it('el ojo no envía el formulario', () => {
    const onSubmit = vi.fn(e => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <PasswordInput value="x" onChange={vi.fn()} autoComplete="current-password" />
      </form>,
    )
    fireEvent.click(screen.getByLabelText('Mostrar contraseña'))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
