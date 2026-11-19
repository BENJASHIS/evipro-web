import { getLocale } from '@/lib/locale-server'
import { servirArchivoVisor } from '@/lib/visor-frasco'

export const runtime = 'nodejs'

// Visor educativo abierto a todos (Carlos, 19-nov): sin sesión ni membresía.
export async function GET(_request: Request, { params }: { params: Promise<{ asset: string[] }> }) {
  const { asset } = await params
  let key = asset.join('/')
  if (key === 'index.html' && await getLocale() === 'en') key = 'index-en.html'
  return servirArchivoVisor(key)
}
