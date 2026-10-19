import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { AMBITOS, evaluate } from '@/lib/regen'
import { RegenForm } from '@/app/miembros/regen/RegenForm'
import { saveRegenEvaluacion } from '@/app/miembros/regen/regen-actions'

vi.mock('@/app/miembros/regen/regen-actions', () => ({ saveRegenEvaluacion: vi.fn() }))
beforeEach(() => vi.mocked(saveRegenEvaluacion).mockReset())

it('conserva las respuestas al avanzar y volver entre ámbitos', () => {
  render(<RegenForm ambitos={AMBITOS} />)
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  const groups = screen.getAllByRole('group')
  for (const group of groups) fireEvent.click(group.querySelector('input[value="0"]')!)
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente ámbito →' }))
  expect(screen.getByRole('heading', { name: 'Trabajo' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '← Anterior' }))
  expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(4)
})

it('muestra ayuda al declarar miedo sin esperar a completar el cuestionario', () => {
  render(<RegenForm ambitos={AMBITOS} />)
  const group = screen.getByRole('group', { name: 'Siento miedo de alguien con quien vivo.' })
  fireEvent.click(group.querySelector('input[value="1"]')!)
  expect(screen.getByRole('heading', { name: 'Puedes buscar apoyo' })).toBeInTheDocument()
  expect(saveRegenEvaluacion).not.toHaveBeenCalled()
})

it('no pierde las respuestas ante un error de red al evaluar', async () => {
  vi.mocked(saveRegenEvaluacion).mockRejectedValueOnce(new Error('network'))
  render(<RegenForm ambitos={AMBITOS} />)
  for (let i = 0; i < 4; i++) {
    for (const group of screen.getAllByRole('group')) fireEvent.click(group.querySelector('input[value="0"]')!)
    fireEvent.click(screen.getByRole('button', { name: i < 3 ? 'Siguiente ámbito →' : 'Ver mi resumen' }))
  }
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo completar')
  expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(4)
})

it('presenta el resultado como reflexión y advierte si no se guardó', async () => {
  const respuestas = AMBITOS.flatMap(a => a.preguntas.map(p => ({ preguntaId: p.id, valor: 0 })))
  vi.mocked(saveRegenEvaluacion).mockResolvedValueOnce({ ok: true, resultado: evaluate(respuestas), saved: false })
  render(<RegenForm ambitos={AMBITOS} />)
  for (let i = 0; i < 4; i++) {
    for (const group of screen.getAllByRole('group')) fireEvent.click(group.querySelector('input[value="0"]')!)
    fireEvent.click(screen.getByRole('button', { name: i < 3 ? 'Siguiente ámbito →' : 'Ver mi resumen' }))
  }
  expect(await screen.findByRole('alert')).toHaveTextContent('no se pudo guardar')
  expect(screen.queryByText('Sano')).not.toBeInTheDocument()
  expect(screen.getByText(/no es una escala clínica validada/i)).toBeInTheDocument()
})
