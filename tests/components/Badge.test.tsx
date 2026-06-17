import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '@/app/components/ui/Badge'

describe('Badge', () => {
  it('emite el eyebrow de marca', () => {
    render(<Badge>Cusco · Perú</Badge>)
    const el = screen.getByText('Cusco · Perú')
    expect(el.className).toContain('text-brand')
    expect(el.className).toContain('uppercase')
    expect(el.className).toContain('font-mono')
  })
})
