import { describe, expect, it } from 'vitest'
import { detectLocale, translate } from '@/lib/i18n'

describe('language preference', () => {
  it('honors explicit selection before browser preferences', () => {
    expect(detectLocale('es', 'en-US,en;q=0.9')).toBe('es')
    expect(detectLocale('en', 'es-PE')).toBe('en')
  })
  it('handles regional tags, quality, excluded languages and unsupported preferences', () => {
    expect(detectLocale(undefined, 'fr,en-GB;q=0.9,es;q=0.7')).toBe('en')
    expect(detectLocale(undefined, 'en;q=0,es-PE;q=0.5')).toBe('es')
    expect(detectLocale(undefined, 'en;q=garbage')).toBe('es')
    expect(detectLocale('invalid', 'de')).toBe('es')
    expect(detectLocale(undefined, 'es;q=0.2,en;q=0.8')).toBe('en')
  })
})

describe('reviewable translations', () => {
  it('does not invent qualifications or guarantee prescriptions', () => {
    expect(translate('en', 'Médico Cirujano')).toBe('Physician')
    expect(translate('en', '✓ Receta si corresponde')).toContain('if clinically appropriate')
    expect(translate('en', 'Básico')).toBe('Basic')
  })
  it('preserves original Spanish, whitespace and unknown data', () => {
    expect(translate('es', '  Consulta médica ')).toBe('  Consulta médica ')
    expect(translate('en', '  Consulta médica ')).toBe('  Medical consultation ')
    expect(translate('en', 'Patient entered note: 10 mg')).toBe('Patient entered note: 10 mg')
  })
})
