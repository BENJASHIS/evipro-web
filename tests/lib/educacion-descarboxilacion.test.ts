import { constanteTHCA, fraccionTHCARestante, CASI_CERO_MEDIDO, formatoPorcentaje } from '@/lib/educacion/descarboxilacion'

it('constantes medidas de la Tabla 2', () => {
  expect(constanteTHCA(80)).toEqual({ k: 0.18e-3, origen: 'medido' })
  expect(constanteTHCA(95)).toEqual({ k: 0.66e-3, origen: 'medido' })
  expect(constanteTHCA(110)).toEqual({ k: 1.83e-3, origen: 'medido' })
})
it('130 y 145 °C estimadas por Arrhenius (Ea 88 kJ/mol) y rotuladas', () => {
  expect(constanteTHCA(130).origen).toBe('estimado')
  expect(constanteTHCA(130).k).toBeCloseTo(7.2e-3, 4)
  expect(constanteTHCA(145).k).toBeCloseTo(18.5e-3, 3)
})
it('coincide con los tiempos medidos de casi cero', () => {
  for (const [t, min] of Object.entries(CASI_CERO_MEDIDO)) expect(fraccionTHCARestante(Number(t) as 110, min!)).toBeLessThan(0.05)
})
it('bajo 100 °C no se completa en 60 min', () => {
  expect(fraccionTHCARestante(95, 60)).toBeGreaterThan(0.05)
  expect(fraccionTHCARestante(80, 60)).toBeGreaterThan(0.4)
})
it('extremos del tiempo sin NaN', () => {
  expect(fraccionTHCARestante(145, 0)).toBe(1)
  expect(fraccionTHCARestante(110, -5)).toBe(1)
  expect(fraccionTHCARestante(110, 999)).toBe(fraccionTHCARestante(110, 60))
})
it('formato por idioma', () => {
  expect(formatoPorcentaje(7.94, 'es', 1)).toBe('7,9 %')
  expect(formatoPorcentaje(7.94, 'en', 1)).toBe('7.9%')
  expect(formatoPorcentaje(100, 'es')).toBe('100 %')
  expect(formatoPorcentaje(3.71, 'es', 1)).toBe('3,7 %')
})
