import { it, expect } from 'vitest'
import { mensajeConfirmacion, mensajeEnlacePago } from '../../lib/mensajes-reserva'

it('mensajeConfirmacion lleva el turno, la regla de cancelación y la petición del DNI', () => {
  expect(mensajeConfirmacion({ patient_name: 'Ana', slot_date: '2026-11-03', slot_time: '09:00:00', modality: 'virtual' })).toBe(
    'Hola Ana, tu cita con el Dr. Jara quedó confirmada: 2026-11-03 a las 09:00 (virtual).\n' +
    'Regla de cancelación: Puedes cancelar o cambiar la fecha hasta 24 h antes; con menos de 24 h, solo cambiar la fecha una vez.\n' +
    'Para tu historia clínica, ¿me envías tu DNI?')
})

it('mensajeEnlacePago da el plazo en hora de Lima y el enlace que reabre los QR', () => {
  expect(mensajeEnlacePago({
    id: 'b1', doctor_slug: 'dr-jara', patient_name: 'Ana', slot_date: '2026-11-10', slot_time: '09:00:00',
    pago_hasta: '2026-11-07T12:30:00Z',
  }, 'https://www.evipro.pe')).toBe(
    'Hola Ana, tu turno del 2026-11-10 a las 09:00 está apartado hasta las 07:30. ' +
    'Para pagar con Yape o Plin entra aquí: https://www.evipro.pe/medicos/dr-jara/agendar?reserva=b1')
})
