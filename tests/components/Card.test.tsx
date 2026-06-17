import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '@/app/components/ui/Card'

describe('Card', () => {
  it('emite borde sutil y renderiza children', () => {
    render(<Card>contenido</Card>)
    const el = screen.getByText('contenido')
    expect(el.className).toContain('border-subtle')
    expect(el.className).toContain('rounded')
  })

  it('concatena className extra', () => {
    render(<Card className="order-2">x</Card>)
    expect(screen.getByText('x').className).toContain('order-2')
  })
})
