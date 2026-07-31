/** Todo el texto de la portada, en un solo sitio.
 *
 *  Dos reglas que los tests vigilan y que NO se pueden relajar aquí:
 *  1. Solo se anuncian indicaciones presentes en
 *     core/cannabinoide_indicaciones.py::INDICACIONES_AUTORIZADAS. Ansiedad e
 *     insomnio están fuera a propósito (evidence_strength "very_low"): aparecen
 *     como límite en PARA_QUE_NO, nunca como oferta.
 *  2. Ningún precio literal. Los que la página muestra salen de
 *     lib/consulta-pricing.ts y de la tabla membership_plans.
 */

export const RENPUC_NOMBRE =
  'Registro Nacional de Pacientes Usuarios del Cannabis y sus Derivados para Uso Medicinal y Terapéutico'

// 🙋 Carlos: confirmar cuál de los dos números va en el hero antes de desplegar.
export const WHATSAPP = '942185939'

export const HERO = {
  etiqueta: 'Cusco · Perú',
  titulo: 'El cannabis no sirve',
  titulo2: 'para todo. Para esto sí.',
  subtitulo:
    'Dolor crónico y neuropático · migraña · espasticidad · náuseas por quimioterapia. ' +
    'Con receta, médico colegiado y seguimiento.',
  credenciales: 'Dr. Carlos Jara · Médico Cirujano · CMP 82817 · RNA A10684',
}

export type Indicacion = { titulo: string; matiz: string; anchoCompleto?: boolean }

export const INDICACIONES_PORTADA: Indicacion[] = [
  {
    titulo: 'Dolor crónico y neuropático',
    matiz:
      'Cuando lo de siempre ya no alcanza. Es donde hay más respaldo — y aun así ' +
      'el efecto es moderado: te lo diremos en consulta.',
  },
  {
    titulo: 'Migraña',
    matiz: 'Evidencia reciente y prometedora. No es primera línea.',
  },
  {
    titulo: 'Espasticidad · esclerosis múltiple',
    matiz: 'Indicación reconocida internacionalmente.',
  },
  {
    titulo: 'Náuseas por quimioterapia',
    matiz: 'Cuando lo habitual no controla. Segunda línea.',
  },
  {
    titulo: 'Epilepsia — solo síndromes concretos',
    matiz:
      'Dravet, Lennox-Gastaut y complejo esclerosis tuberosa. Si tu epilepsia no es ' +
      'una de esas, el cannabis no es tu tratamiento y te lo diremos.',
    anchoCompleto: true,
  },
]

export const PARA_QUE_NO = {
  titulo: '¿Vienes por ansiedad o insomnio?',
  texto:
    'Te lo decimos claro: ahí la evidencia del cannabis es muy baja. Se evalúa en ' +
    'consulta y, si no corresponde, no se prescribe — se busca otra cosa. Preferimos ' +
    'no recetarte nada antes que recetarte algo que no te va a servir.',
}

export type Pregunta = { p: string; r: string }

export const PREGUNTAS: Pregunta[] = [
  {
    p: '¿Es legal?',
    r: 'Sí. Ley 30681 y D.S. 004-2023-SA. Siempre con receta médica.',
  },
  {
    p: '¿Me va a drogar?',
    r: 'La mayoría de los tratamientos son de CBD, que no produce ese efecto.',
  },
  {
    p: '¿Puedo manejar?',
    r: 'Si tu fórmula lleva THC, no. Va escrito en tu receta.',
  },
  {
    p: '¿Dónde lo compro?',
    r: 'En cualquier farmacia autorizada. No vendemos el producto.',
  },
  {
    p: '¿Qué es el RENPUC?',
    r: `El ${RENPUC_NOMBRE}. Es el padrón oficial: sin estar inscrito no puedes acceder al tratamiento.`,
  },
]

export type Paso = { n: number; titulo: string; texto: string }

export const PASOS_PRIMERA_CONSULTA: Paso[] = [
  {
    n: 1,
    titulo: 'Agendas',
    texto: 'Presencial o virtual. Solo nombre y teléfono — no hace falta crear cuenta.',
  },
  {
    n: 2,
    titulo: 'Te evalúan',
    texto: 'Historia clínica, tu medicación actual y las interacciones que pueda tener.',
  },
  {
    n: 3,
    titulo: 'Tu receta, del tipo que corresponda',
    texto:
      'Receta magistral simple si tu fórmula lleva menos de 1% de THC. Receta especial ' +
      '—la oficial del MINSA, por triplicado— si llega o pasa el 1%. Sales sabiendo qué ' +
      'tomas, cuánto y a quién llamar.',
  },
  {
    n: 4,
    titulo: 'Te registramos en el RENPUC',
    texto:
      'El RENPUC es el registro que la ley exige para acceder al tratamiento. ' +
      'El trámite lo hacemos nosotros.',
  },
]

export const OTRAS_ESPECIALIDADES = [
  'Medicina de altura',
  'Gerontología',
  'Cuidados paliativos',
  'Salud mental',
  'Diabetes y metabólico',
]

export const ESPECIALIDADES_PROXIMAS = ['Cardiología', 'Pruebas de esfuerzo']

export const MEDICO = {
  nombre: 'Dr. Carlos Jara',
  especialidades: 'Médico Cirujano · Especialista en Cannabinología · Medicina de Altura',
  credenciales: 'CMP 82817 · RNA A10684',
  direccion: 'Av. Infancia 410, Consultorio 2 · Wanchaq, Cusco',
}

export const MEMBRESIA = {
  titulo: '¿Vas a venir más de una vez?',
  texto: 'La membresía EVIPro abarata cada consulta y te da seguimiento entre visitas',
  cta: 'Ver planes',
}
