import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'
import manifest from '@/private/frasco/manifest.json'

export const runtime = 'nodejs'
const privateHeaders = { 'Cache-Control':'private, no-store', 'X-Robots-Tag':'noindex, nofollow', 'X-Content-Type-Options':'nosniff', 'X-Frame-Options':'SAMEORIGIN' }

export async function GET(_request: Request, { params }: { params: Promise<{ asset: string[] }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Inicia sesión para abrir este recurso.',{ status:401,headers:privateHeaders })
  const access = await getMemberAccess(supabase,user)
  const { asset } = await params
  let key = asset.join('/')
  if (!canUseMemberTools(access)) {
    if (key === 'assets/thc.json' || key === 'assets/thc-reference.svg') return new Response('THC y mezclas requieren membresía activa.',{ status:403,headers:privateHeaders })
    if (key === 'index.html') key = 'cbd.html'
  }
  if (!Object.hasOwn(manifest.files,key)) return new Response('Recurso no encontrado.',{ status:404,headers:privateHeaders })
  const entry = manifest.files[key as keyof typeof manifest.files]
  try {
    const bytes = await readFile(path.join(process.cwd(),'private/frasco',key))
    return new Response(new Uint8Array(bytes),{ headers:{
      ...privateHeaders,
      'Content-Type':entry.type,
      'Content-Security-Policy':`default-src 'none'; script-src 'self' 'sha256-${manifest.importMapHash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'; object-src 'none'`,
    } })
  } catch {
    return new Response('No se pudo cargar el recurso.',{ status:500,headers:privateHeaders })
  }
}
