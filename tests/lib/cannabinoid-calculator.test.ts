import { describe, expect, it } from 'vitest'
import {
  calculateFlowerMetrics,
  calculateInhalationMetrics,
  calculateOilMetrics,
  cannabinoidRatio,
  concentrationFromInput,
  inhalationTotalFromInput,
  type OilCalculatorInput,
} from '../../lib/cannabinoid-calculator'

describe('cannabinoid calculator', () => {
  it('convierte mg totales a mg/ml', () => {
    expect(concentrationFromInput('total_mg', 1500, 30)).toBe(50)
  })

  it('convierte porcentaje p/v a mg/ml', () => {
    expect(concentrationFromInput('percent_weight_volume', 10, 30)).toBe(100)
  })

  it('convierte porcentaje de inhalable a mg totales del producto', () => {
    expect(inhalationTotalFromInput('percent_of_product', 70, 1)).toBe(700)
    expect(inhalationTotalFromInput('percent_of_product', 66, 0.5)).toBe(330)
  })

  it('calcula gotas, toma y duración aproximada para aceite', () => {
    const result = calculateOilMetrics({
      inputMode: 'percent_weight_volume',
      volumeMl: 10,
      cbdValue: 10,
      thcValue: 0,
      dropsPerMl: 20,
      dropsPerDose: 1,
      dosesPerDay: 1,
    })

    expect(result.cbdMgPerMl).toBe(100)
    expect(result.cbdPercentWeightVolume).toBe(10)
    expect(result.cbdMgPerDrop).toBe(5)
    expect(result.cbdMgPerDose).toBe(5)
    expect(result.totalDrops).toBe(200)
    expect(result.dosesPerBottle).toBe(200)
    expect(result.estimatedDays).toBe(200)
  })

  it('calcula mg teóricos por inhalación desde porcentaje de producto', () => {
    const result = calculateInhalationMetrics({
      inputMode: 'percent_of_product',
      productGrams: 1,
      cbdValue: 0,
      thcValue: 70,
      expectedInhalations: 100,
    })

    expect(result.cbdTotalMg).toBe(0)
    expect(result.thcTotalMg).toBe(700)
    expect(result.cbdPercentOfProduct).toBe(0)
    expect(result.thcPercentOfProduct).toBe(70)
    expect(result.cbdMgPerInhalation).toBe(0)
    expect(result.thcMgPerInhalation).toBe(7)
  })

  it('calcula contenido teórico de flor vaporizada por carga', () => {
    const result = calculateFlowerMetrics({
      flowerGrams: 0.1,
      cbdPercent: 0,
      thcPercent: 10,
      expectedInhalations: 5,
    })

    expect(result.cbdTotalMg).toBe(0)
    expect(result.thcTotalMg).toBe(10)
    expect(result.thcPercentOfFlower).toBe(10)
    expect(result.thcMgPerInhalation).toBe(2)
  })

  it('expresa la relación CBD:THC de forma legible', () => {
    expect(cannabinoidRatio(50, 2.5)).toBe('20 : 1')
    expect(cannabinoidRatio(1, 4)).toBe('1 : 4')
    expect(cannabinoidRatio(50, 0)).toBe('CBD sin THC declarado')
  })

  it.each(['percent_of_product', 'total_mg'] as const)('rechaza contenido que excede la masa del cartucho (%s)', inputMode => {
    expect(() => calculateInhalationMetrics({
      inputMode,
      productGrams: 1,
      cbdValue: inputMode === 'total_mg' ? 600 : 60,
      thcValue: inputMode === 'total_mg' ? 700 : 70,
      expectedInhalations: 100,
    })).toThrow(/100|masa/i)
  })

  it('rechaza porcentajes de flor que suman más de 100', () => {
    expect(() => calculateFlowerMetrics({
      flowerGrams: 1, cbdPercent: 60, thcPercent: 70, expectedInhalations: 10,
    })).toThrow(/100/i)
  })

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('rechaza valores declarados inválidos: %s', cbdValue => {
    expect(() => calculateInhalationMetrics({
      inputMode: 'percent_of_product', productGrams: 1, cbdValue, thcValue: 0, expectedInhalations: 100,
    })).toThrow()
    expect(() => concentrationFromInput('mg_per_ml', cbdValue, 10)).toThrow()
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rechaza masa o inhalaciones inválidas: %s', value => {
    expect(() => calculateInhalationMetrics({
      inputMode: 'percent_of_product', productGrams: value, cbdValue: 10, thcValue: 0, expectedInhalations: 100,
    })).toThrow()
    expect(() => calculateFlowerMetrics({
      flowerGrams: 1, cbdPercent: 10, thcPercent: 0, expectedInhalations: value,
    })).toThrow()
  })

  it('conserva el contenido conocido cuando faltan inhalaciones, sin inventar mg por inhalación', () => {
    const result = calculateInhalationMetrics({
      inputMode: 'percent_of_product', productGrams: 1, cbdValue: 60, thcValue: 0, expectedInhalations: null,
    })
    expect(result.cbdTotalMg).toBe(600)
    expect(result.thcTotalMg).toBe(0)
    expect(result.expectedInhalations).toBeNull()
    expect(result.cbdMgPerInhalation).toBeNull()
    expect(result.thcMgPerInhalation).toBeNull()
  })

  it.each(['cartucho', 'flor'] as const)('exige un conteo entero de inhalaciones y acepta una inhalación en %s', product => {
    const calculate = (expectedInhalations: number) => product === 'cartucho'
      ? calculateInhalationMetrics({
        inputMode: 'percent_of_product', productGrams: 1, cbdValue: 0, thcValue: 70, expectedInhalations,
      })
      : calculateFlowerMetrics({ flowerGrams: 1, cbdPercent: 0, thcPercent: 70, expectedInhalations })

    expect(() => calculate(0.1)).toThrow(/entero/i)
    const result = calculate(1)
    expect(result.expectedInhalations).toBe(1)
    expect(result.thcTotalMg).toBe(700)
    expect(result.thcMgPerInhalation).toBe(700)
  })

  const oilInput: OilCalculatorInput = {
    inputMode: 'percent_weight_volume', volumeMl: 10, cbdValue: 10, thcValue: 0,
    dropsPerMl: 20, dropsPerDose: 1, dosesPerDay: 1,
  }

  it('no aplica el límite de porcentaje en masa a aceite expresado en p/v', () => {
    const result = calculateOilMetrics({ ...oilInput, cbdValue: 60, thcValue: 70 })
    expect(result.cbdMgPerMl).toBe(600)
    expect(result.thcMgPerMl).toBe(700)
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rechaza gotero inválido sin asumir 20: %s', dropsPerMl => {
    expect(() => calculateOilMetrics({ ...oilInput, dropsPerMl })).toThrow(/gotas por ml/i)
  })

  it('permite concentración sin datos opcionales de uso y no inventa un gotero', () => {
    const result = calculateOilMetrics({ ...oilInput, dropsPerMl: null, dropsPerDose: null, dosesPerDay: null })
    expect(result.cbdMgPerMl).toBe(100)
    expect(result.thcMgPerMl).toBe(0)
    expect(result.cbdMgPerDrop).toBeNull()
    expect(result.cbdMgPerDose).toBeNull()
    expect(result.totalDrops).toBeNull()
    expect(result.dosesPerBottle).toBeNull()
    expect(result.estimatedDays).toBeNull()
  })

  it('calcula las métricas disponibles aunque falten tomas por día', () => {
    const result = calculateOilMetrics({ ...oilInput, dosesPerDay: null })
    expect(result.cbdMgPerDrop).toBe(5)
    expect(result.cbdMgPerDose).toBe(5)
    expect(result.dosesPerBottle).toBe(200)
    expect(result.estimatedDays).toBeNull()
  })

  it.each(['volumeMl', 'cbdValue', 'thcValue'] as const)('rechaza dato obligatorio de aceite ausente: %s', field => {
    expect(() => calculateOilMetrics({ ...oilInput, [field]: null })).toThrow(/falta/i)
  })
  it('rechaza operaciones que desbordan en lugar de mostrar infinito', () => {
    expect(() => calculateOilMetrics({ ...oilInput, volumeMl: 1e308 })).toThrow()
  })
})
