import { verificarGuia } from '@/lib/guia-frasco'
import { cabecerasPrivadas, servirArchivoVisor } from '@/lib/visor-frasco'

export const runtime = 'nodejs'

// El enlace firmado es el permiso: sin cuenta, sin cambio de idioma ni restricción a CBD.
export async function GET(_request: Request, { params }: { params: Promise<{ token: string; asset: string[] }> }) {
  const { token, asset } = await params
  if (!verificarGuia(token)) return new Response('Recurso no encontrado.',{ status:404,headers:cabecerasPrivadas })
  return servirArchivoVisor(asset.join('/'))
}
