import { cookies, headers } from 'next/headers'
import { cache } from 'react'
import { detectLocale, LOCALE_COOKIE } from './i18n'

export const getLocale = cache(async () => {
  const [jar, requestHeaders] = await Promise.all([cookies(), headers()])
  return detectLocale(jar.get(LOCALE_COOKIE)?.value, requestHeaders.get('accept-language') ?? '')
})
