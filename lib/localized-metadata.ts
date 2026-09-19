import { getLocale } from './locale-server'
import { translate } from './i18n'
import { publicMetadata } from './seo'

export async function localizedMetadata(path: string, title: string, description: string) {
  const locale = await getLocale()
  const metadata = publicMetadata(path, translate(locale, title), translate(locale, description))
  return { ...metadata, openGraph: { ...metadata.openGraph, locale: locale === 'en' ? 'en_US' : 'es_PE' } }
}
