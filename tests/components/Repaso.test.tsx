import { render, screen, fireEvent } from '@testing-library/react'
import { it, expect } from 'vitest'
import { LanguageProvider } from '@/app/components/Language'
import Repaso from '@/app/miembros/contenido/que-hay-en-la-planta/Repaso'
import type { Pregunta } from '@/lib/educacion/contenido-planta'

const p: Pregunta = { id: 'q', parte: 'todos', enunciado: { es: '¿Cuál te puede volar?', en: 'Which one can get you high?' },
  opciones: [{ es: 'THC', en: 'THC' }, { es: 'CBD', en: 'CBD' }], correcta: 0,
  explicacion: { es: 'El THC es intoxicante; el CBD no.', en: 'THC is intoxicating; CBD is not.' } }

it('responder muestra si acertó y la explicación', () => {
  render(<LanguageProvider locale="es"><Repaso preguntas={[p]} /></LanguageProvider>)
  fireEvent.click(screen.getByRole('button', { name: 'CBD' }))
  expect(screen.getByText(/no es correcta|incorrect/i)).toBeInTheDocument()
  expect(screen.getByText('El THC es intoxicante; el CBD no.')).toBeInTheDocument()
  expect(screen.getByText('Tu respuesta')).toBeInTheDocument()
  expect(screen.getByText('✓ Respuesta correcta')).toBeInTheDocument()
})
it('acierto muestra ¡Correcto!, la explicación y las marcas de respuesta', () => {
  render(<LanguageProvider locale="es"><Repaso preguntas={[p]} /></LanguageProvider>)
  fireEvent.click(screen.getByRole('button', { name: 'THC' }))
  expect(screen.getByText('¡Correcto!')).toBeInTheDocument()
  expect(screen.getByText('El THC es intoxicante; el CBD no.')).toBeInTheDocument()
  expect(screen.getByText('Tu respuesta')).toBeInTheDocument()
  expect(screen.getByText('✓ Respuesta correcta')).toBeInTheDocument()
})
it('la región de estado existe antes de responder', () => {
  render(<LanguageProvider locale="es"><Repaso preguntas={[p]} /></LanguageProvider>)
  expect(screen.getByRole('status')).toBeEmptyDOMElement()
})
it('usa el idioma activo', () => {
  render(<LanguageProvider locale="en"><Repaso preguntas={[p]} /></LanguageProvider>)
  expect(screen.getByText('Which one can get you high?')).toBeInTheDocument()
})
