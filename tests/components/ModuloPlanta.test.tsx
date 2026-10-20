import { render, screen } from '@testing-library/react'
import { it, expect } from 'vitest'
import { LanguageProvider } from '@/app/components/Language'
import ModuloPlanta from '@/app/miembros/contenido/que-hay-en-la-planta/ModuloPlanta'
import { SECCIONES, seccionesPara, preguntasPara, fuentesDe } from '@/lib/educacion/contenido-planta'

const props = (nivel: 'completo' | 'parcial', version: string | null = '2026.10.20') => ({
  nivel, secciones: seccionesPara(nivel), preguntas: preguntasPara(nivel), fuentes: fuentesDe(seccionesPara(nivel)),
  revision: { responsable: 'Dr. Carlos Jara' as const, version }, adminPreview: false })
const textoDe = (id: string) => SECCIONES.find(s => s.id === id)!.afirmaciones[0].es

it('parcial: seguridad sí, contenido EVIPro no, invitación sí', () => {
  render(<LanguageProvider locale="es"><ModuloPlanta {...props('parcial')} /></LanguageProvider>)
  expect(screen.getByText(textoDe('seguridad'))).toBeInTheDocument()
  expect(screen.queryByText(textoDe('calor'))).not.toBeInTheDocument()
  expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Membresía EVIPro/i })).toHaveAttribute('href', '/planes#membresias')
})
it('completo: incluye el simulador y sin invitación', () => {
  render(<LanguageProvider locale="es"><ModuloPlanta {...props('completo')} /></LanguageProvider>)
  expect(screen.getByRole('slider', { name: /tiempo/i })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /Ver Membresía EVIPro/i })).not.toBeInTheDocument()
})
it('sin revisión: aviso de borrador y sin sello', () => {
  render(<LanguageProvider locale="es"><ModuloPlanta {...props('completo', null)} /></LanguageProvider>)
  expect(screen.getByText(/pendiente de revisión médica/i)).toBeInTheDocument()
  expect(screen.queryByText(/Revisado por/)).not.toBeInTheDocument()
})
it('con revisión: sello y modo admin', () => {
  render(<LanguageProvider locale="es"><ModuloPlanta {...props('completo')} adminPreview /></LanguageProvider>)
  expect(screen.getByText('Revisado por Dr. Carlos Jara · versión 2026.10.20')).toBeInTheDocument()
  expect(screen.getByText(/Modo admin/)).toBeInTheDocument()
})
it('cada afirmación muestra su tipo', () => {
  render(<LanguageProvider locale="es"><ModuloPlanta {...props('completo')} /></LanguageProvider>)
  expect(screen.getAllByText(/Estudio en personas/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Orientación del equipo médico/).length).toBeGreaterThan(0)
})
