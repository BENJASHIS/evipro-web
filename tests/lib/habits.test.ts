import { describe, expect, it } from 'vitest'
import {
  buildHabitAlerts,
  buildHabitSummary,
  validateHabitPayload,
  type HabitLogRecord,
} from '../../lib/habits'

const validPayload = {
  log_date: '2026-08-27',
  sleep_hours: 6.5,
  sleep_quality: 3,
  sleepiness: 1,
  water_ml: 1400,
  alcohol_units: 0,
  medication_status: 'taken',
  meals_regular: true,
  symptoms: {
    pain: 1,
    anxiety: 1,
    nausea: 0,
    dizziness: 0,
    appetite: 0,
  },
}

function log(partial: Partial<HabitLogRecord>): HabitLogRecord {
  return {
    id: 'h1',
    version: 'test',
    log_date: '2026-08-27',
    sleep_hours: 6,
    sleep_quality: 3,
    sleepiness: 1,
    water_ml: 1000,
    alcohol_units: 0,
    medication_status: 'taken',
    meals_regular: true,
    symptoms: {
      pain: 0,
      anxiety: 0,
      nausea: 0,
      dizziness: 0,
      appetite: 0,
    },
    created_at: '2026-08-27T00:00:00Z',
    updated_at: '2026-08-27T00:00:00Z',
    ...partial,
  }
}

describe('validateHabitPayload', () => {
  it('acepta y sanea un registro válido', () => {
    const result = validateHabitPayload(validPayload)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.log_date).toBe('2026-08-27')
      expect(result.data.alcohol_units).toBe(0)
      expect(result.data.symptoms.pain).toBe(1)
    }
  })

  it('rechaza fechas inválidas y valores fuera de rango', () => {
    expect(validateHabitPayload({ ...validPayload, log_date: '2026-99-99' }).ok).toBe(false)
    expect(validateHabitPayload({ ...validPayload, sleep_hours: 25 }).ok).toBe(false)
    expect(validateHabitPayload({ ...validPayload, symptoms: { pain: 4 } }).ok).toBe(false)
  })

  it('ignora columnas extra que mande el cliente', () => {
    const result = validateHabitPayload({ ...validPayload, user_id: 'otro', notes: 'texto libre' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).not.toHaveProperty('user_id')
      expect(result.data).not.toHaveProperty('notes')
    }
  })
})

describe('buildHabitAlerts', () => {
  it('genera alertas prudentes sin recomendar cambios de tratamiento', () => {
    const alerts = buildHabitAlerts(log({
      alcohol_units: 2,
      sleepiness: 2,
      medication_status: 'missed',
      symptoms: { pain: 0, anxiety: 3, nausea: 0, dizziness: 2, appetite: 0 },
    }))

    expect(alerts).toContain('Alcohol y somnolencia el mismo día: coméntalo en consulta si se repite.')
    expect(alerts).toContain('Fármaco olvidado: no dupliques dosis sin indicación profesional.')
    expect(alerts.join(' ')).not.toMatch(/sube|baja|suspende/i)
  })
})

describe('buildHabitSummary', () => {
  it('resume los últimos siete registros', () => {
    const logs = [
      log({ id: '1', log_date: '2026-08-27', sleep_hours: 6, water_ml: 1000 }),
      log({ id: '2', log_date: '2026-08-26', sleep_hours: 8, water_ml: 2000, alcohol_units: 1 }),
      log({ id: '3', log_date: '2026-08-25', medication_status: 'changed' }),
    ]

    expect(buildHabitSummary(logs)).toMatchObject({
      daysLogged: 3,
      avgSleepHours: 6.7,
      avgWaterMl: 1333.3,
      alcoholDays: 1,
      medicationFlags: 1,
    })
  })
})
