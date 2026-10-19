import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CannabinoidCalculator from '../../app/miembros/herramientas/calculadora-cannabinoide/CannabinoidCalculator'

function enter(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function fillOil() {
  enter(/volumen del frasco/i, '10')
  enter(/cbd declarado/i, '10')
  enter(/thc declarado/i, '0')
}

describe('CannabinoidCalculator', () => {
  it('inicia sin datos de ejemplo calculados como si fueran datos del usuario', () => {
    render(<CannabinoidCalculator />)
    expect(screen.getByLabelText(/volumen del frasco/i)).toHaveValue(null)
    expect(screen.getByLabelText(/gotas por ml/i)).toHaveValue(null)
    expect(screen.getByRole('alert')).toHaveTextContent(/falta/i)
    expect(screen.queryByText(/CBD \d/)).not.toBeInTheDocument()
  })

  it('muestra concentración con THC cero explícito y pide los datos opcionales faltantes', () => {
    render(<CannabinoidCalculator />)
    fillOil()
    expect(screen.getByText('CBD 100 mg/ml · THC 0 mg/ml')).toBeInTheDocument()
    expect(screen.getByText('CBD 10 % p/v · THC 0 % p/v')).toBeInTheDocument()
    expect(screen.getByText('CBD 1000 mg · THC 0 mg')).toBeInTheDocument()
    expect(screen.getByText(/falta gotas por ml/i)).toBeInTheDocument()
    expect(screen.queryByText('CBD 5 mg · THC 0 mg')).not.toBeInTheDocument()
  })

  it('deriva cada resultado de los datos de uso presentes, sin asumir tomas por día', () => {
    render(<CannabinoidCalculator />)
    fillOil()
    enter(/gotas por ml/i, '20')
    expect(screen.getByText('CBD 5 mg · THC 0 mg')).toBeInTheDocument()
    expect(screen.getByText(/falta gotas por toma/i)).toBeInTheDocument()
    enter(/gotas por toma/i, '1')
    expect(screen.getAllByText('CBD 5 mg · THC 0 mg')).toHaveLength(2)
    expect(screen.getByText(/200 tomas/)).toHaveTextContent(/falta tomas por día/i)
    enter(/tomas por día/i, '1')
    expect(screen.getByText('200 tomas · 200 días')).toBeInTheDocument()
  })

  it('rechaza gotero cero y recupera la concentración al dejarlo sin dato', () => {
    render(<CannabinoidCalculator />)
    fillOil()
    enter(/gotas por ml/i, '0')
    expect(screen.getByRole('alert')).toHaveTextContent(/gotas por ml.*mayor que 0/i)
    expect(screen.queryByText('CBD 5 mg · THC 0 mg')).not.toBeInTheDocument()
    enter(/gotas por ml/i, '')
    expect(screen.getByText('CBD 100 mg/ml · THC 0 mg/ml')).toBeInTheDocument()
    expect(screen.getByText(/falta gotas por ml/i)).toBeInTheDocument()
  })

  it('no convierte un campo obligatorio borrado en cero', () => {
    render(<CannabinoidCalculator />)
    fillOil()
    enter(/thc declarado/i, '')
    expect(screen.getByRole('alert')).toHaveTextContent(/falta.*THC/i)
    expect(screen.queryByText('CBD 100 mg/ml · THC 0 mg/ml')).not.toBeInTheDocument()
  })

  it('rechaza cartucho de 1 g con CBD 60 % y THC 70 %', () => {
    render(<CannabinoidCalculator />)
    enter(/tipo de producto/i, 'inhalation')
    enter(/contenido del producto/i, '1')
    enter(/cbd declarado/i, '60')
    enter(/thc declarado/i, '70')
    expect(screen.getByRole('alert')).toHaveTextContent(/100/i)
    expect(screen.queryByText(/CBD 600 mg/)).not.toBeInTheDocument()
  })

  it('conserva el contenido de cartucho con inhalaciones vacías sin presentar cero por inhalación', () => {
    render(<CannabinoidCalculator />)
    enter(/tipo de producto/i, 'inhalation')
    enter(/contenido del producto/i, '1')
    enter(/cbd declarado/i, '0')
    enter(/thc declarado/i, '68')
    expect(screen.getByText('CBD 0 mg · THC 680 mg')).toBeInTheDocument()
    expect(screen.getByText('CBD 0 % · THC 68 %')).toBeInTheDocument()
    expect(screen.getByText(/faltan inhalaciones/i)).toBeInTheDocument()
    expect(screen.queryByText('0 estimadas')).not.toBeInTheDocument()
    enter(/inhalaciones estimadas/i, '100')
    expect(screen.getByText('CBD 0 mg · THC 6.8 mg')).toBeInTheDocument()
    expect(screen.getByText('100 estimadas')).toBeInTheDocument()
    enter(/inhalaciones estimadas/i, '')
    expect(screen.queryByText('CBD 0 mg · THC 6.8 mg')).not.toBeInTheDocument()
    expect(screen.getByText(/faltan inhalaciones/i)).toBeInTheDocument()
  })

  it('calcula flor con datos explícitos y rechaza porcentajes incompatibles', () => {
    render(<CannabinoidCalculator />)
    enter(/tipo de producto/i, 'flower')
    enter(/flor por carga/i, '0.1')
    enter(/cbd en etiqueta/i, '0')
    enter(/thc en etiqueta/i, '10')
    enter(/inhalaciones por carga/i, '5')
    expect(screen.getByText('CBD 0 mg · THC 10 mg')).toBeInTheDocument()
    expect(screen.getByText('CBD 0 mg · THC 2 mg')).toBeInTheDocument()
    enter(/cbd en etiqueta/i, '95')
    expect(screen.getByRole('alert')).toHaveTextContent(/100/i)
    expect(screen.queryByText('CBD 0 mg · THC 2 mg')).not.toBeInTheDocument()
  })

  it.each(['inhalation', 'flower'])('rechaza inhalaciones fraccionarias y acepta una inhalación en %s', productKind => {
    render(<CannabinoidCalculator />)
    enter(/tipo de producto/i, productKind)
    enter(productKind === 'inhalation' ? /contenido del producto/i : /flor por carga/i, '1')
    enter(productKind === 'inhalation' ? /cbd declarado/i : /cbd en etiqueta/i, '0')
    enter(productKind === 'inhalation' ? /thc declarado/i : /thc en etiqueta/i, '70')
    const inhalationsLabel = productKind === 'inhalation' ? /inhalaciones estimadas/i : /inhalaciones por carga/i
    enter(inhalationsLabel, '0.1')
    expect(screen.getByRole('alert')).toHaveTextContent(/entero/i)
    expect(screen.queryByText(/7000 mg/)).not.toBeInTheDocument()
    expect(screen.queryByText('0 estimadas')).not.toBeInTheDocument()

    enter(inhalationsLabel, '1')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Por inhalación teórica').parentElement).toHaveTextContent('CBD 0 mg · THC 700 mg')
    expect(screen.getByText('1 estimadas')).toBeInTheDocument()
  })
})
