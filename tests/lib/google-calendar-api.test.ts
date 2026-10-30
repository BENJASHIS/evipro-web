import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { generateKeyPairSync } from 'node:crypto'

type Modulo = typeof import('../../lib/google-calendar')

const H = ['09:00', '10:00', '11:00', '15:00', '16:00']
const CAL = 'carlos@example.com'
const reserva = {
  id: '3f2b8c1e-0a4d-4e8f-9b7a-1c2d3e4f5a6b', doctor_slug: 'dr-jara',
  patient_name: 'Ana Prueba', modality: 'virtual', slot_date: '2026-11-03', slot_time: '09:00',
}
const pem = generateKeyPairSync('rsa', { modulusLength: 2048 })
  .privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()

const respuesta = (status: number, cuerpo: unknown = {}) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } })

// Responde al token siempre; lo demás, en el orden que pida cada prueba.
let siguientes: Array<() => Response>
const fetchFalso = vi.fn<(url: string | URL, init?: RequestInit) => Promise<Response>>(async url => {
  if (String(url).startsWith('https://oauth2.googleapis.com/token')) {
    return respuesta(200, { access_token: 'tok', expires_in: 3600 })
  }
  const r = siguientes.shift()
  if (!r) throw new Error(`llamada inesperada a ${url}`)
  return r()
})
const llamadasA = (parte: string) => fetchFalso.mock.calls.filter(([u]) => String(u).includes(parte))
const cuerpoDe = (llamada: unknown[]) => JSON.parse(String((llamada[1] as RequestInit).body))

let m: Modulo

beforeEach(async () => {
  vi.resetModules()
  fetchFalso.mockClear()
  siguientes = []
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({ client_email: 'web@p.iam.gserviceaccount.com', private_key: pem })
  process.env.GOOGLE_CALENDAR_ID = CAL
  vi.stubGlobal('fetch', fetchFalso)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  m = await import('../../lib/google-calendar')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  delete process.env.GOOGLE_CALENDAR_ID
})

const ocupado9 = () => respuesta(200, { calendars: { [CAL]: { busy: [{ start: '2026-11-03T14:00:00Z', end: '2026-11-03T15:00:00Z' }] } } })

describe('ocupadosEnGoogle', () => {
  it('sin variables no llama a fetch', async () => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    expect(await m.ocupadosEnGoogle('dr-jara', ['2026-11-03'], H)).toEqual([])
    await m.crearEventoTentativo(reserva)
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('pide el token una sola vez y lo reutiliza', async () => {
    siguientes = [ocupado9, ocupado9]
    await m.ocupadosEnGoogle('dr-jara', ['2026-11-03'], H)
    await m.ocupadosEnGoogle('dr-jara', ['2026-11-03'], H)
    const tokens = llamadasA('oauth2.googleapis.com/token')
    expect(tokens).toHaveLength(1)
    expect(String((tokens[0][1] as RequestInit).body)).toContain('grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer')
  })

  it('freeBusy consulta el calendario en hora Lima y convierte a turnos', async () => {
    siguientes = [ocupado9]
    expect(await m.ocupadosEnGoogle('dr-jara', ['2026-11-03'], H)).toEqual(['2026-11-03T09:00'])
    const cuerpo = cuerpoDe(llamadasA('/freeBusy')[0])
    expect(cuerpo).toMatchObject({ timeZone: 'America/Lima', items: [{ id: CAL }], timeMin: '2026-11-03T00:00:00-05:00' })
  })

  it('calendario no compartido (errors en la respuesta) → [] sin lanzar', async () => {
    siguientes = [() => respuesta(200, { calendars: { [CAL]: { busy: [], errors: [{ reason: 'notFound' }] } } })]
    expect(await m.ocupadosEnGoogle('dr-jara', ['2026-11-03'], H)).toEqual([])
    expect(console.error).toHaveBeenCalled()
  })

  it('Google caído (fetch rechaza) → [] sin lanzar', async () => {
    siguientes = [() => { throw new Error('red') }]
    expect(await m.ocupadosEnGoogle('dr-jara', ['2026-11-03'], H)).toEqual([])
  })

  it('JSON de la cuenta de servicio inválido → [] sin lanzar y sin fetch', async () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = 'no-json'
    expect(await m.ocupadosEnGoogle('dr-jara', ['2026-11-03'], H)).toEqual([])
    expect(fetchFalso).not.toHaveBeenCalled()
  })
})

describe('eventos', () => {
  it('crearEventoTentativo inserta con status tentative y el id derivado', async () => {
    siguientes = [() => respuesta(200, {})]
    await m.crearEventoTentativo(reserva)
    const [llamada] = llamadasA('/events')
    expect(String(llamada[0])).toBe(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL)}/events`)
    expect((llamada[1] as RequestInit).method).toBe('POST')
    expect(cuerpoDe(llamada)).toMatchObject({ id: m.idEvento(reserva.id), status: 'tentative' })
  })

  it('crearEventoTentativo sin turno no llama a Google', async () => {
    await m.crearEventoTentativo({ ...reserva, slot_date: null, slot_time: null })
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('crearEventoTentativo con error de Google no lanza', async () => {
    siguientes = [() => respuesta(500)]
    await expect(m.crearEventoTentativo(reserva)).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalled()
  })

  it('confirmarEvento hace PATCH a confirmed', async () => {
    siguientes = [() => respuesta(200, {})]
    await m.confirmarEvento(reserva)
    const [llamada] = llamadasA('/events')
    expect(String(llamada[0])).toMatch(new RegExp(`/events/${m.idEvento(reserva.id)}$`))
    expect((llamada[1] as RequestInit).method).toBe('PATCH')
    expect(cuerpoDe(llamada)).toEqual({ status: 'confirmed' })
  })

  it('confirmarEvento con 404 crea el evento ya confirmado', async () => {
    siguientes = [() => respuesta(404), () => respuesta(200, {})]
    await m.confirmarEvento(reserva)
    const [patch, post] = llamadasA('/events')
    expect((patch[1] as RequestInit).method).toBe('PATCH')
    expect((post[1] as RequestInit).method).toBe('POST')
    expect(cuerpoDe(post)).toMatchObject({ id: m.idEvento(reserva.id), status: 'confirmed' })
  })

  it('cancelarEvento hace PATCH a cancelled e ignora 410', async () => {
    siguientes = [() => respuesta(410)]
    await expect(m.cancelarEvento({ id: reserva.id, doctor_slug: 'dr-jara' })).resolves.toBeUndefined()
    expect(cuerpoDe(llamadasA('/events')[0])).toEqual({ status: 'cancelled' })
    expect(console.error).not.toHaveBeenCalled()
  })
})
