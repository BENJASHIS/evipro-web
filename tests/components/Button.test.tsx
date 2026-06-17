import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from '@/app/components/ui/Button'

describe('Button', () => {
  it('variante primary emite clases de marca', () => {
    render(<Button variant="primary">Pagar</Button>)
    const el = screen.getByText('Pagar')
    expect(el.className).toContain('bg-brand')
    expect(el.tagName).toBe('BUTTON')
  })

  it('variante outline emite borde marcado', () => {
    render(<Button variant="outline">Cancelar</Button>)
    expect(screen.getByText('Cancelar').className).toContain('border-strong')
  })

  it('con href renderiza un enlace', () => {
    render(<Button variant="primary" href="/planes">Ver planes</Button>)
    const el = screen.getByText('Ver planes')
    expect(el.tagName).toBe('A')
    expect(el.getAttribute('href')).toBe('/planes')
  })

  it('concatena className extra', () => {
    render(<Button variant="primary" className="w-full">X</Button>)
    expect(screen.getByText('X').className).toContain('w-full')
  })
})
