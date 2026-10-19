import type { MetadataRoute } from 'next'
import { DOCTORS } from '@/lib/doctors'
import { CONSULTA_PATH, SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  // Solo páginas públicas canónicas. Sin fechas de modificación inventadas,
  // formularios, tokens, redirects ni consultas a datos de pacientes.
  const paths = [
    '/', CONSULTA_PATH, '/medicos', '/planes', '/aliados', '/dudas-del-viajero',
    '/terminos', '/politica-devoluciones',
    ...DOCTORS.map(doctor => `/medicos/${doctor.slug}`),
  ]
  return paths.map(path => ({ url: new URL(path, SITE_URL).toString() }))
}
