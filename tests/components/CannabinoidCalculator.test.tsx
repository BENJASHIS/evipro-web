import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CannabinoidCalculator from '../../app/miembros/herramientas/calculadora-cannabinoide/CannabinoidCalculator'

describe('CannabinoidCalculator', () => {
  it('muestra los resultados esenciales para aceite por defecto', () => {
    render(<CannabinoidCalculator />)

    expect(screen.getByText('50.00 mg/ml')).toBeInTheDocument()
    expect(screen.getByText('2.500 mg')).toBeInTheDocument()
    expect(screen.getByText(/300(\.0)? tomas/)).toBeInTheDocument()
    expect(screen.getByText(/150(\.0)? días/)).toBeInTheDocument()
  })

  it('permite cambiar a cálculo por inhalaciones', () => {
    render(<CannabinoidCalculator />)

    fireEvent.click(screen.getByRole('button', { name: /inhalaciones/i }))

    expect(screen.getByText('CBD por inhalación')).toBeInTheDocument()
    expect(screen.getByText('15.000 mg')).toBeInTheDocument()
    expect(screen.getByText('100 estimadas')).toBeInTheDocument()
  })
})
