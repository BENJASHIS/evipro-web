import { readFile } from 'node:fs/promises'
import path from 'node:path'
import manifest from '@/private/frasco/manifest.json'

export const cabecerasPrivadas = { 'Cache-Control':'private, no-store', 'X-Robots-Tag':'noindex, nofollow', 'X-Content-Type-Options':'nosniff', 'X-Frame-Options':'SAMEORIGIN' }

// Sirve un archivo del paquete del visor (private/frasco) solo si está en el manifiesto.
export async function servirArchivoVisor(key: string): Promise<Response> {
  if (!Object.hasOwn(manifest.files,key)) return new Response('Recurso no encontrado.',{ status:404,headers:cabecerasPrivadas })
  const entry = manifest.files[key as keyof typeof manifest.files]
  try {
    const bytes = await readFile(path.join(process.cwd(),'private/frasco',key))
    return new Response(new Uint8Array(bytes),{ headers:{
      ...cabecerasPrivadas,
      'Content-Type':entry.type,
      'Content-Security-Policy':`default-src 'none'; script-src 'self' 'sha256-${manifest.importMapHash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'; object-src 'none'`,
    } })
  } catch {
    return new Response('No se pudo cargar el recurso.',{ status:500,headers:cabecerasPrivadas })
  }
}
