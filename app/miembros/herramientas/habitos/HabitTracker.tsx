'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  HABIT_SYMPTOMS,
  buildHabitAlerts,
  buildHabitSummary,
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

function todayDate() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

function emptyForm(): FormState {
  return {
    log_date: todayDate(),
    sleep_hours: '',
    sleep_quality: '',
    sleepiness: '',
    water_ml: '',
    alcohol_units: '0',
    medication_status: 'not_applicable',
    meals_regular: 'unknown',
    symptoms: {
      pain: '0',
      anxiety: '0',
      nausea: '0',
      dizziness: '0',
      appetite: '0',
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
    alcohol_units: log.alcohol_units.toString(),
    medication_status: log.medication_status,
    meals_regular: typeof log.meals_regular === 'boolean' ? log.meals_regular ? 'yes' : 'no' : 'unknown',
    symptoms: {
      pain: String(log.symptoms.pain ?? 0),
      anxiety: String(log.symptoms.anxiety ?? 0),
      nausea: String(log.symptoms.nausea ?? 0),
      dizziness: String(log.symptoms.dizziness ?? 0),
      appetite: String(log.symptoms.appetite ?? 0),
    },
  }
}

function numberOrNull(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function numberOrZero(value: string) {
  return numberOrNull(value) ?? 0
}

function formPayload(form: FormState) {
  return {
    log_date: form.log_date,
    sleep_hours: numberOrNull(form.sleep_hours),
    sleep_quality: numberOrNull(form.sleep_quality),
    sleepiness: numberOrNull(form.sleepiness),
    water_ml: numberOrNull(form.water_ml),
    alcohol_units: numberOrZero(form.alcohol_units),
    medication_status: form.medication_status,
    meals_regular: form.meals_regular === 'unknown' ? null : form.meals_regular === 'yes',
    symptoms: Object.fromEntries(
      HABIT_SYMPTOMS.map(symptom => [symptom.key, numberOrZero(form.symptoms[symptom.key])]),
    ),
  }
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'number' | 'date'
  suffix?: string
  step?: string
  min?: string
  max?: string
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

  useEffect(() => {
    let active = true
    async function loadLogs() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/habits?limit=14')
        const data = await res.json() as { logs?: HabitLogRecord[]; error?: string }
        if (!res.ok) throw new Error(data.error ?? 'No se pudo cargar la bitácora.')
        if (active) setLogs(data.logs ?? [])
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar la bitácora.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadLogs()
    return () => { active = false }
  }, [])

  const currentAlerts = useMemo(() => buildHabitAlerts(previewLog(form)), [form])
  const summary = useMemo(() => buildHabitSummary(logs), [logs])

  async function saveLog() {
    setSaving(true)
    setError('')
    setSaved('')
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPayload(form)),
      })
      const data = await res.json() as { log?: HabitLogRecord; error?: string }
      if (!res.ok || !data.log) throw new Error(data.error ?? 'No se pudo guardar la bitácora.')
      setLogs(previous => [
        data.log!,
        ...previous.filter(log => log.log_date !== data.log!.log_date),
      ].sort((a, b) => b.log_date.localeCompare(a.log_date)).slice(0, 14))
      setSaved('Registro guardado.')
    } catch (err) {
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
            onClick={() => setForm(emptyForm())}
            className="rounded border border-subtle px-3 py-2 text-xs font-mono text-faint transition-colors hover:text-white"
          >
            Hoy
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha" type="date" value={form.log_date} onChange={value => setForm(current => ({ ...current, log_date: value }))} />
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
                {SCORE_OPTIONS.map(([value, label]) => <option key={value} value={value} className="bg-ink">{label}</option>)}
              </SelectField>
            ))}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        {saved && <p className="mt-4 text-sm text-brand">{saved}</p>}

        <button
          type="button"
          onClick={saveLog}
          disabled={saving || !form.log_date}
          className="mt-6 w-full rounded bg-brand-deep px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-mid disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar registro'}
        </button>
      </section>

      <aside className="space-y-6">
        <section className="rounded-lg border border-brand/30 bg-brand/5 p-5 sm:p-6">
          <p className="mb-4 text-xs font-mono uppercase tracking-widest text-brand">Resumen semanal</p>
          <SummaryRow label="Días registrados" value={`${summary.daysLogged}/7`} />
          <SummaryRow label="Sueño promedio" value={summary.avgSleepHours === null ? 'Sin datos' : `${summary.avgSleepHours} h`} />
          <SummaryRow label="Agua promedio" value={summary.avgWaterMl === null ? 'Sin datos' : `${summary.avgWaterMl} ml`} />
          <SummaryRow label="Días con alcohol" value={String(summary.alcoholDays)} />
          <SummaryRow label="Fármacos a revisar" value={String(summary.medicationFlags)} />
          <SummaryRow label="Síntomas intensos" value={String(summary.highSymptomDays)} />
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
                  onClick={() => setForm(fromLog(log))}
                  className="flex w-full items-center justify-between rounded border border-subtle px-3 py-2 text-left text-sm transition-colors hover:border-brand/60"
                >
                  <span className="text-white">{log.log_date}</span>
                  <span className="font-mono text-xs text-faint">{log.alcohol_units > 0 ? 'Alcohol' : 'Ver'}</span>
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
