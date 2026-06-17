import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Section from '@/app/components/ui/Section'

describe('Section', () => {
  it('aplica contenedor centrado por defecto', () => {
    render(<Section><span>hola</span></Section>)
    const inner = screen.getByText('hola').parentElement!
    expect(inner.className).toContain('max-w-5xl')
    expect(inner.className).toContain('mx-auto')
  })

  it('con bordered añade borde superior', () => {
    const { container } = render(<Section bordered><span>x</span></Section>)
    const section = container.querySelector('section')!
    expect(section.className).toContain('border-t')
    expect(section.className).toContain('border-subtle')
  })
})
