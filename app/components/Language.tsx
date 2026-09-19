'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { translate, type Locale } from '@/lib/i18n'

const LanguageContext = createContext<Locale>('es')

export function LanguageProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LanguageContext.Provider value={locale}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const locale = useContext(LanguageContext)
  return { locale, t: (source: string) => translate(locale, source) }
}

export function T({ children, values }: { children: string; values?: Record<string, string | number> }) {
  const { t } = useLanguage()
  return t(children).replace(/\{(\w+)\}/g, (match, key: string) =>
    values && Object.hasOwn(values, key) ? String(values[key]) : match)
}

export function LanguageSelect() {
  const { locale } = useLanguage()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  return <div className="flex flex-col items-end shrink-0">
    <select
      aria-label="Idioma / Language"
      value={locale}
      disabled={busy}
      className="max-w-32 rounded border border-subtle bg-ink px-2 py-2 text-xs text-white"
      onChange={async event => {
        setBusy(true)
        setError(false)
        try {
          const response = await fetch('/api/locale', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale: event.target.value }),
          })
          if (!response.ok) throw new Error('locale')
          router.refresh()
        } catch { setError(true) }
        finally { setBusy(false) }
      }}
    >
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>
    {error && <p role="alert" className="text-xs text-red-400"><T>No se pudo cambiar el idioma. Intenta de nuevo.</T></p>}
  </div>
}
