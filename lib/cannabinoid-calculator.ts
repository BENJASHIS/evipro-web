export type CannabinoidInputMode = 'mg_per_ml' | 'total_mg' | 'percent_weight_volume'

export type OilCalculatorInput = {
  inputMode: CannabinoidInputMode
  volumeMl: number
  cbdValue: number
  thcValue: number
  dropsPerMl: number
  dropsPerDose: number
  dosesPerDay: number
}

export type InhalationCalculatorInput = {
  inputMode: CannabinoidInputMode
  volumeMl: number
  cbdValue: number
  thcValue: number
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
  mode: CannabinoidInputMode,
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
    totalDrops: roundTo(totalDrops),
    dosesPerBottle: roundTo(dosesPerBottle),
    estimatedDays: roundTo(dosesPerBottle && dosesPerDay ? dosesPerBottle / dosesPerDay : 0),
    ratio: cannabinoidRatio(cbdMgPerMl, thcMgPerMl),
  }
}

export function calculateInhalationMetrics(input: InhalationCalculatorInput) {
  const volumeMl = positive(input.volumeMl)
  const expectedInhalations = positive(input.expectedInhalations)
  const cbdMgPerMl = concentrationFromInput(input.inputMode, input.cbdValue, volumeMl)
  const thcMgPerMl = concentrationFromInput(input.inputMode, input.thcValue, volumeMl)
  const cbdTotalMg = cbdMgPerMl * volumeMl
  const thcTotalMg = thcMgPerMl * volumeMl

  return {
    cbdMgPerMl: roundTo(cbdMgPerMl),
    thcMgPerMl: roundTo(thcMgPerMl),
    cbdTotalMg: roundTo(cbdTotalMg),
    thcTotalMg: roundTo(thcTotalMg),
    cbdMgPerInhalation: roundTo(expectedInhalations ? cbdTotalMg / expectedInhalations : 0, 3),
    thcMgPerInhalation: roundTo(expectedInhalations ? thcTotalMg / expectedInhalations : 0, 3),
    expectedInhalations: roundTo(expectedInhalations),
    ratio: cannabinoidRatio(cbdMgPerMl, thcMgPerMl),
  }
}
