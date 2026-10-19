import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { AMBITOS, evaluate } from '@/lib/regen'
import { RegenHistory, RegenResult } from '@/app/miembros/regen/RegenResults'

it('no transforma un dato inválido del historial en un resultado tranquilizador', () => {
  render(<RegenHistory entries={[{ created_at: '2026-10-19T02:00:00Z', version: '2026.10.19', scores: { hogar: -1, trabajo: '0' }, flags: [], safety_triggered: false }]} />)
  expect(screen.getAllByText(/Sin dato válido/)).toHaveLength(4)
  expect(screen.queryByText('Pocas dificultades reportadas')).not.toBeInTheDocument()
})

it('muestra apoyo y puntajes cuando el registro tiene una señal infrecuente', () => {
  render(<RegenHistory entries={[{ created_at: '2026-10-19T02:00:00Z', version: '2026.10.19', scores: { hogar: 6 }, flags: ['hogar_4'], safety_triggered: false }]} />)
  expect(screen.getByText('Orientación de apoyo')).toBeInTheDocument()
  expect(screen.getByText(/6\/100/)).toBeInTheDocument()
})

it('el resultado con una señal de peligro muestra el apoyo y también el resumen por ámbito', () => {
  const respuestas = AMBITOS.flatMap(a => a.preguntas.map(p => ({ preguntaId: p.id, valor: p.id === 'hogar_4' ? 1 : 0 })))
  render(<RegenResult resultado={evaluate(respuestas)} />)
  expect(screen.getByRole('heading', { name: 'Puedes buscar apoyo' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Hogar' })).toBeInTheDocument()
  expect(screen.getByText(/no es un porcentaje de riesgo/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /equipo de EVIPro/ })).toHaveAttribute('href', '/miembros/mensajes')
})
