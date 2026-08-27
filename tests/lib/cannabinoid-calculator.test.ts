import { describe, expect, it } from 'vitest'
import {
  calculateInhalationMetrics,
  calculateOilMetrics,
  cannabinoidRatio,
  concentrationFromInput,
} from '../../lib/cannabinoid-calculator'

describe('cannabinoid calculator', () => {
  it('convierte mg totales a mg/ml', () => {
    expect(concentrationFromInput('total_mg', 1500, 30)).toBe(50)
  })

  it('convierte porcentaje p/v a mg/ml', () => {
    expect(concentrationFromInput('percent_weight_volume', 10, 30)).toBe(100)
  })

  it('calcula gotas, toma y duración aproximada para aceite', () => {
    const result = calculateOilMetrics({
      inputMode: 'total_mg',
      volumeMl: 30,
      cbdValue: 1500,
      thcValue: 0,
      dropsPerMl: 20,
      dropsPerDose: 4,
      dosesPerDay: 2,
    })

    expect(result.cbdMgPerMl).toBe(50)
    expect(result.cbdMgPerDrop).toBe(2.5)
    expect(result.cbdMgPerDose).toBe(10)
    expect(result.totalDrops).toBe(600)
    expect(result.dosesPerBottle).toBe(150)
    expect(result.estimatedDays).toBe(75)
  })

  it('calcula mg teóricos por inhalación desde volumen e inhalaciones estimadas', () => {
    const result = calculateInhalationMetrics({
      inputMode: 'mg_per_ml',
      volumeMl: 0.5,
      cbdValue: 50,
      thcValue: 10,
      expectedInhalations: 100,
    })

    expect(result.cbdTotalMg).toBe(25)
    expect(result.thcTotalMg).toBe(5)
    expect(result.cbdMgPerInhalation).toBe(0.25)
    expect(result.thcMgPerInhalation).toBe(0.05)
  })

  it('expresa la relación CBD:THC de forma legible', () => {
    expect(cannabinoidRatio(50, 2.5)).toBe('20 : 1')
    expect(cannabinoidRatio(1, 4)).toBe('1 : 4')
    expect(cannabinoidRatio(50, 0)).toBe('CBD sin THC declarado')
  })
})
