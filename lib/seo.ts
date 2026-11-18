import type { Metadata } from 'next'

// Destino final verificado: evipro.pe redirige a www.evipro.pe en producción.
export const SITE_URL = 'https://www.evipro.pe'
export const CONSULTA_PATH = '/consulta-cannabis-medicinal'

/** Cada página pública declara su URL: no heredar la canonical de la portada. */
export function publicMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, SITE_URL).toString()
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'EVIPro', locale: 'es_PE', type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

// Se permite rastrear estas páginas para que se lea X-Robots-Tag. La
// autenticación sigue protegiendo datos: noindex no es un control de acceso.
export const NOINDEX_ROUTES = [
  '/admin/:path*', '/miembros/:path*', '/checkout/:path*',
  '/medicos/:slug/reservas/:path*', '/medicos/:slug/agendar/:path*',
  '/login', '/registro', '/recuperar-contrasena', '/actualizar-contrasena',
  '/styleguide', '/consejeria/pago-ok', '/consejeria/pago-error',
  '/consejeria/pago-pendiente', '/guia-frasco/:path*',
]
