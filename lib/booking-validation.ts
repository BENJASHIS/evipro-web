import { DOCTORS, type Doctor } from './doctors'

// Topes de longitud para los formularios públicos de reserva (frontera de confianza).
export const NAME_MAX = 120
export const PHONE_MAX = 20
export const NOTE_MAX = 1000

/** Días (0=domingo … 6=sábado) y horas que el médico ofrece en la reserva web. */
export function agendaDe(doctor: Pick<Doctor, 'counseling'>): { days: number[]; schedule: string[] } {
  return {
    days: doctor.counseling?.days ?? [1, 2, 3, 4, 5],
    schedule: doctor.counseling?.schedule ?? ['09:00', '10:00', '11:00', '14:00', '15:00', '17:00'],
  }
}

/** Los próximos `count` días de atención, empezando mañana. */
export function proximosDias(days: number[], count: number, desde: Date = new Date()): Date[] {
  const out: Date[] = []
  const d = new Date(desde)
  d.setHours(0, 0, 0, 0)
  while (out.length < count) {
    d.setDate(d.getDate() + 1)
    if (days.includes(d.getDay())) out.push(new Date(d))
  }
  return out
}

// slot_date es la fecha en hora Perú (YYYY-MM-DD): el día de la semana se lee a mediodía UTC,
// así no depende de la zona horaria del servidor.
function slotValido(doctor: Doctor, slot_date: string | null | undefined, slot_time: string | null | undefined): boolean {
  if (!slot_date || !slot_time || !/^\d{4}-\d{2}-\d{2}$/.test(slot_date)) return false
  const { days, schedule } = agendaDe(doctor)
  return days.includes(new Date(`${slot_date}T12:00:00Z`).getUTCDay()) && schedule.includes(slot_time)
}

/** Valida el input de los endpoints públicos de reserva (`/api/reservar/book`,
 *  `/api/consejeria/book`). Devuelve un mensaje de error si algo no cumple, o
 *  null si está OK. La modalidad se valida aparte en cada ruta (sets distintos). */
export function validateBookingInput(input: {
  doctor_slug?: string
  patient_name?: string
  patient_phone?: string
  patient_note?: string | null
  slot_date?: string | null
  slot_time?: string | null
}): string | null {
  const { doctor_slug, patient_name, patient_phone, patient_note, slot_date, slot_time } = input
  const doctor = DOCTORS.find(d => d.slug === doctor_slug)
  if (!doctor_slug || !doctor) return 'Médico no encontrado'
  if (!patient_name?.trim() || patient_name.length > NAME_MAX) return 'Nombre inválido'
  if (!patient_phone?.trim() || patient_phone.length > PHONE_MAX) return 'Teléfono inválido'
  if (patient_note != null && patient_note.length > NOTE_MAX) return 'Nota demasiado larga'
  // Sin horario es válido (p. ej. a domicilio); si viene, debe caer en la agenda del médico.
  if ((slot_date || slot_time) && !slotValido(doctor, slot_date, slot_time)) return 'Horario no disponible'
  return null
}
