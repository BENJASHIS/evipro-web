// Regen — Regulador de Entorno. Fuente de verdad ÚNICA de contenido + motor.
// Bienestar / autoconocimiento, NO clínico. Cero IA: determinista y auditable.
// ponytail: el copy final (preguntas, consejos, recursos de ayuda) lo aporta el
// usuario (roadmap 🙋). Este set es funcional y testeable; se afina sin tocar lógica.

export const REGEN_VERSION = '2026.07.13'

// Escala Likert 0..4. Redactamos TODA pregunta para que mayor valor = más desgaste.
// ponytail: sin reverse-scoring en v1; si se añaden preguntas "positivas", invertir aquí.
export const ESCALA = ['Nunca', 'Rara vez', 'A veces', 'A menudo', 'Siempre'] as const
export const VALOR_MIN = 0
export const VALOR_MAX = ESCALA.length - 1 // 4

// Umbrales de color sobre el score normalizado 0..100.
export const UMBRAL_AMARILLO = 34 // score >= 34 → amarillo
export const UMBRAL_ROJO = 67     // score >= 67 → rojo
// Nivel de respuesta a partir del cual una pregunta bandera roja dispara la red de seguridad.
export const RED_FLAG_NIVEL = 3   // "A menudo" o "Siempre"

export type AmbitoId = 'hogar' | 'trabajo' | 'familia' | 'social'
export type Color = 'verde' | 'amarillo' | 'rojo'

export interface Pregunta {
  id: string       // ej. 'hogar_1'
  texto: string
  redFlag?: boolean
}

export interface Ambito {
  id: AmbitoId
  nombre: string
  preguntas: Pregunta[]
}

export const AMBITOS: Ambito[] = [
  {
    id: 'hogar',
    nombre: 'Hogar',
    preguntas: [
      { id: 'hogar_1', texto: 'En casa me siento tenso/a o "pisando huevos".' },
      { id: 'hogar_2', texto: 'Las discusiones en casa terminan en gritos o silencios largos.' },
      { id: 'hogar_3', texto: 'Cuando llego a casa siento alivio de estar fuera de otras partes… pero no descanso.' },
      { id: 'hogar_4', texto: 'He sentido miedo de alguien con quien vivo.', redFlag: true },
    ],
  },
  {
    id: 'trabajo',
    nombre: 'Trabajo',
    preguntas: [
      { id: 'trabajo_1', texto: 'Termino la jornada agotado/a emocionalmente, no solo cansado/a.' },
      { id: 'trabajo_2', texto: 'Siento que me tratan con desprecio o me humillan.' },
      { id: 'trabajo_3', texto: 'Me cuesta desconectar del trabajo en mi tiempo libre.' },
      { id: 'trabajo_4', texto: 'He sufrido acoso, amenazas o maltrato en el trabajo.', redFlag: true },
    ],
  },
  {
    id: 'familia',
    nombre: 'Familia',
    preguntas: [
      { id: 'familia_1', texto: 'Las conversaciones con mi familia me dejan mal.' },
      { id: 'familia_2', texto: 'Siento que me controlan o me culpan por todo.' },
      { id: 'familia_3', texto: 'Evito a mi familia para no sentirme peor.' },
      { id: 'familia_4', texto: 'Alguien de mi familia me hace sentir en peligro.', redFlag: true },
    ],
  },
  {
    id: 'social',
    nombre: 'Círculo social',
    preguntas: [
      { id: 'social_1', texto: 'Con mis amistades me siento juzgado/a o menospreciado/a.' },
      { id: 'social_2', texto: 'Me siento solo/a incluso cuando estoy acompañado/a.' },
      { id: 'social_3', texto: 'Digo que sí a cosas que no quiero por miedo a que se molesten.' },
      { id: 'social_4', texto: 'Siento que nadie me apoyaría si lo necesitara de verdad.', redFlag: true },
    ],
  },
]

// Consejos fijos por color (amarillo/rojo). Verde no recibe consejos.
// ponytail: copy provisional con respaldo de evidencia; el usuario aporta el definitivo.
export const CONSEJOS: Record<AmbitoId, Record<'amarillo' | 'rojo', string[]>> = {
  hogar: {
    amarillo: [
      'Reserva un rato diario de calma en casa que sea solo tuyo, sin pantallas ni discusiones.',
      'Nombra en frío (no en plena pelea) lo que te tensa; pedir un cambio concreto ayuda más que reprochar.',
    ],
    rojo: [
      'Un hogar que te desgasta a diario pesa en tu salud: no es normal acostumbrarse.',
      'Busca un espacio seguro y una persona de confianza fuera de casa con quien hablarlo.',
    ],
  },
  trabajo: {
    amarillo: [
      'Marca límites de horario: define cuándo dejas de responder mensajes de trabajo.',
      'Registra por escrito los tratos que te afectan; tener datos ayuda si necesitas escalar.',
    ],
    rojo: [
      'El maltrato laboral no es "parte del trabajo"; tienes derecho a un entorno respetuoso.',
      'Documenta lo ocurrido y busca apoyo (RR.HH., un sindicato o asesoría legal laboral).',
    ],
  },
  familia: {
    amarillo: [
      'Elige cuánto y sobre qué temas te expones; puedes acortar conversaciones que te dañan.',
      'Refuerza vínculos que sí te nutren; no toda relación familiar tiene que pesar lo mismo.',
    ],
    rojo: [
      'Sentirte en control o culpa constante desgasta; poner distancia no es traición, es cuidarte.',
      'Apóyate en alguien de confianza fuera del núcleo familiar para ver la situación con perspectiva.',
    ],
  },
  social: {
    amarillo: [
      'Dedica más tiempo a las amistades donde puedes ser tú, y menos a las que te dejan vacío.',
      'Practicar decir "no" en cosas pequeñas hace más fácil sostener tus límites en las grandes.',
    ],
    rojo: [
      'Sentir que no tienes con quién contar es una señal seria, no un defecto tuyo.',
      'Da un primer paso pequeño: retomar un contacto sano o sumarte a un grupo o actividad.',
    ],
  },
}

// Recursos de ayuda para la pantalla de seguridad (banderas rojas).
// Líneas oficiales de Perú verificadas por el equipo clínico (Carlos, 2026-07-13).
export const RECURSOS_AYUDA: { nombre: string; contacto: string; detalle: string }[] = [
  {
    nombre: 'Línea 113 (opción 5) — Infosalud, MINSA',
    contacto: '113',
    detalle: 'Orientación en salud mental. Gratuita, 24 horas, desde cualquier operador.',
  },
  {
    nombre: 'Instituto Nacional de Salud Mental',
    contacto: '0800-00-068',
    detalle: 'Línea gratuita nacional de salud mental.',
  },
  {
    nombre: 'Línea 100 — Violencia familiar y sexual, MIMP',
    contacto: '100',
    detalle: 'Gratuita, 24 horas.',
  },
  {
    nombre: 'Emergencias médicas — SAMU',
    contacto: '106',
    detalle: 'Central de emergencias médicas. Gratuita, 24 horas.',
  },
  {
    nombre: 'WhatsApp Infosalud (MINSA)',
    contacto: '955 557 000 · 952 842 623',
    detalle: 'Orientación por chat con el Ministerio de Salud.',
  },
  {
    nombre: 'Chat 100 (MIMP) por WhatsApp',
    contacto: '(01) 743 8800',
    detalle: 'Apoyo ante situaciones de violencia.',
  },
]

export interface Respuesta {
  preguntaId: string
  valor: number // 0..4
}

export interface Resultado {
  scores: Record<AmbitoId, number>
  colores: Record<AmbitoId, Color>
  redFlags: string[]        // ids de preguntas bandera roja en nivel de riesgo
  safetyTriggered: boolean
  consejos: Record<AmbitoId, string[]>
}

export function colorFor(score: number): Color {
  if (score >= UMBRAL_ROJO) return 'rojo'
  if (score >= UMBRAL_AMARILLO) return 'amarillo'
  return 'verde'
}

// Score 0..100: suma de respuestas del ámbito sobre el máximo posible.
export function scoreAmbito(ambito: Ambito, valores: Record<string, number>): number {
  const suma = ambito.preguntas.reduce((acc, p) => acc + (valores[p.id] ?? 0), 0)
  const max = ambito.preguntas.length * VALOR_MAX
  return max === 0 ? 0 : Math.round((100 * suma) / max)
}

export function evaluate(respuestas: Respuesta[]): Resultado {
  const valores: Record<string, number> = {}
  for (const r of respuestas) valores[r.preguntaId] = r.valor

  const scores = {} as Record<AmbitoId, number>
  const colores = {} as Record<AmbitoId, Color>
  const consejos = {} as Record<AmbitoId, string[]>
  const redFlags: string[] = []

  for (const a of AMBITOS) {
    const score = scoreAmbito(a, valores)
    const color = colorFor(score)
    scores[a.id] = score
    colores[a.id] = color
    consejos[a.id] = color === 'verde' ? [] : CONSEJOS[a.id][color]
    for (const p of a.preguntas) {
      if (p.redFlag && (valores[p.id] ?? 0) >= RED_FLAG_NIVEL) redFlags.push(p.id)
    }
  }

  return { scores, colores, redFlags, safetyTriggered: redFlags.length > 0, consejos }
}

// Frontera de confianza: valida la forma cruda que llega del cliente antes de puntuar.
// Exige responder cada pregunta del instrumento exactamente una vez, con valor entero 0..4.
export function parseRespuestas(
  raw: unknown,
): { ok: true; respuestas: Respuesta[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) return { ok: false, error: 'Formato inválido' }

  const idsValidos = new Set(AMBITOS.flatMap(a => a.preguntas.map(p => p.id)))
  const vistos = new Set<string>()
  const respuestas: Respuesta[] = []

  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return { ok: false, error: 'Respuesta inválida' }
    const { preguntaId, valor } = item as { preguntaId?: unknown; valor?: unknown }
    if (typeof preguntaId !== 'string' || !idsValidos.has(preguntaId)) {
      return { ok: false, error: 'Pregunta desconocida' }
    }
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < VALOR_MIN || valor > VALOR_MAX) {
      return { ok: false, error: 'Valor fuera de rango' }
    }
    if (vistos.has(preguntaId)) return { ok: false, error: 'Pregunta repetida' }
    vistos.add(preguntaId)
    respuestas.push({ preguntaId, valor })
  }

  if (vistos.size !== idsValidos.size) return { ok: false, error: 'Faltan preguntas por responder' }
  return { ok: true, respuestas }
}
