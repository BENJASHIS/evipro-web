import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CannabinoidCalculator from '../../app/miembros/herramientas/calculadora-cannabinoide/CannabinoidCalculator'
import { LanguageProvider } from '@/app/components/Language'

function enter(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function fillOil() {
  enter(/volumen del frasco/i, '10')
  enter(/cbd declarado/i, '10')
  enter(/thc declarado/i, '0')
}

describe('CannabinoidCalculator', () => {
  it('inicia con gotero de 20 a la vista y sin datos de etiqueta calculados', () => {
    render(<CannabinoidCalculator />)
    expect(screen.getByLabelText(/volumen del frasco/i)).toHaveValue(null)
    expect(screen.getByLabelText(/gotas por ml/i)).toHaveValue(20)
    expect(screen.getByText(/gotero: 20 gotas por ml/i)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/falta/i)
    expect(screen.queryByText(/THC \d/)).not.toBeInTheDocument()
  })

  it('con el gotero por defecto muestra mg por gota y pide solo las gotas por toma', () => {
    render(<CannabinoidCalculator />)
    fillOil()
    expect(screen.getByText('THC 0 mg/ml : CBD 100 mg/ml')).toBeInTheDocument()
    expect(screen.getByText('THC 0 % : CBD 10 %')).toBeInTheDocument()
    expect(screen.getByText('THC 0 mg : CBD 1000 mg')).toBeInTheDocument()
    expect(screen.getByText('THC 0 mg : CBD 5 mg')).toBeInTheDocument()
    expect(screen.getAllByText(/faltan gotas por toma/i)).toHaveLength(3)
  })

  it('más gotas por toma dan más mg sin tocar el gotero', () => {
    render(<CannabinoidCalculator />)
    enter(/volumen del frasco/i, '10')
    enter(/cbd declarado/i, '10')
    enter(/thc declarado/i, '5')
    enter(/gotas por toma/i, '1')
    expect(screen.getAllByText('THC 2.5 mg : CBD 5 mg')).toHaveLength(2)
    enter(/gotas por toma/i, '2')
    expect(screen.getByText('THC 5 mg : CBD 10 mg')).toBeInTheDocument()
    enter(/gotas por toma/i, '4')
    expect(screen.getByText('THC 10 mg : CBD 20 mg')).toBeInTheDocument()
  })

  it('deriva cada resultado de los datos de uso presentes, sin asumir tomas por día', () => {
    render(<CannabinoidCalculator />)
    fillOil()
    enter(/gotas por toma/i, '1')
    expect(screen.getAllByText('THC 0 mg : CBD 5 mg')).toHaveLength(2)
    expect(screen.getByText(/200 tomas/)).toHaveTextContent(/faltan tomas por día/i)
    enter(/tomas por día/i, '1')
    expect(screen.getByText('200 tomas · 200 días')).toBeInTheDocument()
  })

  it('muestra los mg del día al indicar tomas por día', () => {
    render(<CannabinoidCalculator />)
    enter(/volumen del frasco/i, '10')
    enter(/cbd declarado/i, '10')
    enter(/thc declarado/i, '5')
    enter(/gotas por toma/i, '4')
    expect(screen.getByText('Por día').parentElement).toHaveTextContent(/faltan tomas por día/i)
    enter(/tomas por día/i, '3')
    expect(screen.getByText('Por día').parentElement).toHaveTextContent('THC 30 mg : CBD 60 mg')
  })

  it.each(['oil', 'inhalation', 'flower'])('no muestra ejemplos que parezcan datos en %s', productKind => {
    const { container } = render(<CannabinoidCalculator />)
    enter(/tipo de producto/i, productKind)
    expect(container.querySelectorAll('input[placeholder]')).toHaveLength(0)
  })

  it('cambiar el gotero es opcional: rechaza cero y vuelve a 20 si se borra', () => {
    render(<CannabinoidCalculator />)
    fillOil()
    enter(/gotas por ml/i, '25')
    expect(screen.getByText('THC 0 mg : CBD 4 mg')).toBeInTheDocument()
    expect(screen.getByText(/gotero: 25 gotas por ml/i)).toBeInTheDocument()
    enter(/gotas por ml/i, '0')
    expect(screen.getByRole('alert')).toHaveTextContent(/gotas por ml.*mayor que 0/i)
    expect(screen.queryByText('THC 0 mg : CBD 4 mg')).not.toBeInTheDocument()
    enter(/gotas por ml/i, '')
    expect(screen.getByText('THC 0 mg : CBD 5 mg')).toBeInTheDocument()
    expect(screen.getByText(/gotero: 20 gotas por ml/i)).toBeInTheDocument()
  })

  it('no convierte un campo obligatorio borrado en cero', () => {
    render(<CannabinoidCalculator />)
    fillOil()
    enter(/thc declarado/i, '')
    expect(screen.getByRole('alert')).toHaveTextContent(/falta.*THC/i)
    expect(screen.queryByText('THC 0 mg/ml : CBD 100 mg/ml')).not.toBeInTheDocument()
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

  function fillCartridge(cbd: string, thc: string) {
    enter(/tipo de producto/i, 'inhalation')
    enter(/contenido del producto/i, '1')
    enter(/cbd declarado/i, cbd)
    enter(/thc declarado/i, thc)
  }
  const porInhalacion = () => screen.getByText('Por inhalación (estimado)').parentElement
  const porToma = () => screen.getByText('Por toma (estimado)').parentElement

  it('cartucho: los mg suben y bajan con el porcentaje y crecen con las inhalaciones', () => {
    render(<CannabinoidCalculator />)
    fillCartridge('0', '66')
    expect(screen.queryByText(/gotas por toma/i)).not.toBeInTheDocument()
    expect(screen.getByText('THC 660 mg : CBD 0 mg')).toBeInTheDocument()
    expect(screen.getByLabelText(/duración de la inhalación/i)).toHaveValue('estandar')
    expect(porInhalacion()).toHaveTextContent('≈ THC 3.5 mg : CBD 0 mg')
    enter(/thc declarado/i, '90')
    expect(porInhalacion()).toHaveTextContent('≈ THC 4.8 mg : CBD 0 mg')
    enter(/thc declarado/i, '15')
    expect(porInhalacion()).toHaveTextContent('≈ THC 0.8 mg : CBD 0 mg')
    enter(/thc declarado/i, '66')
    expect(porToma()).toHaveTextContent(/faltan inhalaciones por toma/i)
    enter(/inhalaciones por toma/i, '2')
    expect(porToma()).toHaveTextContent('≈ THC 7 mg : CBD 0 mg')
    enter(/inhalaciones por toma/i, '4')
    expect(porToma()).toHaveTextContent('≈ THC 14 mg : CBD 0 mg')
    enter(/duración de la inhalación/i, 'corta')
    expect(porToma()).toHaveTextContent('≈ THC 6 mg : CBD 0 mg')
    enter(/duración de la inhalación/i, 'larga')
    expect(porToma()).toHaveTextContent('≈ THC 22 mg : CBD 0 mg')
    enter(/inhalaciones por toma/i, '1.5')
    expect(screen.getByRole('alert')).toHaveTextContent(/entero/i)
  })

  it.each([
    ['0.3', '0.016'],
    ['1', '0.053'],
    ['5', '0.27'],
    ['15', '0.8'],
    ['30', '1.6'],
    ['50', '2.7'],
    ['66', '3.5'],
    ['80', '4.2'],
    ['100', '5.3'],
  ])('cartucho: con %s %% de THC estima %s mg, sin redondear a cero', (percent, mg) => {
    render(<CannabinoidCalculator />)
    fillCartridge('0', percent)
    expect(porInhalacion()).toHaveTextContent(`≈ THC ${mg} mg : CBD 0 mg`)
  })

  it('cartucho: también funciona si la etiqueta da mg totales', () => {
    render(<CannabinoidCalculator />)
    enter(/tipo de producto/i, 'inhalation')
    enter(/la etiqueta muestra/i, 'total_mg')
    enter(/contenido del producto/i, '1')
    enter(/cbd declarado/i, '0')
    enter(/thc declarado/i, '660')
    expect(porInhalacion()).toHaveTextContent('≈ THC 3.5 mg : CBD 0 mg')
  })

  it('cartucho: también estima el CBD del producto', () => {
    render(<CannabinoidCalculator />)
    fillCartridge('70', '0')
    expect(porInhalacion()).toHaveTextContent('≈ THC 0 mg : CBD 3.7 mg')
    enter(/cbd declarado/i, '40')
    enter(/thc declarado/i, '40')
    expect(porInhalacion()).toHaveTextContent('≈ THC 2.1 mg : CBD 2.1 mg')
  })

  it('cartucho: lo medido se respeta tal cual y exige THC declarado', () => {
    render(<CannabinoidCalculator />)
    fillCartridge('20', '40')
    enter(/duración de la inhalación/i, 'medido')
    expect(screen.getByRole('alert')).toHaveTextContent(/falta.*thc por inhalación/i)
    enter(/mg de thc por inhalación/i, '2')
    expect(porInhalacion()).toHaveTextContent('≈ THC 2 mg : CBD 1 mg')
    enter(/thc declarado/i, '0')
    expect(screen.getByRole('alert')).toHaveTextContent(/thc declarado.*mayor que 0/i)
  })

  it('flor: los mg por inhalación suben y bajan con el porcentaje', () => {
    render(<CannabinoidCalculator />)
    enter(/tipo de producto/i, 'flower')
    enter(/flor por carga/i, '0.1')
    enter(/cbd en etiqueta/i, '0')
    enter(/thc en etiqueta/i, '15')
    enter(/inhalaciones por carga/i, '5')
    expect(screen.getByText('Por inhalación teórica').parentElement).toHaveTextContent('THC 3 mg : CBD 0 mg')
    enter(/thc en etiqueta/i, '20')
    expect(screen.getByText('Por inhalación teórica').parentElement).toHaveTextContent('THC 4 mg : CBD 0 mg')
  })

  it('calcula flor con datos explícitos y rechaza porcentajes incompatibles', () => {
    render(<CannabinoidCalculator />)
    enter(/tipo de producto/i, 'flower')
    enter(/flor por carga/i, '0.1')
    enter(/cbd en etiqueta/i, '0')
    enter(/thc en etiqueta/i, '10')
    enter(/inhalaciones por carga/i, '5')
    expect(screen.getByText('THC 10 mg : CBD 0 mg')).toBeInTheDocument()
    expect(screen.getByText('THC 2 mg : CBD 0 mg')).toBeInTheDocument()
    enter(/cbd en etiqueta/i, '95')
    expect(screen.getByRole('alert')).toHaveTextContent(/100/i)
    expect(screen.queryByText('THC 2 mg : CBD 0 mg')).not.toBeInTheDocument()
  })

  it('flor: rechaza inhalaciones fraccionarias, acepta una y explica que reparten el total', () => {
    render(<CannabinoidCalculator />)
    enter(/tipo de producto/i, 'flower')
    enter(/flor por carga/i, '1')
    enter(/cbd en etiqueta/i, '0')
    enter(/thc en etiqueta/i, '70')
    expect(screen.getByText(/reparten ese total/i)).toBeInTheDocument()
    enter(/inhalaciones por carga/i, '0.1')
    expect(screen.getByRole('alert')).toHaveTextContent(/entero/i)
    expect(screen.queryByText('0 estimadas')).not.toBeInTheDocument()
    enter(/inhalaciones por carga/i, '1')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Por inhalación teórica').parentElement).toHaveTextContent('THC 700 mg : CBD 0 mg')
    expect(screen.getByText('1 estimadas')).toBeInTheDocument()
  })
})

it('explica el porcentaje del aceite sin abreviaturas técnicas en los controles principales',()=>{
  render(<CannabinoidCalculator />)
  expect(screen.getByRole('option',{name:'Concentración (%) del aceite'})).toBeInTheDocument()
  expect(screen.getByText(/CBD al 10 % equivale a 100 mg en cada mL de aceite/)).toBeVisible()
  expect(screen.getByText(/masa por volumen/)).not.toBeVisible()
  fillOil()
  expect(screen.getByText('THC 0 % : CBD 10 %')).toBeInTheDocument()
})

it('en inglés traduce campos, unidades, resultados y avisos', () => {
  render(<LanguageProvider locale="en"><CannabinoidCalculator /></LanguageProvider>)
  expect(screen.getByRole('alert')).toHaveTextContent('Bottle volume is missing.')
  fireEvent.change(screen.getByLabelText(/bottle volume/i), { target: { value: '10' } })
  fireEvent.change(screen.getByLabelText(/declared cbd/i), { target: { value: '10' } })
  fireEvent.change(screen.getByLabelText(/declared thc/i), { target: { value: '5' } })
  fireEvent.change(screen.getByLabelText(/drops per dose/i), { target: { value: '4' } })
  fireEvent.change(screen.getByLabelText(/doses per day/i), { target: { value: '3' } })
  expect(screen.getByText('Per drop')).toBeInTheDocument()
  expect(screen.getByText('Per day')).toBeInTheDocument()
  expect(screen.getByText('50 doses · 16.7 days')).toBeInTheDocument()
})

it('estándar EVIPro: THC primero en campos, resultados y proporción', () => {
  render(<CannabinoidCalculator />)
  const campos = screen.getAllByRole('spinbutton').map(campo => campo.closest('div')?.parentElement?.textContent ?? '')
  expect(campos.findIndex(texto => /THC declarado/i.test(texto))).toBeLessThan(campos.findIndex(texto => /CBD declarado/i.test(texto)))
  enter(/volumen del frasco/i, '10')
  enter(/cbd declarado/i, '10')
  enter(/thc declarado/i, '0.9')
  expect(screen.getByText('THC 9 mg/ml : CBD 100 mg/ml')).toBeInTheDocument()
  expect(screen.getByText('1:11 THC:CBD · CBD dominante')).toBeInTheDocument()
})

it('en inglés traduce la proporción', () => {
  render(<LanguageProvider locale="en"><CannabinoidCalculator /></LanguageProvider>)
  fireEvent.change(screen.getByLabelText(/bottle volume/i), { target: { value: '10' } })
  fireEvent.change(screen.getByLabelText(/declared cbd/i), { target: { value: '10' } })
  fireEvent.change(screen.getByLabelText(/declared thc/i), { target: { value: '5' } })
  expect(screen.getByText('1:2 THC:CBD · CBD dominant')).toBeInTheDocument()
})
