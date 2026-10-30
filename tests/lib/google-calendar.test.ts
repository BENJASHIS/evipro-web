import { describe, it, expect, afterEach } from 'vitest'
import { calendarioDe, idEvento, hoyEnLima, fechasDesde, slotsOcupados, cuerpoEvento } from '../../lib/google-calendar'

const H = ['09:00', '10:00', '11:00', '15:00', '16:00']
const reserva = {
  id: '3f2b8c1e-0a4d-4e8f-9b7a-1c2d3e4f5a6b', doctor_slug: 'dr-jara',
  patient_name: 'Ana Prueba', modality: 'virtual', slot_date: '2026-11-03', slot_time: '09:00',
}

describe('calendarioDe', () => {
  afterEach(() => { delete process.env.GOOGLE_CALENDAR_ID; delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON })

  it('solo dr-jara y solo con las dos variables', () => {
    process.env.GOOGLE_CALENDAR_ID = 'carlos@example.com'
    expect(calendarioDe('dr-jara')).toBeNull()
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{}'
    expect(calendarioDe('dr-jara')).toBe('carlos@example.com')
    expect(calendarioDe('dr-vera')).toBeNull()
  })
})

it('idEvento quita los guiones', () => {
  expect(idEvento(reserva.id)).toBe('3f2b8c1e0a4d4e8f9b7a1c2d3e4f5a6b')
})

it('hoyEnLima usa UTC−5: las 02:00 UTC todavía son el día anterior en Lima', () => {
  expect(hoyEnLima(new Date('2026-11-04T02:00:00Z'))).toBe('2026-11-03')
})

it('fechasDesde cruza el fin de mes', () => {
  expect(fechasDesde('2026-10-30', 3)).toEqual(['2026-10-30', '2026-10-31', '2026-11-01'])
})

describe('slotsOcupados', () => {
  const f = ['2026-11-03']

  it('un evento que pisa en parte bloquea los turnos que toca', () => {
    const busy = [{ start: '2026-11-03T14:30:00Z', end: '2026-11-03T15:15:00Z' }] // 9:30–10:15 Lima
    expect(slotsOcupados(busy, f, H)).toEqual(['2026-11-03T09:00', '2026-11-03T10:00'])
  })

  it('un evento que termina justo al empezar el turno no lo bloquea', () => {
    const busy = [{ start: '2026-11-03T13:00:00Z', end: '2026-11-03T15:00:00Z' }] // 8:00–10:00 Lima
    expect(slotsOcupados(busy, f, H)).toEqual(['2026-11-03T09:00'])
  })

  it('sin eventos no hay ocupados', () => {
    expect(slotsOcupados([], f, H)).toEqual([])
  })
})

describe('cuerpoEvento', () => {
  it('lleva nombre, modalidad e id, en hora Lima, por una hora', () => {
    const e = cuerpoEvento(reserva, 'tentative')
    expect(e).toMatchObject({
      id: '3f2b8c1e0a4d4e8f9b7a1c2d3e4f5a6b', status: 'tentative',
      summary: 'EVIPro · Ana Prueba · virtual',
      start: { dateTime: '2026-11-03T09:00:00-05:00', timeZone: 'America/Lima' },
      end: { dateTime: '2026-11-03T10:00:00-05:00', timeZone: 'America/Lima' },
    })
    expect(String(e.description)).toContain(reserva.id)
  })

  it('nunca lleva la nota ni el teléfono', () => {
    const e = cuerpoEvento({ ...reserva, patient_note: 'dolor', patient_phone: '999' } as never, 'confirmed')
    expect(JSON.stringify(e)).not.toMatch(/dolor|999/)
  })
})
