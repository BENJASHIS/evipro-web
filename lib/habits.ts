export const HABIT_LOG_VERSION = '2026.08.27'

export const HABIT_SYMPTOMS = [
  { key: 'pain', label: 'Dolor' },
  { key: 'anxiety', label: 'Ansiedad' },
  { key: 'nausea', label: 'Náuseas' },
  { key: 'dizziness', label: 'Mareo' },
  { key: 'appetite', label: 'Apetito bajo' },
] as const

export const MEDICATION_STATUSES = ['not_applicable', 'taken', 'missed', 'changed'] as const

export type HabitSymptomKey = typeof HABIT_SYMPTOMS[number]['key']
export type MedicationStatus = typeof MEDICATION_STATUSES[number]
export type HabitSymptoms = Record<HabitSymptomKey, number>

export type HabitLogData = {
  version: string
  log_date: string
  sleep_hours: number | null
  sleep_quality: number | null
  sleepiness: number | null
  water_ml: number | null
  alcohol_units: number
  medication_status: MedicationStatus
  meals_regular: boolean | null
  symptoms: HabitSymptoms
}

export type HabitLogRecord = HabitLogData & {
  id: string
  created_at: string
  updated_at: string
}

export type HabitSummary = {
  daysLogged: number
  avgSleepHours: number | null
  avgWaterMl: number | null
  alcoholDays: number
  medicationFlags: number
  highSymptomDays: number
}

type ValidationResult =
  | { ok: true; data: HabitLogData }
  | { ok: false; error: string }

const DEFAULT_SYMPTOMS: HabitSymptoms = {
  pain: 0,
  anxiety: 0,
  nausea: 0,
  dizziness: 0,
  appetite: 0,
}

function asObject(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as Record<string, unknown>
}

function finiteNumber(value: unknown) {
  if (value === '' || value === null || typeof value === 'undefined') return null
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function optionalNumber(
  value: unknown,
  field: string,
  min: number,
  max: number,
): { ok: true; value: number | null } | { ok: false; error: string } {
  const parsed = finiteNumber(value)
  if (parsed === null) return { ok: true, value: null }
  if (parsed < min || parsed > max) return { ok: false, error: `${field} fuera de rango.` }
  return { ok: true, value: Math.round(parsed * 100) / 100 }
}

function requiredNumber(
  value: unknown,
  field: string,
  min: number,
  max: number,
): { ok: true; value: number } | { ok: false; error: string } {
  const parsed = finiteNumber(value)
  if (parsed === null) return { ok: false, error: `${field} es obligatorio.` }
  if (parsed < min || parsed > max) return { ok: false, error: `${field} fuera de rango.` }
  return { ok: true, value: Math.round(parsed * 100) / 100 }
}

function optionalInteger(
  value: unknown,
  field: string,
  min: number,
  max: number,
): { ok: true; value: number | null } | { ok: false; error: string } {
  const parsed = optionalNumber(value, field, min, max)
  if (!parsed.ok || parsed.value === null) return parsed
  if (!Number.isInteger(parsed.value)) return { ok: false, error: `${field} debe ser entero.` }
  return { ok: true, value: parsed.value }
}

function score(value: unknown, field: string) {
  const parsed = requiredNumber(value, field, 0, 3)
  if (!parsed.ok) return parsed
  if (!Number.isInteger(parsed.value)) return { ok: false as const, error: `${field} debe ser entero.` }
  return parsed
}

function isMedicationStatus(value: unknown): value is MedicationStatus {
  return typeof value === 'string' && MEDICATION_STATUSES.includes(value as MedicationStatus)
}

function dateOnly(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return null
  if (date.toISOString().slice(0, 10) !== value) return null
  return value
}

export function validateHabitPayload(raw: unknown): ValidationResult {
  const body = asObject(raw)
  if (!body) return { ok: false, error: 'Solicitud inválida.' }

  const logDate = dateOnly(body.log_date)
  if (!logDate) return { ok: false, error: 'Fecha inválida.' }

  const sleepHours = optionalNumber(body.sleep_hours, 'Sueño', 0, 24)
  if (!sleepHours.ok) return sleepHours
  const sleepQuality = optionalInteger(body.sleep_quality, 'Calidad de sueño', 1, 5)
  if (!sleepQuality.ok) return sleepQuality
  const sleepiness = optionalInteger(body.sleepiness, 'Somnolencia', 0, 3)
  if (!sleepiness.ok) return sleepiness
  const waterMl = optionalInteger(body.water_ml, 'Agua', 0, 10000)
  if (!waterMl.ok) return waterMl
  const alcoholUnits = requiredNumber(body.alcohol_units ?? 0, 'Alcohol', 0, 30)
  if (!alcoholUnits.ok) return alcoholUnits

  const medicationStatus = isMedicationStatus(body.medication_status)
    ? body.medication_status
    : 'not_applicable'
  const mealsRegular = typeof body.meals_regular === 'boolean' ? body.meals_regular : null

  const rawSymptoms = asObject(body.symptoms) ?? {}
  const symptoms = { ...DEFAULT_SYMPTOMS }
  for (const symptom of HABIT_SYMPTOMS) {
    const parsed = score(rawSymptoms[symptom.key] ?? 0, symptom.label)
    if (!parsed.ok) return parsed
    symptoms[symptom.key] = parsed.value
  }

  return {
    ok: true,
    data: {
      version: HABIT_LOG_VERSION,
      log_date: logDate,
      sleep_hours: sleepHours.value,
      sleep_quality: sleepQuality.value,
      sleepiness: sleepiness.value,
      water_ml: waterMl.value,
      alcohol_units: alcoholUnits.value,
      medication_status: medicationStatus,
      meals_regular: mealsRegular,
      symptoms,
    },
  }
}

export function buildHabitAlerts(log: Pick<HabitLogData, 'sleep_hours' | 'sleepiness' | 'alcohol_units' | 'medication_status' | 'symptoms'>) {
  const alerts: string[] = []

  if (log.alcohol_units > 0 && (log.sleepiness ?? 0) >= 2) {
    alerts.push('Alcohol y somnolencia el mismo día: coméntalo en consulta si se repite.')
  } else if (log.alcohol_units > 0) {
    alerts.push('Alcohol registrado: si usas cannabis, sedantes u otros fármacos, revísalo con tu médico.')
  }

  if (log.medication_status === 'missed') {
    alerts.push('Fármaco olvidado: no dupliques dosis sin indicación profesional.')
  }

  if (log.medication_status === 'changed') {
    alerts.push('Cambio de fármaco registrado: confirma cualquier ajuste con tu profesional tratante.')
  }

  if (typeof log.sleep_hours === 'number' && log.sleep_hours > 0 && log.sleep_hours < 4) {
    alerts.push('Sueño muy reducido: observa si se acompaña de más síntomas o somnolencia.')
  }

  if (log.symptoms.dizziness >= 2) {
    alerts.push('Mareo moderado o intenso: registra el contexto y consúltalo si persiste o empeora.')
  }

  if (log.symptoms.anxiety >= 3 || log.symptoms.pain >= 3 || log.symptoms.nausea >= 3) {
    alerts.push('Síntoma intenso registrado: llévalo a tu próxima consulta o busca atención si empeora.')
  }

  return alerts.slice(0, 4)
}

function average(values: number[]) {
  if (!values.length) return null
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

export function buildHabitSummary(logs: HabitLogRecord[]): HabitSummary {
  const recent = logs.slice(0, 7)
  return {
    daysLogged: recent.length,
    avgSleepHours: average(recent.flatMap(log => typeof log.sleep_hours === 'number' ? [log.sleep_hours] : [])),
    avgWaterMl: average(recent.flatMap(log => typeof log.water_ml === 'number' ? [log.water_ml] : [])),
    alcoholDays: recent.filter(log => log.alcohol_units > 0).length,
    medicationFlags: recent.filter(log => log.medication_status === 'missed' || log.medication_status === 'changed').length,
    highSymptomDays: recent.filter(log => Object.values(log.symptoms).some(value => value >= 3)).length,
  }
}
