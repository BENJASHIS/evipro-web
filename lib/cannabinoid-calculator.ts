// El gotero que maneja EVIPro: mismo valor que GOTAS_ML_ESTANDAR en core/dosis.py.
export const DEFAULT_DROPS_PER_ML = 20

// mg de la app clínica (PERFILES_INHALACION en core/unidades.py), que EVIPro maneja
// para vaporizador de 66 % o más. Se toma 66 % como referencia y se escala linealmente:
// estimación mecánica, sin estudio que la mida. Ver evidence/appraisal/2026-11-06-thc-por-inhalacion.md.
// En flor no aplica: el vapor no tiene el % de la flor, así que ahí se reparte la carga.
export const REFERENCE_EXTRACT_PERCENT = 66
export const INHALATION_PROFILES = [
  { value: 'corta', label: 'Corta · 1-2 s', thcMg: 1.5 },
  { value: 'estandar', label: 'Estándar · 3-4 s', thcMg: 3.5 },
  { value: 'larga', label: 'Larga · 5+ s', thcMg: 5.5 },
]

export type OilInputMode = 'mg_per_ml' | 'total_mg' | 'percent_weight_volume'
export type CannabinoidInputMode = OilInputMode
export type InhalationInputMode = 'percent_of_product' | 'total_mg'

type NumericInput = number | null

export type OilCalculatorInput = {
  inputMode: OilInputMode
  volumeMl: NumericInput
  cbdValue: NumericInput
  thcValue: NumericInput
  dropsPerMl: NumericInput
  dropsPerDose: NumericInput
  dosesPerDay: NumericInput
}

export type InhalationCalculatorInput = {
  inputMode: InhalationInputMode
  productGrams: NumericInput
  cbdValue: NumericInput
  thcValue: NumericInput
  expectedInhalations: NumericInput
}

export type FlowerCalculatorInput = {
  flowerGrams: NumericInput
  cbdPercent: NumericInput
  thcPercent: NumericInput
  expectedInhalations: NumericInput
}

function requiredNumber(value: NumericInput, label: string, positive = false) {
  if (value === null) throw new RangeError(`Falta ${label}.`)
  if (!Number.isFinite(value) || value < 0 || (positive && value === 0)) {
    throw new RangeError(`${label}: introduce un número finito ${positive ? 'mayor que 0' : 'igual o mayor que 0'}.`)
  }
  return value
}

function optionalPositive(value: NumericInput, label: string) {
  return value === null ? null : requiredNumber(value, label, true)
}

export function roundTo(value: number, decimals?: number): number
export function roundTo(value: number | null, decimals?: number): number | null
export function roundTo(value: number | null, decimals = 2) {
  if (value === null) return null
  const factor = 10 ** decimals
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor
  if (!Number.isFinite(rounded)) throw new RangeError('El resultado excede el rango numérico. Revisa las cantidades y unidades.')
  return rounded
}

export function concentrationFromInput(
  mode: OilInputMode,
  value: number,
  volumeMl: number,
) {
  requiredNumber(value, 'Contenido declarado')
  requiredNumber(volumeMl, 'Volumen del frasco', true)

  if (mode === 'mg_per_ml') return value
  if (mode === 'percent_weight_volume') return value * 10
  return value / volumeMl
}

export function percentWeightVolumeFromConcentration(mgPerMl: number) {
  return requiredNumber(mgPerMl, 'Concentración') / 10
}

export function inhalationTotalFromInput(
  mode: InhalationInputMode,
  value: number,
  productGrams: number,
) {
  requiredNumber(value, 'Contenido declarado')
  requiredNumber(productGrams, 'Contenido del producto', true)

  if (mode === 'percent_of_product') return productGrams * 1000 * (value / 100)
  return value
}

export function percentOfProductFromTotal(totalMg: number, productGrams: number) {
  requiredNumber(totalMg, 'Contenido declarado')
  requiredNumber(productGrams, 'Contenido del producto', true)
  return (totalMg / (productGrams * 1000)) * 100
}

export function cannabinoidRatio(cbdMgPerMl: number, thcMgPerMl: number) {
  const cbd = requiredNumber(cbdMgPerMl, 'CBD declarado')
  const thc = requiredNumber(thcMgPerMl, 'THC declarado')

  if (!cbd && !thc) return 'Sin cannabinoides declarados'
  if (!thc) return 'CBD sin THC declarado'
  if (!cbd) return 'THC sin CBD declarado'

  // Estándar EVIPro: THC primero y se dice cuál domina. Mismos cortes que
  // core/dosis.py::calcular_ratio.
  const cbdPerThc = cbd / thc
  const larger = cbdPerThc >= 1 ? cbdPerThc : thc / cbd
  if (!Number.isFinite(larger)) throw new RangeError('La relación excede el rango numérico. Revisa las cantidades.')
  const part = formatRatioPart(larger)
  const dominance = cbdPerThc >= 0.8 && cbdPerThc < 2 ? 'balanceado' : cbdPerThc > 1 ? 'CBD dominante' : 'THC dominante'
  return `${cbdPerThc >= 1 ? `1:${part}` : `${part}:1`} THC:CBD · ${dominance}`
}

function formatRatioPart(value: number) {
  return value >= 10 ? String(Math.round(value)) : String(Number(value.toFixed(1)))
}

export function calculateOilMetrics(input: OilCalculatorInput) {
  const volumeMl = requiredNumber(input.volumeMl, 'Volumen del frasco', true)
  const cbdValue = requiredNumber(input.cbdValue, 'CBD declarado')
  const thcValue = requiredNumber(input.thcValue, 'THC declarado')
  const dropsPerMl = input.dropsPerMl === null ? DEFAULT_DROPS_PER_ML : requiredNumber(input.dropsPerMl, 'Gotas por ml', true)
  const dropsPerDose = optionalPositive(input.dropsPerDose, 'Gotas por toma')
  const dosesPerDay = optionalPositive(input.dosesPerDay, 'Tomas por día')

  const cbdMgPerMl = concentrationFromInput(input.inputMode, cbdValue, volumeMl)
  const thcMgPerMl = concentrationFromInput(input.inputMode, thcValue, volumeMl)
  const cbdMgPerDrop = cbdMgPerMl / dropsPerMl
  const thcMgPerDrop = thcMgPerMl / dropsPerMl
  const totalDrops = volumeMl * dropsPerMl
  const dosesPerBottle = dropsPerDose === null ? null : totalDrops / dropsPerDose

  return {
    cbdMgPerMl: roundTo(cbdMgPerMl),
    thcMgPerMl: roundTo(thcMgPerMl),
    cbdMgPerDrop: roundTo(cbdMgPerDrop, 3),
    thcMgPerDrop: roundTo(thcMgPerDrop, 3),
    cbdMgPerDose: roundTo(dropsPerDose === null ? null : cbdMgPerDrop * dropsPerDose, 3),
    thcMgPerDose: roundTo(dropsPerDose === null ? null : thcMgPerDrop * dropsPerDose, 3),
    cbdMgPerDay: roundTo(dropsPerDose === null || dosesPerDay === null ? null : cbdMgPerDrop * dropsPerDose * dosesPerDay, 3),
    thcMgPerDay: roundTo(dropsPerDose === null || dosesPerDay === null ? null : thcMgPerDrop * dropsPerDose * dosesPerDay, 3),
    cbdTotalMg: roundTo(cbdMgPerMl * volumeMl),
    thcTotalMg: roundTo(thcMgPerMl * volumeMl),
    cbdPercentWeightVolume: roundTo(percentWeightVolumeFromConcentration(cbdMgPerMl), 2),
    thcPercentWeightVolume: roundTo(percentWeightVolumeFromConcentration(thcMgPerMl), 2),
    totalDrops: roundTo(totalDrops),
    dosesPerBottle: roundTo(dosesPerBottle),
    estimatedDays: roundTo(dosesPerBottle === null || dosesPerDay === null ? null : dosesPerBottle / dosesPerDay),
    ratio: cannabinoidRatio(cbdMgPerMl, thcMgPerMl),
  }
}

export function calculateInhalationMetrics(input: InhalationCalculatorInput) {
  const productGrams = requiredNumber(input.productGrams, 'Contenido del producto', true)
  const cbdValue = requiredNumber(input.cbdValue, 'CBD declarado')
  const thcValue = requiredNumber(input.thcValue, 'THC declarado')
  const expectedInhalations = optionalPositive(input.expectedInhalations, 'Inhalaciones estimadas')
  if (expectedInhalations !== null && !Number.isInteger(expectedInhalations)) {
    throw new RangeError('Inhalaciones estimadas: introduce un número entero mayor que 0.')
  }
  if (input.inputMode === 'percent_of_product' && cbdValue + thcValue > 100) {
    throw new RangeError('THC + CBD no puede superar el 100 % de la masa del producto.')
  }
  if (input.inputMode === 'total_mg' && cbdValue + thcValue > productGrams * 1000) {
    throw new RangeError('Los mg de THC + CBD no pueden superar la masa del producto (g × 1000).')
  }

  const cbdTotalMg = inhalationTotalFromInput(input.inputMode, cbdValue, productGrams)
  const thcTotalMg = inhalationTotalFromInput(input.inputMode, thcValue, productGrams)
  const cbdPercentOfProduct = percentOfProductFromTotal(cbdTotalMg, productGrams)
  const thcPercentOfProduct = percentOfProductFromTotal(thcTotalMg, productGrams)

  return {
    cbdTotalMg: roundTo(cbdTotalMg),
    thcTotalMg: roundTo(thcTotalMg),
    cbdPercentOfProduct: roundTo(cbdPercentOfProduct, 2),
    thcPercentOfProduct: roundTo(thcPercentOfProduct, 2),
    cbdMgPerInhalation: roundTo(expectedInhalations === null ? null : cbdTotalMg / expectedInhalations, 3),
    thcMgPerInhalation: roundTo(expectedInhalations === null ? null : thcTotalMg / expectedInhalations, 3),
    expectedInhalations: roundTo(expectedInhalations),
    productGrams: roundTo(productGrams, 3),
    ratio: cannabinoidRatio(cbdTotalMg, thcTotalMg),
  }
}

export function calculateInhalationDose(input: {
  referenceThcMg: NumericInput
  referencePercent: NumericInput
  cbdPercent: number
  thcPercent: number
  inhalationsPerDose: NumericInput
}) {
  const referenceThcMg = requiredNumber(input.referenceThcMg, 'mg de THC por inhalación', true)
  const mgPerPercent = referenceThcMg / requiredNumber(input.referencePercent, 'THC declarado', true)
  const inhalations = optionalPositive(input.inhalationsPerDose, 'Inhalaciones por toma')
  if (inhalations !== null && !Number.isInteger(inhalations)) {
    throw new RangeError('Inhalaciones por toma: introduce un número entero mayor que 0.')
  }
  const cbdMg = mgPerPercent * input.cbdPercent
  const thcMg = mgPerPercent * input.thcPercent
  return {
    cbdMgPerInhalation: roundTo(cbdMg, 3),
    thcMgPerInhalation: roundTo(thcMg, 3),
    cbdMgPerDose: roundTo(inhalations === null ? null : cbdMg * inhalations, 3),
    thcMgPerDose: roundTo(inhalations === null ? null : thcMg * inhalations, 3),
  }
}

export function calculateFlowerMetrics(input: FlowerCalculatorInput) {
  const metrics = calculateInhalationMetrics({
    inputMode: 'percent_of_product',
    productGrams: input.flowerGrams,
    cbdValue: input.cbdPercent,
    thcValue: input.thcPercent,
    expectedInhalations: input.expectedInhalations,
  })
  return {
    flowerGrams: metrics.productGrams,
    cbdTotalMg: metrics.cbdTotalMg,
    thcTotalMg: metrics.thcTotalMg,
    cbdPercentOfFlower: metrics.cbdPercentOfProduct,
    thcPercentOfFlower: metrics.thcPercentOfProduct,
    cbdMgPerInhalation: metrics.cbdMgPerInhalation,
    thcMgPerInhalation: metrics.thcMgPerInhalation,
    expectedInhalations: metrics.expectedInhalations,
    ratio: metrics.ratio,
  }
}
