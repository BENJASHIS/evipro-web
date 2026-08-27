import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CannabinoidCalculator from '../../app/miembros/herramientas/calculadora-cannabinoide/CannabinoidCalculator'

describe('CannabinoidCalculator', () => {
  it('muestra los resultados esenciales para aceite por defecto', () => {
    render(<CannabinoidCalculator />)

    expect(screen.getByText('Concentración')).toBeInTheDocument()
    expect(screen.getByText('CBD 100 mg/ml · THC 0 mg/ml')).toBeInTheDocument()
    expect(screen.getByText('CBD 10 % p/v · THC 0 % p/v')).toBeInTheDocument()
    expect(screen.getByText('CBD 1000 mg · THC 0 mg')).toBeInTheDocument()
    expect(screen.getAllByText('CBD 5 mg · THC 0 mg')).toHaveLength(2)
    expect(screen.getByText('200 tomas · 200 días')).toBeInTheDocument()
  })

  it('permite cambiar a cálculo por inhalaciones', () => {
    render(<CannabinoidCalculator />)

    fireEvent.change(screen.getByLabelText(/tipo de producto/i), { target: { value: 'inhalation' } })

    expect(screen.getByText('Contenido estimado')).toBeInTheDocument()
    expect(screen.getByText('Por inhalación teórica')).toBeInTheDocument()
    expect(screen.getByText('CBD 0 mg · THC 700 mg')).toBeInTheDocument()
    expect(screen.getByText('CBD 0 % · THC 70 %')).toBeInTheDocument()
    expect(screen.getByText('CBD 0 mg · THC 7 mg')).toBeInTheDocument()
    expect(screen.getByText('100 estimadas')).toBeInTheDocument()
  })

  it('convierte porcentaje p/v a mg/ml y mg total visibles', () => {
    render(<CannabinoidCalculator />)

    fireEvent.change(screen.getByLabelText(/cbd declarado/i), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/thc declarado/i), { target: { value: '1' } })

    expect(screen.getByText('CBD 100 mg/ml · THC 10 mg/ml')).toBeInTheDocument()
    expect(screen.getByText('CBD 10 % p/v · THC 1 % p/v')).toBeInTheDocument()
    expect(screen.getByText('CBD 1000 mg · THC 100 mg')).toBeInTheDocument()
  })

  it('mantiene los inhalables como porcentaje del producto, no como p/v', () => {
    render(<CannabinoidCalculator />)

    fireEvent.change(screen.getByLabelText(/tipo de producto/i), { target: { value: 'inhalation' } })
    fireEvent.change(screen.getByLabelText(/thc declarado/i), { target: { value: '68' } })

    expect(screen.getByText('CBD 0 mg · THC 680 mg')).toBeInTheDocument()
    expect(screen.getByText('CBD 0 % · THC 68 %')).toBeInTheDocument()
    expect(screen.queryByText('% p/v equivalente')).not.toBeInTheDocument()
  })
})
