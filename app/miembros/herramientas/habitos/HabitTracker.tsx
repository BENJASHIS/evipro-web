'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  HABIT_SYMPTOMS,
  buildHabitAlerts,
  buildHabitSummary,
  habitToday,
  validateHabitPayload,
  type HabitLogRecord,
  type HabitSymptoms,
  type MedicationStatus,
} from '@/lib/habits'

type FormState = {
  log_date: string
  sleep_hours: string
  sleep_quality: string
  sleepiness: string
  water_ml: string
  alcohol_units: string
  medication_status: MedicationStatus
  meals_regular: 'unknown' | 'yes' | 'no'
  symptoms: Record<keyof HabitSymptoms, string>
}

const INPUT = 'w-full rounded border border-subtle bg-white/5 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none'
const LABEL = 'block text-xs uppercase tracking-widest text-muted mb-1'
const SCORE_OPTIONS = [
  ['0', 'Nada'],
  ['1', 'Leve'],
  ['2', 'Moderado'],
  ['3', 'Intenso'],
] as const

function emptyForm(date = habitToday()): FormState {
  return {
    log_date: date,
    sleep_hours: '',
    sleep_quality: '',
    sleepiness: '',
    water_ml: '',
    alcohol_units: '',
    medication_status: 'not_applicable',
    meals_regular: 'unknown',
    symptoms: {
      pain: '',
      anxiety: '',
      nausea: '',
      dizziness: '',
      appetite: '',
    },
  }
}

function fromLog(log: HabitLogRecord): FormState {
  return {
    log_date: log.log_date,
    sleep_hours: log.sleep_hours?.toString() ?? '',
    sleep_quality: log.sleep_quality?.toString() ?? '',
    sleepiness: log.sleepiness?.toString() ?? '',
    water_ml: log.water_ml?.toString() ?? '',
    alcohol_units: log.alcohol_units?.toString() ?? '',
    medication_status: log.medication_status,
    meals_regular: typeof log.meals_regular === 'boolean' ? log.meals_regular ? 'yes' : 'no' : 'unknown',
    symptoms: {
      pain: log.symptoms.pain?.toString() ?? '',
      anxiety: log.symptoms.anxiety?.toString() ?? '',
      nausea: log.symptoms.nausea?.toString() ?? '',
      dizziness: log.symptoms.dizziness?.toString() ?? '',
      appetite: log.symptoms.appetite?.toString() ?? '',
    },
  }
}

function numberOrNull(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function formPayload(form: FormState) {
  return {
    log_date: form.log_date,
    sleep_hours: numberOrNull(form.sleep_hours),
    sleep_quality: numberOrNull(form.sleep_quality),
    sleepiness: numberOrNull(form.sleepiness),
    water_ml: numberOrNull(form.water_ml),
    alcohol_units: numberOrNull(form.alcohol_units),
    medication_status: form.medication_status,
    meals_regular: form.meals_regular === 'unknown' ? null : form.meals_regular === 'yes',
    symptoms: Object.fromEntries(
      HABIT_SYMPTOMS.map(symptom => [symptom.key, numberOrNull(form.symptoms[symptom.key])]),
    ),
  }
}

function isCompleteLog(value: unknown): value is HabitLogRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const log = value as Record<string, unknown>
  const fields = ['version', 'log_date', 'sleep_hours', 'sleep_quality', 'sleepiness', 'water_ml', 'alcohol_units', 'medication_status', 'meals_regular', 'symptoms']
  return fields.every(field => Object.hasOwn(log, field))
    && typeof log.id === 'string'
    && typeof log.created_at === 'string' && Number.isFinite(Date.parse(log.created_at))
    && typeof log.updated_at === 'string' && Number.isFinite(Date.parse(log.updated_at))
    && !!log.symptoms && typeof log.symptoms === 'object'
    && HABIT_SYMPTOMS.every(({ key }) => Object.hasOwn(log.symptoms!, key))
    && validateHabitPayload(log).ok
}

function previewLog(form: FormState): HabitLogRecord {
  const payload = formPayload(form)
  return {
    id: 'preview',
    version: 'preview',
    log_date: payload.log_date,
    sleep_hours: payload.sleep_hours,
    sleep_quality: payload.sleep_quality,
    sleepiness: payload.sleepiness,
    water_ml: payload.water_ml,
    alcohol_units: payload.alcohol_units,
    medication_status: payload.medication_status,
    meals_regular: payload.meals_regular,
    symptoms: payload.symptoms as HabitSymptoms,
    created_at: '',
    updated_at: '',
  }
}

function Field({
  label,
  value,
  onChange,
  type = 'number',
  suffix,
  step = '1',
  min = '0',
  max,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'number' | 'date'
  suffix?: string
  step?: string
  min?: string
  max?: string
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      <span className="relative block">
        <input
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          min={type === 'number' ? min : undefined}
          max={max}
          step={type === 'number' ? step : undefined}
          value={value}
          disabled={disabled}
          onChange={event => onChange(event.target.value)}
          className={`${INPUT} ${suffix ? 'pr-16' : ''}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-mono text-faint">
            {suffix}
          </span>
        )}
      </span>
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)} className={INPUT}>
        {children}
      </select>
    </label>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-subtle py-3 last:border-0">
      <span className="text-xs uppercase tracking-widest text-faint">{label}</span>
      <span className="text-right font-mono text-sm text-white">{value}</span>
    </div>
  )
}

export default function HabitTracker() {
  const [form, setForm] = useState<FormState>(() => emptyForm())
  const [logs, setLogs] = useState<HabitLogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [loadedDate, setLoadedDate] = useState<string | null>(null)
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const selectedDate = form.log_date

  function chooseDate(date: string) {
    setForm(emptyForm(date))
    setLoadedDate(null)
    setLoading(true)
    setSaved('')
    setError('')
    setReload(current => current + 1)
  }

  useEffect(() => {
    let active = true
    async function loadLogs() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/habits?limit=14&date=${encodeURIComponent(selectedDate)}`, { cache: 'no-store' })
        const data = await res.json() as { logs?: unknown[]; log?: unknown; error?: string }
        if (!res.ok) throw new Error(data.error ?? 'No se pudo cargar la bitácora.')
        if (!Array.isArray(data.logs) || !data.logs.every(isCompleteLog)
          || (data.log !== null && (!isCompleteLog(data.log) || data.log.log_date !== selectedDate))) {
          throw new Error('La bitácora llegó incompleta. Vuelve a cargarla antes de editar.')
        }
        if (active) {
          setLogs(data.logs)
          setForm(data.log ? fromLog(data.log) : emptyForm(selectedDate))
          setExpectedUpdatedAt(data.log?.updated_at ?? null)
          setLoadedDate(selectedDate)
        }
      } catch (err) {
        if (active) {
          setLoadedDate(null)
          setError(err instanceof Error ? err.message : 'No se pudo cargar la bitácora.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadLogs()
    return () => { active = false }
  }, [selectedDate, reload])

  const currentAlerts = useMemo(() => buildHabitAlerts(previewLog(form)), [form])
  const summary = useMemo(() => buildHabitSummary(logs), [logs])

  async function saveLog() {
    if (loading || saving || loadedDate !== form.log_date) return
    setSaving(true)
    setError('')
    setSaved('')
    // Un 4xx (salvo 409) es un rechazo sin escritura: el borrador sigue editable.
    let rejected = false
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formPayload(form), expected_updated_at: expectedUpdatedAt }),
      })
      rejected = res.status >= 400 && res.status < 500 && res.status !== 409
      const data = await res.json() as { log?: HabitLogRecord; error?: string }
      if (!res.ok || !isCompleteLog(data.log) || data.log.log_date !== form.log_date) {
        throw new Error(data.error ?? 'No se pudo confirmar el guardado. Vuelve a cargar la bitácora.')
      }
      setLogs(previous => [
        data.log!,
        ...previous.filter(log => log.log_date !== data.log!.log_date),
      ].sort((a, b) => b.log_date.localeCompare(a.log_date)).slice(0, 14))
      setForm(fromLog(data.log))
      setExpectedUpdatedAt(data.log.updated_at)
      setSaved('Registro guardado.')
    } catch (err) {
      if (!rejected) setLoadedDate(null)
      setError(err instanceof Error ? err.message : 'No se pudo guardar la bitácora.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-lg border border-subtle p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-mono uppercase tracking-widest text-brand">Registro diario</p>
            <h2 className="text-xl font-light text-white">Hábitos y señales</h2>
          </div>
          <button
            type="button"
            onClick={() => chooseDate(habitToday())}
            disabled={saving}
            className="rounded border border-subtle px-3 py-2 text-xs font-mono text-faint transition-colors hover:text-white"
          >
            Hoy
          </button>
        </div>

        <Field label="Fecha" type="date" value={form.log_date} onChange={chooseDate} disabled={saving} />
        <fieldset disabled={loading || saving || loadedDate !== form.log_date} className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sueño" value={form.sleep_hours} onChange={value => setForm(current => ({ ...current, sleep_hours: value }))} step="0.5" max="24" suffix="h" />
          <SelectField label="Calidad de sueño" value={form.sleep_quality} onChange={value => setForm(current => ({ ...current, sleep_quality: value }))}>
            <option value="" className="bg-ink">Sin registrar</option>
            <option value="1" className="bg-ink">Muy mala</option>
            <option value="2" className="bg-ink">Mala</option>
            <option value="3" className="bg-ink">Regular</option>
            <option value="4" className="bg-ink">Buena</option>
            <option value="5" className="bg-ink">Muy buena</option>
          </SelectField>
          <SelectField label="Somnolencia" value={form.sleepiness} onChange={value => setForm(current => ({ ...current, sleepiness: value }))}>
            <option value="" className="bg-ink">Sin registrar</option>
            {SCORE_OPTIONS.map(([value, label]) => <option key={value} value={value} className="bg-ink">{label}</option>)}
          </SelectField>
          <Field label="Agua" value={form.water_ml} onChange={value => setForm(current => ({ ...current, water_ml: value }))} step="100" max="10000" suffix="ml" />
          <Field label="Alcohol" value={form.alcohol_units} onChange={value => setForm(current => ({ ...current, alcohol_units: value }))} step="0.5" max="30" suffix="copas" />
          <SelectField label="Fármacos" value={form.medication_status} onChange={value => setForm(current => ({ ...current, medication_status: value as MedicationStatus }))}>
            <option value="not_applicable" className="bg-ink">No aplica</option>
            <option value="taken" className="bg-ink">Tomados como indicado</option>
            <option value="missed" className="bg-ink">Olvidé una toma</option>
            <option value="changed" className="bg-ink">Hubo cambio o pausa</option>
          </SelectField>
          <SelectField label="Comidas" value={form.meals_regular} onChange={value => setForm(current => ({ ...current, meals_regular: value as FormState['meals_regular'] }))}>
            <option value="unknown" className="bg-ink">Sin registrar</option>
            <option value="yes" className="bg-ink">Regulares</option>
            <option value="no" className="bg-ink">Irregulares</option>
          </SelectField>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-brand">Síntomas</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {HABIT_SYMPTOMS.map(symptom => (
              <SelectField
                key={symptom.key}
                label={symptom.label}
                value={form.symptoms[symptom.key]}
                onChange={value => setForm(current => ({
                  ...current,
                  symptoms: { ...current.symptoms, [symptom.key]: value },
                }))}
              >
                <option value="" className="bg-ink">Sin registrar</option>
                {SCORE_OPTIONS.map(([value, label]) => <option key={value} value={value} className="bg-ink">{label}</option>)}
              </SelectField>
            ))}
          </div>
        </div>
        </fieldset>
        <p className="mt-3 text-xs leading-5 text-faint">Los campos vacíos quedan sin registrar. En alcohol, escribe 0 si no consumiste; en síntomas, elige «Nada» si no lo presentaste.</p>

        {loading && <p className="mt-4 text-sm text-faint">Cargando el registro de la fecha...</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        {!loading && !loadedDate && <button type="button" onClick={() => chooseDate(form.log_date)} className="mt-3 text-sm text-brand underline">Volver a cargar</button>}
        {saved && <p className="mt-4 text-sm text-brand">{saved}</p>}

        <button
          type="button"
          onClick={saveLog}
          disabled={loading || saving || loadedDate !== form.log_date || !form.log_date}
          className="mt-6 w-full rounded bg-brand-deep px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-mid disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar registro'}
        </button>
      </section>

      <aside className="space-y-6">
        <section className="rounded-lg border border-brand/30 bg-brand/5 p-5 sm:p-6">
          <p className="mb-4 text-xs font-mono uppercase tracking-widest text-brand">Resumen semanal</p>
          {loading || !loadedDate ? <p className="text-sm text-faint">Resumen no disponible hasta cargar la bitácora.</p> : <>
          <p className="mb-3 text-xs leading-5 text-faint">Últimos 7 días (Lima): {summary.startDate} a {summary.endDate}. Promedios solo con datos registrados.</p>
          <SummaryRow label="Días registrados" value={`${summary.daysLogged}/7`} />
          <SummaryRow label="Días sin registro" value={String(summary.missingDays)} />
          <SummaryRow label="Sueño promedio" value={summary.avgSleepHours === null ? 'Sin datos' : `${summary.avgSleepHours} h`} />
          <SummaryRow label="Agua promedio" value={summary.avgWaterMl === null ? 'Sin datos' : `${summary.avgWaterMl} ml`} />
          <SummaryRow label="Días con alcohol" value={`${summary.alcoholDays} (${summary.alcoholDaysWithData} con dato)`} />
          <SummaryRow label="Fármacos a revisar" value={String(summary.medicationFlags)} />
          <SummaryRow label="Síntomas intensos" value={`${summary.highSymptomDays} (${summary.symptomDaysWithData} con dato)`} />
          </>}
        </section>

        <section className="rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-5 sm:p-6">
          <p className="mb-4 text-xs font-mono uppercase tracking-widest text-yellow-300">Alertas prudentes</p>
          {currentAlerts.length > 0 ? (
            <ul className="space-y-3 text-sm leading-6 text-yellow-50">
              {currentAlerts.map(alert => <li key={alert}>{alert}</li>)}
            </ul>
          ) : (
            <p className="text-sm leading-6 text-yellow-50">
              Sin alertas para este registro.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-subtle p-5 sm:p-6">
          <p className="mb-4 text-xs font-mono uppercase tracking-widest text-faint">Últimos registros</p>
          {loading ? (
            <p className="text-sm text-faint">Cargando...</p>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.slice(0, 7).map(log => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => chooseDate(log.log_date)}
                  disabled={saving}
                  className="flex w-full items-center justify-between rounded border border-subtle px-3 py-2 text-left text-sm transition-colors hover:border-brand/60"
                >
                  <span className="text-white">{log.log_date}</span>
                  <span className="font-mono text-xs text-faint">{(log.alcohol_units ?? 0) > 0 ? 'Alcohol' : 'Ver'}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-faint">
              Aún no hay registros guardados.
            </p>
          )}
        </section>
      </aside>
    </div>
  )
}
