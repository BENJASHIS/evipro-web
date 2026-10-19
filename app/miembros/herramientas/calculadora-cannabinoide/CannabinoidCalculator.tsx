'use client'

import { useId, useMemo, useState, type ReactNode } from 'react'
import { T, useLanguage } from '@/app/components/Language'
import {
  calculateFlowerMetrics,
  calculateInhalationMetrics,
  calculateOilMetrics,
  type InhalationInputMode,
  type OilInputMode,
} from '@/lib/cannabinoid-calculator'

type ProductKind = 'oil' | 'inhalation' | 'flower'

const INPUT = 'w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand'
const LABEL = 'block text-xs text-muted mb-1 uppercase tracking-widest'

const OIL_INPUT_MODE_OPTIONS: { value: OilInputMode; label: string; suffix: string }[] = [
  { value: 'percent_weight_volume', label: '% p/v peso/volumen', suffix: '%' },
  { value: 'mg_per_ml', label: 'mg por ml', suffix: 'mg/ml' },
  { value: 'total_mg', label: 'mg total en el envase', suffix: 'mg' },
]

const INHALATION_INPUT_MODE_OPTIONS: { value: InhalationInputMode; label: string; suffix: string }[] = [
  { value: 'percent_of_product', label: '% del producto', suffix: '%' },
  { value: 'total_mg', label: 'mg total declarado', suffix: 'mg' },
]

const OIL_HELP: Record<OilInputMode, string> = {
  percent_weight_volume: '% p/v significa peso/volumen: gramos de CBD o THC por cada 100 ml. Ej.: 10% p/v = 100 mg/ml.',
  mg_per_ml: 'Con mg/ml, el total sale multiplicando concentración por volumen del frasco.',
  total_mg: 'Con mg total, la concentración sale dividiendo el contenido entre el volumen del frasco.',
}

const INHALATION_HELP: Record<InhalationInputMode, string> = {
  percent_of_product: 'Para inhalables, 66%, 68% o 70% suele significar porcentaje del producto, no p/v. Ej.: 70% en 1 g = 700 mg totales.',
  total_mg: 'Usa mg total si la etiqueta declara directamente cuántos miligramos trae el cartucho o extracto.',
}

function numberFrom(value: string) {
  const normalized = value.replace(',', '.').trim()
  return normalized === '' ? null : Number(normalized)
}

function format(value: number | null, unit: string, decimals = 2) {
  if (value === null) return 'Faltan datos'
  const fixed = value.toFixed(decimals)
  const compact = fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
  return `${compact} ${unit}`
}

function formatPair(cbd: number | null, thc: number | null, unit: string, decimals = 2) {
  if (cbd === null || thc === null) return 'Faltan datos'
  return `CBD ${format(cbd, unit, decimals)} · THC ${format(thc, unit, decimals)}`
}

function calculatorResult<T>(calculate: () => T) {
  try {
    return { value: calculate(), error: null }
  } catch (error) {
    if (!(error instanceof RangeError)) throw error
    return { value: null, error: error.message }
  }
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
      <label htmlFor={id} className={LABEL}><T>{label}</T></label>
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
  max,
  placeholder,
  suffix,
  optional,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  step?: string
  min?: string
  max?: string
  placeholder?: string
  suffix?: string
  optional?: boolean
}) {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className={LABEL}><T>{label}</T>{optional && <> (<T>opcional</T>)</>}</label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          aria-describedby={suffix ? `${id}-unit` : undefined}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`${INPUT} ${suffix ? 'pr-16' : ''}`}
        />
        {suffix && (
          <span id={`${id}-unit`} className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-faint font-mono">
            <T>{suffix}</T>
          </span>
        )}
      </div>
    </div>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-subtle py-3 last:border-0">
      <span className="text-xs text-faint font-mono uppercase tracking-widest"><T>{label}</T></span>
      <span className="text-right text-sm text-white font-mono">{value}</span>
    </div>
  )
}

function PrimaryResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-subtle pb-4">
      <p className="text-xs font-mono uppercase tracking-widest text-faint mb-1"><T>{label}</T></p>
      <p className="break-words text-xl font-light leading-snug text-white sm:text-2xl">{value}</p>
    </div>
  )
}

export default function CannabinoidCalculator() {
  const { t } = useLanguage()
  const [productKind, setProductKind] = useState<ProductKind>('oil')
  const [oilInputMode, setOilInputMode] = useState<OilInputMode>('percent_weight_volume')
  const [oilVolumeMl, setOilVolumeMl] = useState('')
  const [oilCbdValue, setOilCbdValue] = useState('')
  const [oilThcValue, setOilThcValue] = useState('')
  const [dropsPerMl, setDropsPerMl] = useState('')
  const [dropsPerDose, setDropsPerDose] = useState('')
  const [dosesPerDay, setDosesPerDay] = useState('')
  const [inhalationInputMode, setInhalationInputMode] = useState<InhalationInputMode>('percent_of_product')
  const [productGrams, setProductGrams] = useState('')
  const [inhalationCbdValue, setInhalationCbdValue] = useState('')
  const [inhalationThcValue, setInhalationThcValue] = useState('')
  const [expectedInhalations, setExpectedInhalations] = useState('')
  const [flowerGrams, setFlowerGrams] = useState('')
  const [flowerCbdPercent, setFlowerCbdPercent] = useState('')
  const [flowerThcPercent, setFlowerThcPercent] = useState('')
  const [flowerInhalations, setFlowerInhalations] = useState('')

  const oilInput = useMemo(() => ({
    inputMode: oilInputMode,
    volumeMl: numberFrom(oilVolumeMl),
    cbdValue: numberFrom(oilCbdValue),
    thcValue: numberFrom(oilThcValue),
    dropsPerMl: numberFrom(dropsPerMl),
    dropsPerDose: numberFrom(dropsPerDose),
    dosesPerDay: numberFrom(dosesPerDay),
  }), [oilInputMode, oilVolumeMl, oilCbdValue, oilThcValue, dropsPerMl, dropsPerDose, dosesPerDay])

  const inhalationInput = useMemo(() => ({
    inputMode: inhalationInputMode,
    productGrams: numberFrom(productGrams),
    cbdValue: numberFrom(inhalationCbdValue),
    thcValue: numberFrom(inhalationThcValue),
    expectedInhalations: numberFrom(expectedInhalations),
  }), [inhalationInputMode, productGrams, inhalationCbdValue, inhalationThcValue, expectedInhalations])

  const flowerInput = useMemo(() => ({
    flowerGrams: numberFrom(flowerGrams),
    cbdPercent: numberFrom(flowerCbdPercent),
    thcPercent: numberFrom(flowerThcPercent),
    expectedInhalations: numberFrom(flowerInhalations),
  }), [flowerGrams, flowerCbdPercent, flowerThcPercent, flowerInhalations])

  const oilResult = useMemo(() => calculatorResult(() => calculateOilMetrics(oilInput)), [oilInput])
  const inhalationResult = useMemo(() => calculatorResult(() => calculateInhalationMetrics(inhalationInput)), [inhalationInput])
  const flowerResult = useMemo(() => calculatorResult(() => calculateFlowerMetrics(flowerInput)), [flowerInput])
  const oil = oilResult.value
  const inhalation = inhalationResult.value
  const flower = flowerResult.value
  const error = productKind === 'oil' ? oilResult.error : productKind === 'inhalation' ? inhalationResult.error : flowerResult.error
  const oilInputModeOption = OIL_INPUT_MODE_OPTIONS.find(option => option.value === oilInputMode) ?? OIL_INPUT_MODE_OPTIONS[0]
  const inhalationInputModeOption = INHALATION_INPUT_MODE_OPTIONS.find(option => option.value === inhalationInputMode) ?? INHALATION_INPUT_MODE_OPTIONS[0]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="border border-subtle rounded-lg p-5 sm:p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-5"><T>Etiqueta del producto</T></p>

          <div className="grid gap-4 sm:grid-cols-2 mb-5">
            <SelectField label="Tipo de producto" value={productKind} onChange={value => setProductKind(value as ProductKind)}>
              <option value="oil" className="bg-ink"><T>Aceite / gotas</T></option>
              <option value="inhalation" className="bg-ink"><T>Cartucho / extracto</T></option>
              <option value="flower" className="bg-ink"><T>Flor vaporizada</T></option>
            </SelectField>

            {productKind === 'oil' && (
              <SelectField label="La etiqueta muestra" value={oilInputMode} onChange={value => setOilInputMode(value as OilInputMode)}>
                {OIL_INPUT_MODE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value} className="bg-ink"><T>{option.label}</T></option>
                ))}
              </SelectField>
            )}

            {productKind === 'inhalation' && (
              <SelectField label="La etiqueta muestra" value={inhalationInputMode} onChange={value => setInhalationInputMode(value as InhalationInputMode)}>
                {INHALATION_INPUT_MODE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value} className="bg-ink"><T>{option.label}</T></option>
                ))}
              </SelectField>
            )}
          </div>

          <p className="text-xs leading-5 text-faint mb-5">
            {productKind === 'oil' && <T>{OIL_HELP[oilInputMode]}</T>}
            {productKind === 'inhalation' && <T>{INHALATION_HELP[inhalationInputMode]}</T>}
            {productKind === 'flower' && <T>Para flor vaporizada, usa el porcentaje de cannabinoides de la etiqueta y la cantidad de flor cargada. Ej.: 10% en 0.1 g = 10 mg totales teóricos.</T>}
          </p>

          <p className="text-xs leading-5 text-faint mb-5"><T>Completa los datos de etiqueta; escribe 0 solo si está declarado. Los datos de uso son opcionales y no se asumen.</T></p>

          <div className="grid gap-4 sm:grid-cols-2">
            {productKind === 'oil' ? (
              <>
                <Field label="Volumen del frasco" value={oilVolumeMl} onChange={setOilVolumeMl} placeholder="10" suffix="ml" />
                <Field label="CBD declarado" value={oilCbdValue} onChange={setOilCbdValue} placeholder="10" suffix={oilInputModeOption.suffix} />
                <Field label="THC declarado" value={oilThcValue} onChange={setOilThcValue} placeholder="0" suffix={oilInputModeOption.suffix} />
                <Field label="Gotas por ml" value={dropsPerMl} onChange={setDropsPerMl} step="1" suffix="gotas" optional />
                <Field label="Gotas por toma" value={dropsPerDose} onChange={setDropsPerDose} step="1" suffix="gotas" optional />
                <Field label="Tomas por día" value={dosesPerDay} onChange={setDosesPerDay} step="0.5" suffix="x día" optional />
              </>
            ) : productKind === 'inhalation' ? (
              <>
                <Field label="Contenido del producto" value={productGrams} onChange={setProductGrams} step="0.1" placeholder="1" suffix="g" />
                <Field label="CBD declarado" value={inhalationCbdValue} onChange={setInhalationCbdValue} max={inhalationInputMode === 'percent_of_product' ? '100' : undefined} placeholder="0" suffix={inhalationInputModeOption.suffix} />
                <Field label="THC declarado" value={inhalationThcValue} onChange={setInhalationThcValue} max={inhalationInputMode === 'percent_of_product' ? '100' : undefined} placeholder="70" suffix={inhalationInputModeOption.suffix} />
                <Field label="Inhalaciones estimadas" value={expectedInhalations} onChange={setExpectedInhalations} min="1" step="1" placeholder="100" suffix="inh." optional />
              </>
            ) : (
              <>
                <Field label="Flor por carga" value={flowerGrams} onChange={setFlowerGrams} step="0.01" placeholder="0.1" suffix="g" />
                <Field label="CBD en etiqueta" value={flowerCbdPercent} onChange={setFlowerCbdPercent} max="100" placeholder="0" suffix="%" />
                <Field label="THC en etiqueta" value={flowerThcPercent} onChange={setFlowerThcPercent} max="100" placeholder="10" suffix="%" />
                <Field label="Inhalaciones por carga" value={flowerInhalations} onChange={setFlowerInhalations} min="1" step="1" placeholder="5" suffix="inh." optional />
              </>
            )}
          </div>
        </section>

        <aside className="border border-brand/30 bg-brand/5 rounded-lg p-5 sm:p-6" aria-live="polite">
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-5"><T>Resultado</T></p>

          {error ? <p role="alert" className="text-sm text-yellow-200"><T>{error}</T></p> : <>
          <div className="space-y-4 mb-5">
            {productKind === 'oil' && oil ? (
              <>
                <PrimaryResult
                  label="Concentración"
                  value={formatPair(oil.cbdMgPerMl, oil.thcMgPerMl, 'mg/ml')}
                />
                <PrimaryResult
                  label="% p/v equivalente"
                  value={formatPair(oil.cbdPercentWeightVolume, oil.thcPercentWeightVolume, '% p/v')}
                />
                <PrimaryResult
                  label="Total del frasco"
                  value={formatPair(oil.cbdTotalMg, oil.thcTotalMg, 'mg')}
                />
              </>
            ) : productKind === 'inhalation' && inhalation ? (
              <>
                <PrimaryResult
                  label="Contenido estimado"
                  value={formatPair(inhalation.cbdTotalMg, inhalation.thcTotalMg, 'mg')}
                />
                <PrimaryResult
                  label="% del producto"
                  value={formatPair(inhalation.cbdPercentOfProduct, inhalation.thcPercentOfProduct, '%')}
                />
                <PrimaryResult
                  label="Por inhalación teórica"
                  value={inhalation.expectedInhalations === null ? t('Faltan inhalaciones estimadas') : formatPair(inhalation.cbdMgPerInhalation, inhalation.thcMgPerInhalation, 'mg', 3)}
                />
              </>
            ) : productKind === 'flower' && flower ? (
              <>
                <PrimaryResult
                  label="Contenido por carga"
                  value={formatPair(flower.cbdTotalMg, flower.thcTotalMg, 'mg')}
                />
                <PrimaryResult
                  label="% en flor"
                  value={formatPair(flower.cbdPercentOfFlower, flower.thcPercentOfFlower, '%')}
                />
                <PrimaryResult
                  label="Por inhalación teórica"
                  value={flower.expectedInhalations === null ? t('Faltan inhalaciones por carga') : formatPair(flower.cbdMgPerInhalation, flower.thcMgPerInhalation, 'mg', 3)}
                />
              </>
            ) : null}
          </div>

          <ResultRow label="Relación" value={t(productKind === 'oil' && oil ? oil.ratio : productKind === 'inhalation' && inhalation ? inhalation.ratio : flower?.ratio ?? '')} />

          {productKind === 'oil' && oil ? (
            <>
              <ResultRow label="Por gota" value={oil.cbdMgPerDrop === null ? t('Falta gotas por ml') : formatPair(oil.cbdMgPerDrop, oil.thcMgPerDrop, 'mg', 3)} />
              <ResultRow label="Por toma" value={oil.cbdMgPerDrop === null ? t('Requiere gotas por ml y gotas por toma') : oil.cbdMgPerDose === null ? t('Falta gotas por toma') : formatPair(oil.cbdMgPerDose, oil.thcMgPerDose, 'mg', 3)} />
              <ResultRow label="Envase alcanza" value={oil.dosesPerBottle === null ? t('Requiere gotas por ml y gotas por toma') : `${format(oil.dosesPerBottle, t('tomas'), 1)} · ${oil.estimatedDays === null ? t('Falta tomas por día') : format(oil.estimatedDays, t('días'), 1)}`} />
            </>
          ) : productKind === 'inhalation' && inhalation ? (
            <>
              <ResultRow label="Producto" value={format(inhalation.productGrams, 'g', 2)} />
              {inhalation.expectedInhalations !== null && <ResultRow label="Inhalaciones" value={format(inhalation.expectedInhalations, t('estimadas'), 0)} />}
            </>
          ) : productKind === 'flower' && flower ? (
            <>
              <ResultRow label="Flor por carga" value={format(flower.flowerGrams, 'g', 2)} />
              {flower.expectedInhalations !== null && <ResultRow label="Inhalaciones" value={format(flower.expectedInhalations, t('estimadas'), 0)} />}
            </>
          ) : null}
          </>}
        </aside>
      </div>

      <section className="border border-yellow-400/30 bg-yellow-400/5 rounded-lg p-5">
        <p className="text-xs font-mono uppercase tracking-widest text-yellow-300 mb-2"><T>Uso seguro</T></p>
        <p className="text-sm leading-6 text-yellow-50">
          <T>Esta calculadora solo convierte datos de etiqueta. En aceites, % p/v es peso/volumen; en cartuchos y flor, el porcentaje suele ser del producto. No calcula absorción real, dosis clínica, descarboxilación ni cambios de tratamiento.</T>
        </p>
      </section>
    </div>
  )
}
