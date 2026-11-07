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

/**
 * WhatsApp para que el paciente retome el pago si cerró la página o perdió los QR: su enlace
 * reabre la pantalla de pago con el tiempo que le queda.
 */
export function mensajeEnlacePago(
  r: { id: string; doctor_slug: string; patient_name: string; slot_date: string | null; slot_time: string | null; pago_hasta: string },
  sitio: string,
): string {
  const hasta = new Date(r.pago_hasta).toLocaleTimeString('es-PE', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima',
  })
  const turno = r.slot_date && r.slot_time ? ` del ${r.slot_date} a las ${r.slot_time.slice(0, 5)}` : ''
  return `Hola ${r.patient_name}, tu turno${turno} está apartado hasta las ${hasta}. ` +
    `Para pagar con Yape o Plin entra aquí: ${sitio}/medicos/${r.doctor_slug}/agendar?reserva=${r.id}`
}

