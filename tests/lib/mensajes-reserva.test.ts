import { it, expect } from 'vitest'
import { mensajeConfirmacion } from '../../lib/mensajes-reserva'

it('mensajeConfirmacion lleva el turno, la regla de cancelación y la petición del DNI', () => {
  expect(mensajeConfirmacion({ patient_name: 'Ana', slot_date: '2026-11-03', slot_time: '09:00:00', modality: 'virtual' })).toBe(
    'Hola Ana, tu cita con el Dr. Jara quedó confirmada: 2026-11-03 a las 09:00 (virtual).\n' +
    'Regla de cancelación: Puedes cancelar o cambiar la fecha hasta 24 h antes; con menos de 24 h, solo cambiar la fecha una vez.\n' +
    'Para tu historia clínica, ¿me envías tu DNI?')
})
