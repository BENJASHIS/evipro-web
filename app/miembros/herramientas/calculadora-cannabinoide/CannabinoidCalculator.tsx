'use client'

import { useId, useMemo, useState, type ReactNode } from 'react'
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
  max,
  placeholder,
  suffix,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  step?: string
  min?: string
  max?: string
  placeholder?: string
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
          max={max}
          step={step}
          placeholder={placeholder}
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
  const [oilInputMode, setOilInputMode] = useState<OilInputMode>('percent_weight_volume')
  const [oilVolumeMl, setOilVolumeMl] = useState('10')
  const [oilCbdValue, setOilCbdValue] = useState('10')
  const [oilThcValue, setOilThcValue] = useState('0')
  const [dropsPerMl, setDropsPerMl] = useState('20')
  const [dropsPerDose, setDropsPerDose] = useState('1')
  const [dosesPerDay, setDosesPerDay] = useState('1')
  const [inhalationInputMode, setInhalationInputMode] = useState<InhalationInputMode>('percent_of_product')
  const [productGrams, setProductGrams] = useState('1')
  const [inhalationCbdValue, setInhalationCbdValue] = useState('0')
  const [inhalationThcValue, setInhalationThcValue] = useState('70')
  const [expectedInhalations, setExpectedInhalations] = useState('100')
  const [flowerGrams, setFlowerGrams] = useState('0.1')
  const [flowerCbdPercent, setFlowerCbdPercent] = useState('0')
  const [flowerThcPercent, setFlowerThcPercent] = useState('10')
  const [flowerInhalations, setFlowerInhalations] = useState('5')

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

  const oil = useMemo(() => calculateOilMetrics(oilInput), [oilInput])
  const inhalation = useMemo(() => calculateInhalationMetrics(inhalationInput), [inhalationInput])
  const flower = useMemo(() => calculateFlowerMetrics(flowerInput), [flowerInput])
  const oilInputModeOption = OIL_INPUT_MODE_OPTIONS.find(option => option.value === oilInputMode) ?? OIL_INPUT_MODE_OPTIONS[0]
  const inhalationInputModeOption = INHALATION_INPUT_MODE_OPTIONS.find(option => option.value === inhalationInputMode) ?? INHALATION_INPUT_MODE_OPTIONS[0]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="border border-subtle rounded-lg p-5 sm:p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-5">Etiqueta del producto</p>

          <div className="grid gap-4 sm:grid-cols-2 mb-5">
            <SelectField label="Tipo de producto" value={productKind} onChange={value => setProductKind(value as ProductKind)}>
              <option value="oil" className="bg-ink">Aceite / gotas</option>
              <option value="inhalation" className="bg-ink">Cartucho / extracto</option>
              <option value="flower" className="bg-ink">Flor vaporizada</option>
            </SelectField>

            {productKind === 'oil' && (
              <SelectField label="La etiqueta muestra" value={oilInputMode} onChange={value => setOilInputMode(value as OilInputMode)}>
                {OIL_INPUT_MODE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value} className="bg-ink">{option.label}</option>
                ))}
              </SelectField>
            )}

            {productKind === 'inhalation' && (
              <SelectField label="La etiqueta muestra" value={inhalationInputMode} onChange={value => setInhalationInputMode(value as InhalationInputMode)}>
                {INHALATION_INPUT_MODE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value} className="bg-ink">{option.label}</option>
                ))}
              </SelectField>
            )}
          </div>

          <p className="text-xs leading-5 text-faint mb-5">
            {productKind === 'oil' && OIL_HELP[oilInputMode]}
            {productKind === 'inhalation' && INHALATION_HELP[inhalationInputMode]}
            {productKind === 'flower' && 'Para flor vaporizada, usa el porcentaje de cannabinoides de la etiqueta y la cantidad de flor cargada. Ej.: 10% en 0.1 g = 10 mg totales teóricos.'}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {productKind === 'oil' ? (
              <>
                <Field label="Volumen del frasco" value={oilVolumeMl} onChange={setOilVolumeMl} placeholder="10" suffix="ml" />
                <Field label="CBD declarado" value={oilCbdValue} onChange={setOilCbdValue} max={oilInputMode === 'percent_weight_volume' ? '100' : undefined} placeholder="10" suffix={oilInputModeOption.suffix} />
                <Field label="THC declarado" value={oilThcValue} onChange={setOilThcValue} max={oilInputMode === 'percent_weight_volume' ? '100' : undefined} placeholder="0" suffix={oilInputModeOption.suffix} />
                <Field label="Gotas por ml" value={dropsPerMl} onChange={setDropsPerMl} step="1" suffix="gotas" />
                <Field label="Gotas por toma" value={dropsPerDose} onChange={setDropsPerDose} step="1" suffix="gotas" />
                <Field label="Tomas por día" value={dosesPerDay} onChange={setDosesPerDay} step="0.5" suffix="x día" />
              </>
            ) : productKind === 'inhalation' ? (
              <>
                <Field label="Contenido del producto" value={productGrams} onChange={setProductGrams} step="0.1" placeholder="1" suffix="g" />
                <Field label="CBD declarado" value={inhalationCbdValue} onChange={setInhalationCbdValue} max={inhalationInputMode === 'percent_of_product' ? '100' : undefined} placeholder="0" suffix={inhalationInputModeOption.suffix} />
                <Field label="THC declarado" value={inhalationThcValue} onChange={setInhalationThcValue} max={inhalationInputMode === 'percent_of_product' ? '100' : undefined} placeholder="70" suffix={inhalationInputModeOption.suffix} />
                <Field label="Inhalaciones estimadas" value={expectedInhalations} onChange={setExpectedInhalations} step="1" placeholder="100" suffix="inh." />
              </>
            ) : (
              <>
                <Field label="Flor por carga" value={flowerGrams} onChange={setFlowerGrams} step="0.01" placeholder="0.1" suffix="g" />
                <Field label="CBD en etiqueta" value={flowerCbdPercent} onChange={setFlowerCbdPercent} max="100" placeholder="0" suffix="%" />
                <Field label="THC en etiqueta" value={flowerThcPercent} onChange={setFlowerThcPercent} max="100" placeholder="10" suffix="%" />
                <Field label="Inhalaciones por carga" value={flowerInhalations} onChange={setFlowerInhalations} step="1" placeholder="5" suffix="inh." />
              </>
            )}
          </div>
        </section>

        <aside className="border border-brand/30 bg-brand/5 rounded-lg p-5 sm:p-6" aria-live="polite">
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-5">Resultado</p>

          <div className="space-y-4 mb-5">
            {productKind === 'oil' ? (
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
            ) : productKind === 'inhalation' ? (
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
                  value={formatPair(inhalation.cbdMgPerInhalation, inhalation.thcMgPerInhalation, 'mg', 3)}
                />
              </>
            ) : (
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
                  value={formatPair(flower.cbdMgPerInhalation, flower.thcMgPerInhalation, 'mg', 3)}
                />
              </>
            )}
          </div>

          <ResultRow label="Relación" value={productKind === 'oil' ? oil.ratio : productKind === 'inhalation' ? inhalation.ratio : flower.ratio} />

          {productKind === 'oil' ? (
            <>
              <ResultRow label="Por gota" value={formatPair(oil.cbdMgPerDrop, oil.thcMgPerDrop, 'mg', 3)} />
              <ResultRow label="Por toma" value={formatPair(oil.cbdMgPerDose, oil.thcMgPerDose, 'mg', 3)} />
              <ResultRow label="Envase alcanza" value={`${format(oil.dosesPerBottle, 'tomas', 1)} · ${oil.estimatedDays ? format(oil.estimatedDays, 'días', 1) : 'sin tomas/día'}`} />
            </>
          ) : productKind === 'inhalation' ? (
            <>
              <ResultRow label="Producto" value={format(inhalation.productGrams, 'g', 2)} />
              <ResultRow label="Inhalaciones" value={format(inhalation.expectedInhalations, 'estimadas', 0)} />
            </>
          ) : (
            <>
              <ResultRow label="Flor por carga" value={format(flower.flowerGrams, 'g', 2)} />
              <ResultRow label="Inhalaciones" value={format(flower.expectedInhalations, 'estimadas', 0)} />
            </>
          )}
        </aside>
      </div>

      <section className="border border-yellow-400/30 bg-yellow-400/5 rounded-lg p-5">
        <p className="text-xs font-mono uppercase tracking-widest text-yellow-300 mb-2">Uso seguro</p>
        <p className="text-sm leading-6 text-yellow-50">
          Esta calculadora solo convierte datos de etiqueta. En aceites, % p/v es peso/volumen; en cartuchos y flor, el porcentaje suele ser del producto.
          No calcula absorción real, dosis clínica, descarboxilación ni cambios de tratamiento.
        </p>
      </section>
    </div>
  )
}
