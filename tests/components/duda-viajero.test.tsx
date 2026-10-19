import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import DudaForm from '@/app/dudas-del-viajero/DudaForm'

it('prepara una pregunta como texto sin permitir que cambie el destinatario del correo', () => {
  render(<DudaForm />)
  expect(screen.queryByRole('link', { name: /abrir mi correo/i })).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Tu pregunta'), {
    target: { value: '  ¿Cómo coordino? &bcc=otro@example.com\nViajo en enero.  ' },
  })
  fireEvent.click(screen.getByLabelText(/entiendo que este espacio/i))
  fireEvent.submit(screen.getByRole('button', { name: /preparar correo/i }).closest('form')!)
  const href = screen.getByRole('link', { name: /abrir mi correo/i }).getAttribute('href')!
  expect(href).not.toContain('+')
  const mail = new URL(href)
  expect(mail.pathname).toBe('consulta@evipro.pe')
  expect(mail.searchParams.has('bcc')).toBe(false)
  expect(mail.searchParams.get('body')).toBe('¿Cómo coordino? &bcc=otro@example.com\nViajo en enero.')
  expect(screen.getByRole('status')).toHaveTextContent(/todavía no se ha enviado/i)
})
