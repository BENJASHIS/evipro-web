import { REGLA_CANCELACION } from '@/lib/bookings'

/**
 * WhatsApp que Carlos envía al confirmar un pago: turno, regla de cancelación (por escrito) y DNI,
 * que no se pide en la web y se anota en la app del consultorio.
 */
// ponytail: «Dr. Jara» fijo porque solo él cobra al reservar; pasar el nombre si se habilita otro médico.
export function mensajeConfirmacion(r: { patient_name: string; slot_date: string; slot_time: string; modality: string }): string {
  return `Hola ${r.patient_name}, tu cita con el Dr. Jara quedó confirmada: ${r.slot_date} a las ${r.slot_time.slice(0, 5)} (${r.modality}).\n` +
    `Regla de cancelación: ${REGLA_CANCELACION}\n` +
    'Para tu historia clínica, ¿me envías tu DNI?'
}
