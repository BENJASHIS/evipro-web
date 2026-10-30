// Google Calendar de Carlos como única agenda (spec de la secretaría, §6.2 y §7.7):
// la web oculta lo ocupado y cada reserva crea su evento, tentativo hasta confirmar.
// Sin GOOGLE_SERVICE_ACCOUNT_JSON o GOOGLE_CALENDAR_ID no se llama a Google.

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
    description: `Reserva web ${r.id} · tentativa hasta confirmar en el panel`,
    start: { dateTime: enLima(ini), timeZone: 'America/Lima' },
    end: { dateTime: enLima(ini + HORA_MS), timeZone: 'America/Lima' },
  }
}
