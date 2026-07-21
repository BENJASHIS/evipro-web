import { DOCTORS } from './doctors'

// Topes de longitud para los formularios públicos de reserva (frontera de confianza).
export const NAME_MAX = 120
export const PHONE_MAX = 20
export const NOTE_MAX = 1000

/** Valida el input de los endpoints públicos de reserva (`/api/reservar/book`,
 *  `/api/consejeria/book`). Devuelve un mensaje de error si algo no cumple, o
 *  null si está OK. La modalidad se valida aparte en cada ruta (sets distintos). */
export function validateBookingInput(input: {
  doctor_slug?: string
  patient_name?: string
  patient_phone?: string
  patient_note?: string | null
}): string | null {
  const { doctor_slug, patient_name, patient_phone, patient_note } = input
  if (!doctor_slug || !DOCTORS.some(d => d.slug === doctor_slug)) return 'Médico no encontrado'
  if (!patient_name?.trim() || patient_name.length > NAME_MAX) return 'Nombre inválido'
  if (!patient_phone?.trim() || patient_phone.length > PHONE_MAX) return 'Teléfono inválido'
  if (patient_note != null && patient_note.length > NOTE_MAX) return 'Nota demasiado larga'
  return null
}
