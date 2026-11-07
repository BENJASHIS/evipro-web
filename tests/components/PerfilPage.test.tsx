import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import PerfilPage from '@/app/miembros/perfil/page'
afterEach(() => vi.unstubAllGlobals())
it('muestra datos Google y permite guardar nombre vacío sin pedir datos sensibles', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ full_name: 'Nombre Google', email: 'cuenta@example.com' }) })
  vi.stubGlobal('fetch', fetcher)
  render(<PerfilPage />)
  expect(await screen.findByLabelText('Nombre para mostrar (opcional)')).toHaveValue('Nombre Google')
  expect(screen.getByLabelText('Correo electrónico')).toHaveValue('cuenta@example.com')
  expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('readonly')
  for (const label of [/documento/i, /teléfono/i, /ciudad/i]) expect(screen.queryByLabelText(label)).toBeNull()
  fireEvent.change(screen.getByLabelText('Nombre para mostrar (opcional)'), { target: { value: '' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  await waitFor(() => expect(fetcher).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'PUT', body: JSON.stringify({ full_name: '' }) })))
  expect(await screen.findByRole('status')).toHaveTextContent('Perfil actualizado correctamente.')
})
it('un error de red al guardar se muestra y permite reintentar', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ full_name: '', email: 'cuenta@example.com' }) }).mockRejectedValue(new Error('network'))
  vi.stubGlobal('fetch', fetcher)
  render(<PerfilPage />)
  await screen.findByLabelText('Nombre para mostrar (opcional)')
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar el perfil.')
  expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled()
})
