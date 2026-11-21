import { createHmac, timingSafeEqual } from 'node:crypto'
import { cannabinoidRatio } from '@/lib/cannabinoid-calculator'

// Enlace firmado de la guía del frasco, compacto (Carlos, 20-nov): <firma de 22><thc>-<cbd>-<vence en base 36>.
// La firma es HMAC-SHA256 recortado a 128 bits; los datos van a la vista, como antes, y sin datos del paciente.
export interface GuiaFrasco { thc: number; cbd: number; exp: number }

export const VIGENCIAS_DIAS = [30, 90, 180] as const
export const VIGENCIA_DEFECTO = 90

function valido(thc: unknown, cbd: unknown): thc is number {
  return (
    typeof thc === 'number' && typeof cbd === 'number' &&
    Number.isFinite(thc) && Number.isFinite(cbd) &&
    thc >= 0 && cbd >= 0 && thc <= 100 && cbd <= 100 &&
    thc + cbd > 0 && thc + cbd <= 100
  )
}

// Un secreto corto se adivina: el panel pide crearlo con `openssl rand -base64 32`.
const SECRETO_MIN = 32
// Perú está en UTC-5 todo el año: el enlace vale hasta el final de su último día en Lima.
const LIMA_MS = 5 * 3600_000
const finDelDiaLima = (ms: number) => Math.floor((ms - LIMA_MS) / 86_400_000) * 86_400_000 + 86_400_000 - 1000 + LIMA_MS

const LARGO_FIRMA = 22   // 16 bytes en base64url
const firma = (datos: string, secret: string) =>
  createHmac('sha256', secret).update(datos).digest().subarray(0, 16).toString('base64url')
// Tres decimales bastan para una concentración y evitan la notación exponencial («1e-7»).
const tresDecimales = (n: number) => Math.round(n * 1000) / 1000
const DATOS = /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)-([0-9a-z]+)$/

export function firmarGuia(
  datos: { thc: number; cbd: number; dias: number },
  ahora = Date.now(),
  secret = process.env.FRASCO_GUIDE_SECRET ?? '',
): string {
  if (secret.length < SECRETO_MIN) throw new Error('Falta FRASCO_GUIDE_SECRET (al menos 32 caracteres)')
  const thc = tresDecimales(datos.thc), cbd = tresDecimales(datos.cbd)
  if (!valido(thc, cbd)) throw new RangeError('THC/CBD fuera de rango')
  if (!Number.isInteger(datos.dias) || datos.dias <= 0) throw new RangeError('Vigencia inválida')
  const exp = Math.floor(finDelDiaLima(ahora + datos.dias * 86_400_000) / 1000)
  const cuerpo = `${thc}-${cbd}-${exp.toString(36)}`
  return firma(cuerpo, secret) + cuerpo
}

export function verificarGuia(
  token: string,
  ahora = Date.now(),
  secret = process.env.FRASCO_GUIDE_SECRET ?? '',
): GuiaFrasco | null {
  if (secret.length < SECRETO_MIN || typeof token !== 'string') return null
  const recibida = token.slice(0, LARGO_FIRMA), cuerpo = token.slice(LARGO_FIRMA)
  const m = DATOS.exec(cuerpo)
  if (!m) return null
  const a = Buffer.from(recibida)
  const b = Buffer.from(firma(cuerpo, secret))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  const thc = Number(m[1]), cbd = Number(m[2]), exp = parseInt(m[3], 36)
  if (!valido(thc, cbd) || !Number.isSafeInteger(exp) || exp * 1000 <= ahora) return null
  return { thc, cbd, exp }
}

export const formatearPct = (n: number): string => String(Number(n.toPrecision(5)))

export function composicionTexto(thc: number, cbd: number): { linea: string; proporcion: string } {
  return {
    linea: `THC ${formatearPct(thc)} % : CBD ${formatearPct(cbd)} % (${formatearPct(thc * 10)} : ${formatearPct(cbd * 10)} mg/ml)`,
    proporcion: cannabinoidRatio(cbd * 10, thc * 10),
  }
}
