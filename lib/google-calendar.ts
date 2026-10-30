// Google Calendar de Carlos como única agenda (spec de la secretaría, §6.2 y §7.7):
// la web oculta lo ocupado y cada reserva crea su evento, tentativo hasta confirmar.
// Sin GOOGLE_SERVICE_ACCOUNT_JSON o GOOGLE_CALENDAR_ID no se llama a Google.
// Una falla de Google nunca bloquea una reserva: las funciones públicas no lanzan.
import { createSign } from 'node:crypto'

export interface Intervalo { start: string; end: string }

export interface ReservaEvento {
  id: string
  doctor_slug: string
  patient_name: string
  modality: string
  slot_date: string | null
  slot_time: string | null
}

const LIMA = '-05:00' // Perú no tiene horario de verano
const HORA_MS = 3_600_000

// ponytail: un solo médico con calendario; pasar a un mapa slug → variable si se suma otro.
export function calendarioDe(slug: string): string | null {
  if (slug !== 'dr-jara' || !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return null
  return process.env.GOOGLE_CALENDAR_ID || null
}

/** El id de la reserva (uuid) sin guiones: sus caracteres hex caben en el base32hex que pide Google. */
export function idEvento(bookingId: string): string {
  return bookingId.replace(/-/g, '').toLowerCase()
}

export function hoyEnLima(ahora: Date = new Date()): string {
  return new Date(ahora.getTime() - 5 * HORA_MS).toISOString().slice(0, 10)
}

export function fechasDesde(inicio: string, n: number): string[] {
  const base = Date.parse(`${inicio}T00:00:00Z`)
  return Array.from({ length: n }, (_, i) => new Date(base + i * 24 * HORA_MS).toISOString().slice(0, 10))
}

const inicioTurno = (fecha: string, hora: string) => Date.parse(`${fecha}T${hora}:00${LIMA}`)

/** Turnos de una hora que se cruzan con algún intervalo ocupado, como claves `${fecha}T${hora}`. */
export function slotsOcupados(busy: Intervalo[], fechas: string[], horario: string[]): string[] {
  const intervalos = busy.map(b => [Date.parse(b.start), Date.parse(b.end)])
  return fechas.flatMap(fecha => horario
    .filter(hora => {
      const ini = inicioTurno(fecha, hora)
      return intervalos.some(([s, e]) => s < ini + HORA_MS && e > ini)
    })
    .map(hora => `${fecha}T${hora}`))
}

const enLima = (ms: number) => new Date(ms - 5 * HORA_MS).toISOString().slice(0, 19) + LIMA

/** Solo nombre, modalidad e id de la reserva: nunca la nota ni el teléfono (spec §7.3). */
export function cuerpoEvento(r: ReservaEvento, status: 'tentative' | 'confirmed'): Record<string, unknown> {
  const ini = inicioTurno(r.slot_date ?? '', r.slot_time ?? '')
  return {
    id: idEvento(r.id),
    status,
    summary: `EVIPro · ${r.patient_name} · ${r.modality}`,
    description: `Reserva web ${r.id}`,
    start: { dateTime: enLima(ini), timeZone: 'America/Lima' },
    end: { dateTime: enLima(ini + HORA_MS), timeZone: 'America/Lima' },
  }
}

// --- Llamadas a Google: cuenta de servicio con JWT firmado aquí, sin dependencias ---

const API = 'https://www.googleapis.com/calendar/v3'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy'
const ESPERA_MS = 4000

class ErrorGoogle extends Error {
  constructor(readonly status: number) { super(`HTTP ${status}`) }
}

let cache: { token: string; vence: number } | null = null

async function token(): Promise<string> {
  if (cache && Date.now() < cache.vence) return cache.token
  const { client_email, private_key } = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? '')
  const ahora = Math.floor(Date.now() / 1000)
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const sinFirma = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: client_email, scope: SCOPE, aud: TOKEN_URL, iat: ahora, exp: ahora + 3600 })}`
  const firma = createSign('RSA-SHA256').update(sinFirma).sign(private_key, 'base64url')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${sinFirma}.${firma}` }),
    signal: AbortSignal.timeout(ESPERA_MS),
  })
  if (!res.ok) throw new ErrorGoogle(res.status)
  const { access_token, expires_in } = await res.json() as { access_token: string; expires_in: number }
  cache = { token: access_token, vence: Date.now() + (expires_in - 60) * 1000 }
  return access_token
}

async function google(ruta: string, method: 'POST' | 'PATCH', cuerpo: unknown): Promise<Response> {
  return fetch(`${API}${ruta}`, {
    method,
    headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(ESPERA_MS),
  })
}

// Solo la referencia (id de reserva o slug) y el estado: nunca datos del paciente.
function falla(operacion: string, referencia: string, e: unknown) {
  const detalle = e instanceof ErrorGoogle ? e.status : e instanceof Error ? e.message : String(e)
  console.error(`[google-calendar] ${operacion} falló`, referencia, detalle)
}

const eventos = (cal: string) => `/calendars/${encodeURIComponent(cal)}/events`

async function insertar(cal: string, r: ReservaEvento, status: 'tentative' | 'confirmed') {
  const res = await google(eventos(cal), 'POST', cuerpoEvento(r, status))
  if (!res.ok) throw new ErrorGoogle(res.status)
}

const cambiarEstado = (cal: string, bookingId: string, status: 'confirmed' | 'cancelled') =>
  google(`${eventos(cal)}/${idEvento(bookingId)}`, 'PATCH', { status })

/** Turnos ocupados en el calendario del médico; [] si no tiene calendario o si Google falla. */
export async function ocupadosEnGoogle(slug: string, fechas: string[], horario: string[]): Promise<string[]> {
  const cal = calendarioDe(slug)
  if (!cal || fechas.length === 0) return []
  try {
    const res = await google('/freeBusy', 'POST', {
      timeMin: `${fechas[0]}T00:00:00${LIMA}`,
      timeMax: `${fechas[fechas.length - 1]}T23:59:59${LIMA}`,
      timeZone: 'America/Lima',
      items: [{ id: cal }],
    })
    if (!res.ok) throw new ErrorGoogle(res.status)
    const { calendars } = await res.json() as { calendars?: Record<string, { busy?: Intervalo[]; errors?: { reason: string }[] }> }
    const datos = calendars?.[cal]
    if (!datos || datos.errors?.length) throw new Error(datos?.errors?.[0]?.reason ?? 'sin calendario en la respuesta')
    return slotsOcupados(datos.busy ?? [], fechas, horario)
  } catch (e) {
    falla('freeBusy', slug, e)
    return []
  }
}

export async function crearEventoTentativo(r: ReservaEvento): Promise<void> {
  const cal = calendarioDe(r.doctor_slug)
  if (!cal || !r.slot_date || !r.slot_time) return
  try {
    await insertar(cal, r, 'tentative')
  } catch (e) {
    falla('crear evento', r.id, e)
  }
}

export async function confirmarEvento(r: ReservaEvento): Promise<void> {
  const cal = calendarioDe(r.doctor_slug)
  if (!cal || !r.slot_date || !r.slot_time) return
  try {
    const res = await cambiarEstado(cal, r.id, 'confirmed')
    // 404: Google estaba caído al reservar y el evento nunca se creó.
    if (res.status === 404) await insertar(cal, r, 'confirmed')
    else if (!res.ok) throw new ErrorGoogle(res.status)
  } catch (e) {
    falla('confirmar evento', r.id, e)
  }
}

export async function cancelarEvento(r: { id: string; doctor_slug: string }): Promise<void> {
  const cal = calendarioDe(r.doctor_slug)
  if (!cal) return
  try {
    const res = await cambiarEstado(cal, r.id, 'cancelled')
    // 404/410: no había evento (reserva sin turno o Google caído al reservar) o ya estaba cancelado.
    if (!res.ok && res.status !== 404 && res.status !== 410) throw new ErrorGoogle(res.status)
  } catch (e) {
    falla('cancelar evento', r.id, e)
  }
}
