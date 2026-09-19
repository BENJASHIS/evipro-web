import english from './locales/en.json'

export type Locale = 'es' | 'en'
export const LOCALE_COOKIE = 'evipro_locale'

export function isLocale(value: unknown): value is Locale {
  return value === 'es' || value === 'en'
}

export function detectLocale(preference?: string | null, acceptLanguage = ''): Locale {
  if (isLocale(preference)) return preference
  const candidates = acceptLanguage.split(',').map((part, index) => {
    const [tag, ...params] = part.trim().toLowerCase().split(';')
    const quality = params.find(p => p.trim().startsWith('q='))
    return { locale: tag.split('-')[0], quality: quality ? Number(quality.trim().slice(2)) : 1, index }
  }).filter(c => isLocale(c.locale) && Number.isFinite(c.quality) && c.quality > 0 && c.quality <= 1)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
  return (candidates[0]?.locale as Locale | undefined) ?? 'es'
}

/** Only published UI copy belongs here. Never translate patient-entered data. */
export function translate(locale: Locale, source: string): string {
  if (locale === 'es') return source
  const key = source.replace(/\s+/g, ' ').trim()
  const value = Object.hasOwn(english, key) ? (english as Record<string, string>)[key] : undefined
  if (!value) return source
  return `${source.match(/^\s*/)?.[0] ?? ''}${value}${source.match(/\s*$/)?.[0] ?? ''}`
}
