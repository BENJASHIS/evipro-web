import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Marca from '../../app/components/ui/Marca'

describe('Marca', () => {
  it('lleva el logo, no solo la palabra', () => {
    const { container } = render(<Marca />)
    expect(container.querySelector('img')).toBeTruthy()
  })

  it('por defecto lleva a la portada pública, no a la página donde ya estás', () => {
    render(<Marca />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })

  it('acepta un sufijo para el admin', () => {
    render(<Marca sufijo="Admin" />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })
})
