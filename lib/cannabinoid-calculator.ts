export type OilInputMode = 'mg_per_ml' | 'total_mg' | 'percent_weight_volume'
export type CannabinoidInputMode = OilInputMode
export type InhalationInputMode = 'percent_of_product' | 'total_mg'

export type OilCalculatorInput = {
  inputMode: OilInputMode
  volumeMl: number
  cbdValue: number
  thcValue: number
  dropsPerMl: number
  dropsPerDose: number
  dosesPerDay: number
}

export type InhalationCalculatorInput = {
  inputMode: InhalationInputMode
  productGrams: number
  cbdValue: number
  thcValue: number
  expectedInhalations: number
}

export type FlowerCalculatorInput = {
  flowerGrams: number
  cbdPercent: number
  thcPercent: number
  expectedInhalations: number
}

export const DEFAULT_DROPS_PER_ML = 20

function positive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function roundTo(value: number, decimals = 2) {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function concentrationFromInput(
  mode: OilInputMode,
  value: number,
  volumeMl: number,
) {
  const safeValue = positive(value)
  const safeVolume = positive(volumeMl)

  if (mode === 'mg_per_ml') return safeValue
  if (mode === 'percent_weight_volume') return safeValue * 10
  if (!safeVolume) return 0
  return safeValue / safeVolume
}

export function percentWeightVolumeFromConcentration(mgPerMl: number) {
  return positive(mgPerMl) / 10
}

export function inhalationTotalFromInput(
  mode: InhalationInputMode,
  value: number,
  productGrams: number,
) {
  const safeValue = positive(value)
  const safeGrams = positive(productGrams)

  if (mode === 'percent_of_product') return safeGrams * 1000 * (safeValue / 100)
  return safeValue
}

export function percentOfProductFromTotal(totalMg: number, productGrams: number) {
  const safeTotal = positive(totalMg)
  const safeGrams = positive(productGrams)

  if (!safeGrams) return 0
  return (safeTotal / (safeGrams * 1000)) * 100
}

export function cannabinoidRatio(cbdMgPerMl: number, thcMgPerMl: number) {
  const cbd = positive(cbdMgPerMl)
  const thc = positive(thcMgPerMl)

  if (!cbd && !thc) return 'Sin datos'
  if (!thc) return 'CBD sin THC declarado'
  if (!cbd) return 'THC sin CBD declarado'

  const ratio = cbd / thc
  if (ratio >= 1) return `${formatRatioPart(ratio)} : 1`
  return `1 : ${formatRatioPart(1 / ratio)}`
}

function formatRatioPart(value: number) {
  const rounded = Math.round(value)
  if (Math.abs(value - rounded) < 0.05) return String(rounded)
  if (value >= 10) return trimZeros(value.toFixed(1))
  return trimZeros(value.toFixed(2))
}

function trimZeros(value: string) {
  return value.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}

export function calculateOilMetrics(input: OilCalculatorInput) {
  const volumeMl = positive(input.volumeMl)
  const dropsPerMl = positive(input.dropsPerMl) || DEFAULT_DROPS_PER_ML
  const dropsPerDose = positive(input.dropsPerDose)
  const dosesPerDay = positive(input.dosesPerDay)

  const cbdMgPerMl = concentrationFromInput(input.inputMode, input.cbdValue, volumeMl)
  const thcMgPerMl = concentrationFromInput(input.inputMode, input.thcValue, volumeMl)
  const cbdMgPerDrop = cbdMgPerMl / dropsPerMl
  const thcMgPerDrop = thcMgPerMl / dropsPerMl
  const totalDrops = volumeMl * dropsPerMl
  const dosesPerBottle = dropsPerDose ? totalDrops / dropsPerDose : 0

  return {
    cbdMgPerMl: roundTo(cbdMgPerMl),
    thcMgPerMl: roundTo(thcMgPerMl),
    cbdMgPerDrop: roundTo(cbdMgPerDrop, 3),
    thcMgPerDrop: roundTo(thcMgPerDrop, 3),
    cbdMgPerDose: roundTo(cbdMgPerDrop * dropsPerDose, 3),
    thcMgPerDose: roundTo(thcMgPerDrop * dropsPerDose, 3),
    cbdTotalMg: roundTo(cbdMgPerMl * volumeMl),
    thcTotalMg: roundTo(thcMgPerMl * volumeMl),
    cbdPercentWeightVolume: roundTo(percentWeightVolumeFromConcentration(cbdMgPerMl), 2),
    thcPercentWeightVolume: roundTo(percentWeightVolumeFromConcentration(thcMgPerMl), 2),
    totalDrops: roundTo(totalDrops),
    dosesPerBottle: roundTo(dosesPerBottle),
    estimatedDays: roundTo(dosesPerBottle && dosesPerDay ? dosesPerBottle / dosesPerDay : 0),
    ratio: cannabinoidRatio(cbdMgPerMl, thcMgPerMl),
  }
}

export function calculateInhalationMetrics(input: InhalationCalculatorInput) {
  const productGrams = positive(input.productGrams)
  const expectedInhalations = positive(input.expectedInhalations)
  const cbdTotalMg = inhalationTotalFromInput(input.inputMode, input.cbdValue, productGrams)
  const thcTotalMg = inhalationTotalFromInput(input.inputMode, input.thcValue, productGrams)
  const cbdPercentOfProduct = percentOfProductFromTotal(cbdTotalMg, productGrams)
  const thcPercentOfProduct = percentOfProductFromTotal(thcTotalMg, productGrams)

  return {
    cbdTotalMg: roundTo(cbdTotalMg),
    thcTotalMg: roundTo(thcTotalMg),
    cbdPercentOfProduct: roundTo(cbdPercentOfProduct, 2),
    thcPercentOfProduct: roundTo(thcPercentOfProduct, 2),
    cbdMgPerInhalation: roundTo(expectedInhalations ? cbdTotalMg / expectedInhalations : 0, 3),
    thcMgPerInhalation: roundTo(expectedInhalations ? thcTotalMg / expectedInhalations : 0, 3),
    expectedInhalations: roundTo(expectedInhalations),
    productGrams: roundTo(productGrams, 3),
    ratio: cannabinoidRatio(cbdTotalMg, thcTotalMg),
  }
}

export function calculateFlowerMetrics(input: FlowerCalculatorInput) {
  const flowerGrams = positive(input.flowerGrams)
  const expectedInhalations = positive(input.expectedInhalations)
  const cbdTotalMg = inhalationTotalFromInput('percent_of_product', input.cbdPercent, flowerGrams)
  const thcTotalMg = inhalationTotalFromInput('percent_of_product', input.thcPercent, flowerGrams)

  return {
    flowerGrams: roundTo(flowerGrams, 3),
    cbdTotalMg: roundTo(cbdTotalMg),
    thcTotalMg: roundTo(thcTotalMg),
    cbdPercentOfFlower: roundTo(positive(input.cbdPercent), 2),
    thcPercentOfFlower: roundTo(positive(input.thcPercent), 2),
    cbdMgPerInhalation: roundTo(expectedInhalations ? cbdTotalMg / expectedInhalations : 0, 3),
    thcMgPerInhalation: roundTo(expectedInhalations ? thcTotalMg / expectedInhalations : 0, 3),
    expectedInhalations: roundTo(expectedInhalations),
    ratio: cannabinoidRatio(cbdTotalMg, thcTotalMg),
  }
}
