'use server'
import { requireAdmin } from '@/lib/admin-guard'
import { VIGENCIA_DEFECTO, VIGENCIAS_DIAS, composicionTexto, firmarGuia } from '@/lib/guia-frasco'
import { SITE_URL } from '@/lib/seo'

export type EstadoEnlace =
  | { ok: true; url: string; linea: string; proporcion: string; vence: string; whatsapp: string }
  | { ok: false; error: string }

// Carlos escribe «0,9» con coma o «10 %» con el signo: se lee como 0.9 y 10.
const porcentaje = (v: FormDataEntryValue | null) => Number(String(v ?? '').replace(/%/g, '').trim().replace(',', '.'))

export async function crearEnlaceGuia(_prev: EstadoEnlace | null, formData: FormData): Promise<EstadoEnlace> {
  await requireAdmin()
  const thc = porcentaje(formData.get('thc'))
  const cbd = porcentaje(formData.get('cbd'))
  const pedido = Number(formData.get('dias'))
  const dias = (VIGENCIAS_DIAS as readonly number[]).includes(pedido) ? pedido : VIGENCIA_DEFECTO
  const ahora = Date.now()
  let token: string
  try {
    token = firmarGuia({ thc, cbd, dias }, ahora)
  } catch (error) {
    if (error instanceof RangeError) return { ok: false, error: 'Revisa los porcentajes: entre 0 y 100, al menos uno mayor que 0 y que no sumen más de 100.' }
    if (error instanceof Error && error.message.includes('FRASCO_GUIDE_SECRET')) return { ok: false, error: 'Falta configurar FRASCO_GUIDE_SECRET en Vercel, con al menos 32 caracteres.' }
    throw error
  }
  const url = `${SITE_URL}/g/${token}`
  const vence = new Date(ahora + dias * 86_400_000).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
  const { linea, proporcion } = composicionTexto(thc, cbd)
  const whatsapp = 'https://wa.me/?text=' + encodeURIComponent(`Esta es la guía de uso de tu frasco: ${url} · válida hasta el ${vence}`)
  return { ok: true, url, linea, proporcion, vence, whatsapp }
}
