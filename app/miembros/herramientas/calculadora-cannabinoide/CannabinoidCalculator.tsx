'use client'

import { useId, useMemo, useState, type ReactNode } from 'react'
import {
  calculateInhalationMetrics,
  calculateOilMetrics,
  type CannabinoidInputMode,
} from '@/lib/cannabinoid-calculator'

type ProductKind = 'oil' | 'inhalation'

const INPUT = 'w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand'
const LABEL = 'block text-xs text-muted mb-1 uppercase tracking-widest'

const INPUT_MODE_OPTIONS: { value: CannabinoidInputMode; label: string; suffix: string }[] = [
  { value: 'total_mg', label: 'mg total en el envase', suffix: 'mg' },
  { value: 'mg_per_ml', label: 'mg por ml', suffix: 'mg/ml' },
  { value: 'percent_weight_volume', label: '% p/v peso/volumen', suffix: '%' },
]

const MODE_HELP: Record<CannabinoidInputMode, string> = {
  total_mg: 'mg/ml = mg total ÷ volumen del envase',
  mg_per_ml: 'mg total = mg/ml × volumen del envase',
  percent_weight_volume: '1% p/v equivale a 10 mg/ml',
}

function numberFrom(value: string) {
  const normalized = value.replace(',', '.').trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function format(value: number, unit: string, decimals = 2) {
  const fixed = value.toFixed(decimals)
  const compact = fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
  return `${compact} ${unit}`
}

function formatPair(cbd: number, thc: number, unit: string, decimals = 2) {
  return `CBD ${format(cbd, unit, decimals)} · THC ${format(thc, unit, decimals)}`
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
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={INPUT}
      >
        {children}
      </select>
    </div>
  )
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
          className={`${INPUT} ${suffix ? 'pr-16' : ''}`}
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

function PrimaryResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-subtle pb-4">
      <p className="text-xs font-mono uppercase tracking-widest text-faint mb-1">{label}</p>
      <p className="break-words text-xl font-light leading-snug text-white sm:text-2xl">{value}</p>
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
  const inputModeOption = INPUT_MODE_OPTIONS.find(option => option.value === inputMode) ?? INPUT_MODE_OPTIONS[0]
  const cbdPercentEquivalent = active.cbdMgPerMl / 10
  const thcPercentEquivalent = active.thcMgPerMl / 10

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="border border-subtle rounded-lg p-5 sm:p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-5">Etiqueta del producto</p>

          <div className="grid gap-4 sm:grid-cols-2 mb-5">
            <SelectField label="Tipo de producto" value={productKind} onChange={value => setProductKind(value as ProductKind)}>
              <option value="oil" className="bg-ink">Aceite / gotas</option>
              <option value="inhalation" className="bg-ink">Inhalaciones</option>
            </SelectField>

            <SelectField label="La etiqueta muestra" value={inputMode} onChange={value => setInputMode(value as CannabinoidInputMode)}>
              {INPUT_MODE_OPTIONS.map(option => (
                <option key={option.value} value={option.value} className="bg-ink">{option.label}</option>
              ))}
            </SelectField>
          </div>

          <p className="text-xs text-faint font-mono mb-5">{MODE_HELP[inputMode]}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Volumen del envase" value={volumeMl} onChange={setVolumeMl} suffix="ml" />
            <Field label="CBD declarado" value={cbdValue} onChange={setCbdValue} suffix={inputModeOption.suffix} />
            <Field label="THC declarado" value={thcValue} onChange={setThcValue} suffix={inputModeOption.suffix} />
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

        <aside className="border border-brand/30 bg-brand/5 rounded-lg p-5 sm:p-6" aria-live="polite">
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-5">Resultado</p>

          <div className="space-y-4 mb-5">
            <PrimaryResult
              label="Concentración equivalente"
              value={formatPair(active.cbdMgPerMl, active.thcMgPerMl, 'mg/ml')}
            />
            <PrimaryResult
              label="Porcentaje equivalente"
              value={formatPair(cbdPercentEquivalent, thcPercentEquivalent, '% p/v')}
            />
            <PrimaryResult
              label="Total del envase"
              value={formatPair(active.cbdTotalMg, active.thcTotalMg, 'mg')}
            />
          </div>

          <ResultRow label="Relación" value={active.ratio} />

          {productKind === 'oil' ? (
            <>
              <ResultRow label="Por gota" value={formatPair(oil.cbdMgPerDrop, oil.thcMgPerDrop, 'mg', 3)} />
              <ResultRow label="Por toma" value={formatPair(oil.cbdMgPerDose, oil.thcMgPerDose, 'mg', 3)} />
              <ResultRow label="Envase alcanza" value={`${format(oil.dosesPerBottle, 'tomas', 1)} · ${oil.estimatedDays ? format(oil.estimatedDays, 'días', 1) : 'sin tomas/día'}`} />
            </>
          ) : (
            <>
              <ResultRow label="Por inhalación" value={formatPair(inhalation.cbdMgPerInhalation, inhalation.thcMgPerInhalation, 'mg', 3)} />
              <ResultRow label="Inhalaciones" value={format(inhalation.expectedInhalations, 'estimadas', 0)} />
            </>
          )}
        </aside>
      </div>

      <section className="border border-yellow-400/30 bg-yellow-400/5 rounded-lg p-5">
        <p className="text-xs font-mono uppercase tracking-widest text-yellow-300 mb-2">Uso seguro</p>
        <p className="text-sm leading-6 text-yellow-50">
          Esta calculadora solo convierte unidades declaradas en la etiqueta. No define dosis, frecuencia, absorción real ni cambios de tratamiento.
          Si la etiqueta solo dice porcentaje sin indicar p/v, confirma el dato del producto antes de interpretarlo como mg/ml.
        </p>
      </section>
    </div>
  )
}
