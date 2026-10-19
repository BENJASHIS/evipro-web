import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { RegenHistory } from '@/app/miembros/regen/RegenResults'

it('no transforma un dato inválido del historial en un resultado tranquilizador', () => {
  render(<RegenHistory entries={[{ created_at: '2026-10-19T02:00:00Z', version: '2026.10.19', scores: { hogar: -1, trabajo: '0' }, flags: [], safety_triggered: false }]} />)
  expect(screen.getAllByText(/Sin dato válido/)).toHaveLength(4)
  expect(screen.queryByText('Pocas dificultades reportadas')).not.toBeInTheDocument()
})

it('muestra apoyo sin puntajes cuando el registro tiene una señal infrecuente', () => {
  render(<RegenHistory entries={[{ created_at: '2026-10-19T02:00:00Z', version: '2026.10.19', scores: { hogar: 6 }, flags: ['hogar_4'], safety_triggered: false }]} />)
  expect(screen.getByText('Orientación de apoyo')).toBeInTheDocument()
  expect(screen.queryByText(/6\/100/)).not.toBeInTheDocument()
})
