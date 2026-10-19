export const HABIT_LOG_VERSION = '2026.10.19'

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
export type HabitSymptoms = Record<HabitSymptomKey, number | null>

export type HabitLogData = {
  version: string
  log_date: string
  sleep_hours: number | null
  sleep_quality: number | null
  sleepiness: number | null
  water_ml: number | null
  alcohol_units: number | null
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
  startDate: string
  endDate: string
  daysLogged: number
  missingDays: number
  avgSleepHours: number | null
  avgWaterMl: number | null
  alcoholDays: number
  alcoholDaysWithData: number
  symptomDaysWithData: number
  medicationFlags: number
  highSymptomDays: number
}

type ValidationResult =
  | { ok: true; data: HabitLogData }
  | { ok: false; error: string }

const DEFAULT_SYMPTOMS: HabitSymptoms = {
  pain: null,
  anxiety: null,
  nausea: null,
  dizziness: null,
  appetite: null,
}

function asObject(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as Record<string, unknown>
}

function finiteNumber(value: unknown) {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  const parsed = typeof value === 'number' ? value : Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function optionalNumber(
  value: unknown,
  field: string,
  min: number,
  max: number,
): { ok: true; value: number | null } | { ok: false; error: string } {
  if (value == null || (typeof value === 'string' && !value.trim())) return { ok: true, value: null }
  const parsed = finiteNumber(value)
  if (parsed === null) return { ok: false, error: `${field} debe ser un número válido.` }
  if (parsed < min || parsed > max) return { ok: false, error: `${field} fuera de rango.` }
  return { ok: true, value: parsed }
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
  return optionalInteger(value, field, 0, 3)
}

function isMedicationStatus(value: unknown): value is MedicationStatus {
  return typeof value === 'string' && MEDICATION_STATUSES.includes(value as MedicationStatus)
}

export function habitDate(value: unknown): string | null {
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

  const logDate = habitDate(body.log_date)
  if (!logDate) return { ok: false, error: 'Fecha inválida.' }

  const sleepHours = optionalNumber(body.sleep_hours, 'Sueño', 0, 24)
  if (!sleepHours.ok) return sleepHours
  const sleepQuality = optionalInteger(body.sleep_quality, 'Calidad de sueño', 1, 5)
  if (!sleepQuality.ok) return sleepQuality
  const sleepiness = optionalInteger(body.sleepiness, 'Somnolencia', 0, 3)
  if (!sleepiness.ok) return sleepiness
  const waterMl = optionalInteger(body.water_ml, 'Agua', 0, 10000)
  if (!waterMl.ok) return waterMl
  const alcoholUnits = optionalNumber(body.alcohol_units, 'Alcohol', 0, 30)
  if (!alcoholUnits.ok) return alcoholUnits

  if (body.medication_status !== undefined && !isMedicationStatus(body.medication_status)) {
    return { ok: false, error: 'Estado de fármacos inválido.' }
  }
  const medicationStatus = isMedicationStatus(body.medication_status)
    ? body.medication_status
    : 'not_applicable'
  if (body.meals_regular != null && typeof body.meals_regular !== 'boolean') {
    return { ok: false, error: 'Estado de comidas inválido.' }
  }
  const mealsRegular = typeof body.meals_regular === 'boolean' ? body.meals_regular : null

  const rawSymptoms = asObject(body.symptoms) ?? {}
  if (body.symptoms != null && !asObject(body.symptoms)) return { ok: false, error: 'Síntomas inválidos.' }
  const symptoms = { ...DEFAULT_SYMPTOMS }
  for (const symptom of HABIT_SYMPTOMS) {
    const parsed = score(rawSymptoms[symptom.key], symptom.label)
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

  if ((log.alcohol_units ?? 0) > 0 && (log.sleepiness ?? 0) >= 2) {
    alerts.push('Alcohol y somnolencia el mismo día: coméntalo en consulta si se repite.')
  } else if ((log.alcohol_units ?? 0) > 0) {
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

  if ((log.symptoms.dizziness ?? 0) >= 2) {
    alerts.push('Mareo moderado o intenso: registra el contexto y consúltalo si persiste o empeora.')
  }

  if ((log.symptoms.anxiety ?? 0) >= 3 || (log.symptoms.pain ?? 0) >= 3 || (log.symptoms.nausea ?? 0) >= 3) {
    alerts.push('Síntoma intenso registrado: llévalo a tu próxima consulta o busca atención si empeora.')
  }

  return alerts.slice(0, 4)
}

function average(values: number[]) {
  if (!values.length) return null
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

export function habitToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export function buildHabitSummary(logs: HabitLogRecord[], now = new Date()): HabitSummary {
  const endDate = habitToday(now)
  const start = new Date(`${endDate}T00:00:00Z`)
  start.setUTCDate(start.getUTCDate() - 6)
  const startDate = start.toISOString().slice(0, 10)
  const recent = logs.filter(log => log.log_date >= startDate && log.log_date <= endDate)
  return {
    startDate,
    endDate,
    daysLogged: recent.length,
    missingDays: 7 - recent.length,
    avgSleepHours: average(recent.flatMap(log => typeof log.sleep_hours === 'number' ? [log.sleep_hours] : [])),
    avgWaterMl: average(recent.flatMap(log => typeof log.water_ml === 'number' ? [log.water_ml] : [])),
    alcoholDays: recent.filter(log => (log.alcohol_units ?? 0) > 0).length,
    alcoholDaysWithData: recent.filter(log => log.alcohol_units !== null).length,
    symptomDaysWithData: recent.filter(log => Object.values(log.symptoms).some(value => value !== null)).length,
    medicationFlags: recent.filter(log => log.medication_status === 'missed' || log.medication_status === 'changed').length,
    highSymptomDays: recent.filter(log => Object.values(log.symptoms).some(value => value !== null && value >= 3)).length,
  }
}
