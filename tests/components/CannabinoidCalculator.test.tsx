import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CannabinoidCalculator from '../../app/miembros/herramientas/calculadora-cannabinoide/CannabinoidCalculator'

describe('CannabinoidCalculator', () => {
  it('muestra los resultados esenciales para aceite por defecto', () => {
    render(<CannabinoidCalculator />)

    expect(screen.getByText('Concentración equivalente')).toBeInTheDocument()
    expect(screen.getByText('CBD 50 mg/ml · THC 0 mg/ml')).toBeInTheDocument()
    expect(screen.getByText('CBD 5 % p/v · THC 0 % p/v')).toBeInTheDocument()
    expect(screen.getByText('CBD 1500 mg · THC 0 mg')).toBeInTheDocument()
    expect(screen.getByText('CBD 2.5 mg · THC 0 mg')).toBeInTheDocument()
    expect(screen.getByText('300 tomas · 150 días')).toBeInTheDocument()
  })

  it('permite cambiar a cálculo por inhalaciones', () => {
    render(<CannabinoidCalculator />)

    fireEvent.change(screen.getByLabelText(/tipo de producto/i), { target: { value: 'inhalation' } })

    expect(screen.getByText('Por inhalación')).toBeInTheDocument()
    expect(screen.getByText('CBD 15 mg · THC 0 mg')).toBeInTheDocument()
    expect(screen.getByText('100 estimadas')).toBeInTheDocument()
  })

  it('convierte porcentaje p/v a mg/ml y mg total visibles', () => {
    render(<CannabinoidCalculator />)

    fireEvent.change(screen.getByLabelText(/la etiqueta muestra/i), { target: { value: 'percent_weight_volume' } })
    fireEvent.change(screen.getByLabelText(/cbd declarado/i), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/thc declarado/i), { target: { value: '1' } })

    expect(screen.getByText('CBD 100 mg/ml · THC 10 mg/ml')).toBeInTheDocument()
    expect(screen.getByText('CBD 10 % p/v · THC 1 % p/v')).toBeInTheDocument()
    expect(screen.getByText('CBD 3000 mg · THC 300 mg')).toBeInTheDocument()
  })
})
