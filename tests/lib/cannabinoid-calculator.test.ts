import { describe, expect, it } from 'vitest'
import {
  calculateInhalationMetrics,
  calculateOilMetrics,
  cannabinoidRatio,
  concentrationFromInput,
  inhalationTotalFromInput,
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

  it('expresa la relación CBD:THC de forma legible', () => {
    expect(cannabinoidRatio(50, 2.5)).toBe('20 : 1')
    expect(cannabinoidRatio(1, 4)).toBe('1 : 4')
    expect(cannabinoidRatio(50, 0)).toBe('CBD sin THC declarado')
  })
})
