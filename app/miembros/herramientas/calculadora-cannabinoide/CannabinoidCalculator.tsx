'use client'

import { useId, useMemo, useState } from 'react'
import {
  calculateInhalationMetrics,
  calculateOilMetrics,
  type CannabinoidInputMode,
} from '@/lib/cannabinoid-calculator'

type ProductKind = 'oil' | 'inhalation'

const INPUT = 'w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand'
const LABEL = 'block text-xs text-muted mb-1 uppercase tracking-widest'

const INPUT_MODE_LABELS: Record<CannabinoidInputMode, { label: string; hint: string }> = {
  mg_per_ml: { label: 'mg/ml', hint: 'Concentración directa' },
  total_mg: { label: 'mg total', hint: 'Total por envase' },
  percent_weight_volume: { label: '% p/v', hint: 'Porcentaje peso/volumen' },
}

function numberFrom(value: string) {
  const normalized = value.replace(',', '.').trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function format(value: number, unit: string, decimals = 2) {
  return `${value.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${unit}`
}

function Field({
  label,
  value,
  onChange,
  step = '0.01',
  min = '0',
  suffix,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  step?: string
  min?: string
  suffix?: string
}) {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`${INPUT} ${suffix ? 'pr-14' : ''}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-faint font-mono">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-subtle py-3 last:border-0">
      <span className="text-xs text-faint font-mono uppercase tracking-widest">{label}</span>
      <span className="text-right text-sm text-white font-mono">{value}</span>
    </div>
  )
}

export default function CannabinoidCalculator() {
  const [productKind, setProductKind] = useState<ProductKind>('oil')
  const [inputMode, setInputMode] = useState<CannabinoidInputMode>('total_mg')
  const [volumeMl, setVolumeMl] = useState('30')
  const [cbdValue, setCbdValue] = useState('1500')
  const [thcValue, setThcValue] = useState('0')
  const [dropsPerMl, setDropsPerMl] = useState('20')
  const [dropsPerDose, setDropsPerDose] = useState('2')
  const [dosesPerDay, setDosesPerDay] = useState('2')
  const [expectedInhalations, setExpectedInhalations] = useState('100')

  const numeric = useMemo(() => ({
    volumeMl: numberFrom(volumeMl),
    cbdValue: numberFrom(cbdValue),
    thcValue: numberFrom(thcValue),
    dropsPerMl: numberFrom(dropsPerMl),
    dropsPerDose: numberFrom(dropsPerDose),
    dosesPerDay: numberFrom(dosesPerDay),
    expectedInhalations: numberFrom(expectedInhalations),
  }), [volumeMl, cbdValue, thcValue, dropsPerMl, dropsPerDose, dosesPerDay, expectedInhalations])

  const oil = useMemo(() => calculateOilMetrics({ inputMode, ...numeric }), [inputMode, numeric])
  const inhalation = useMemo(() => calculateInhalationMetrics({ inputMode, ...numeric }), [inputMode, numeric])
  const active = productKind === 'oil' ? oil : inhalation
  const totalMg = active.cbdTotalMg + active.thcTotalMg
  const cbdShare = totalMg > 0 ? Math.round((active.cbdTotalMg / totalMg) * 100) : 0
  const thcShare = totalMg > 0 ? 100 - cbdShare : 0
  const cannabinoidLabel = inputMode === 'mg_per_ml'
    ? 'mg/ml declarados'
    : inputMode === 'total_mg'
      ? 'mg totales declarados'
      : '% p/v declarado'

  return (
    <div className="space-y-6">
      <div className="grid gap-2 sm:grid-cols-2">
        {([
          { value: 'oil', label: 'Aceite / gotas' },
          { value: 'inhalation', label: 'Inhalaciones' },
        ] as const).map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => setProductKind(option.value)}
            className={`rounded border px-4 py-3 text-sm transition-colors ${
              productKind === option.value
                ? 'border-brand bg-brand/10 text-white'
                : 'border-subtle bg-white/5 text-muted hover:border-brand/50 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="border border-subtle rounded-lg p-5 sm:p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-4">Datos de etiqueta</p>

          <div className="grid gap-2 sm:grid-cols-3 mb-5">
            {(Object.keys(INPUT_MODE_LABELS) as CannabinoidInputMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setInputMode(mode)}
                className={`rounded border px-3 py-3 text-left transition-colors ${
                  inputMode === mode
                    ? 'border-brand bg-brand/10 text-white'
                    : 'border-subtle bg-white/5 text-muted hover:border-brand/50 hover:text-white'
                }`}
              >
                <span className="block text-sm">{INPUT_MODE_LABELS[mode].label}</span>
                <span className="block text-[11px] text-faint font-mono mt-1">{INPUT_MODE_LABELS[mode].hint}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Volumen del envase" value={volumeMl} onChange={setVolumeMl} suffix="ml" />
            <Field label={`CBD (${cannabinoidLabel})`} value={cbdValue} onChange={setCbdValue} suffix={inputMode === 'percent_weight_volume' ? '%' : 'mg'} />
            <Field label={`THC (${cannabinoidLabel})`} value={thcValue} onChange={setThcValue} suffix={inputMode === 'percent_weight_volume' ? '%' : 'mg'} />
            {productKind === 'oil' ? (
              <>
                <Field label="Gotas por ml" value={dropsPerMl} onChange={setDropsPerMl} step="1" suffix="gotas" />
                <Field label="Gotas por toma" value={dropsPerDose} onChange={setDropsPerDose} step="1" suffix="gotas" />
                <Field label="Tomas por día" value={dosesPerDay} onChange={setDosesPerDay} step="0.5" suffix="x día" />
              </>
            ) : (
              <Field label="Inhalaciones estimadas" value={expectedInhalations} onChange={setExpectedInhalations} step="1" suffix="inh." />
            )}
          </div>
        </section>

        <aside className="border border-brand/30 bg-brand/5 rounded-lg p-5 sm:p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-4">Resultado</p>

          <div className="mb-5">
            <div className="h-2 w-full overflow-hidden rounded bg-white/10">
              <div className="flex h-full">
                <div className="bg-brand" style={{ width: `${cbdShare}%` }} />
                <div className="bg-yellow-400" style={{ width: `${thcShare}%` }} />
              </div>
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-faint font-mono">
              <span>CBD {cbdShare}%</span>
              <span>THC {thcShare}%</span>
            </div>
          </div>

          <ResultRow label="CBD" value={format(active.cbdMgPerMl, 'mg/ml')} />
          <ResultRow label="THC" value={format(active.thcMgPerMl, 'mg/ml')} />
          <ResultRow label="Relación" value={active.ratio} />
          <ResultRow label="CBD total" value={format(active.cbdTotalMg, 'mg')} />
          <ResultRow label="THC total" value={format(active.thcTotalMg, 'mg')} />

          {productKind === 'oil' ? (
            <>
              <ResultRow label="CBD por gota" value={format(oil.cbdMgPerDrop, 'mg', 3)} />
              <ResultRow label="THC por gota" value={format(oil.thcMgPerDrop, 'mg', 3)} />
              <ResultRow label="CBD por toma" value={format(oil.cbdMgPerDose, 'mg', 3)} />
              <ResultRow label="THC por toma" value={format(oil.thcMgPerDose, 'mg', 3)} />
              <ResultRow label="Tomas/envase" value={format(oil.dosesPerBottle, 'tomas', 1)} />
              <ResultRow label="Duración" value={oil.estimatedDays ? format(oil.estimatedDays, 'días', 1) : 'Sin tomas/día'} />
            </>
          ) : (
            <>
              <ResultRow label="CBD por inhalación" value={format(inhalation.cbdMgPerInhalation, 'mg', 3)} />
              <ResultRow label="THC por inhalación" value={format(inhalation.thcMgPerInhalation, 'mg', 3)} />
              <ResultRow label="Inhalaciones" value={format(inhalation.expectedInhalations, 'estimadas', 0)} />
            </>
          )}
        </aside>
      </div>

      <section className="border border-yellow-400/30 bg-yellow-400/5 rounded-lg p-5">
        <p className="text-xs font-mono uppercase tracking-widest text-yellow-300 mb-2">Uso seguro</p>
        <p className="text-sm leading-6 text-yellow-50">
          Esta calculadora solo convierte unidades declaradas en la etiqueta. No define dosis, frecuencia, absorción real ni cambios de tratamiento.
        </p>
      </section>
    </div>
  )
}
