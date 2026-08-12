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
      'Cuando lo de siempre ya no alcanza. Es donde hay más respaldo, y aun así ' +
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
    titulo: 'Epilepsia: solo síndromes concretos',
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
    'consulta y, si no corresponde, no se prescribe: se busca otra cosa. Preferimos ' +
    'no recetarte nada antes que recetarte algo que no te va a servir.',
}

export type EvidenciaPublica = {
  titulo: string
  resumen: string
  fuente: string
  url: string
}

export const EVIDENCIA_PUBLICA: EvidenciaPublica[] = [
  {
    titulo: 'Dolor crónico y neuropático',
    resumen:
      'La evidencia sugiere beneficios pequeños y de corto plazo en algunos pacientes, ' +
      'sobre todo dolor neuropático. También se vigilan mareo, sedación, náuseas e interacciones.',
    fuente: 'AHRQ 2024 · ACP 2025',
    url: 'https://effectivehealthcare.ahrq.gov/products/plant-based-chronic-pain-treatment/living-review',
  },
  {
    titulo: 'Espasticidad y náuseas por quimioterapia',
    resumen:
      'Las guías separan indicaciones acotadas: espasticidad por esclerosis múltiple y náuseas ' +
      'persistentes por quimioterapia cuando el manejo habitual no alcanza.',
    fuente: 'NICE NG144',
    url: 'https://www.nice.org.uk/guidance/ng144/chapter/Recommendations',
  },
  {
    titulo: 'Epilepsia',
    resumen:
      'El CBD farmacéutico se limita a síndromes concretos como Dravet, Lennox-Gastaut y complejo ' +
      'esclerosis tuberosa. No se presenta como tratamiento general para cualquier epilepsia.',
    fuente: 'FDA · NICE NG144',
    url: 'https://www.fda.gov/consumers/consumer-updates/what-you-need-know-and-what-were-working-find-out-about-products-containing-cannabis-or-cannabis',
  },
  {
    titulo: 'Acceso legal en Perú',
    resumen:
      'El procedimiento formal exige evaluación médica, receta cuando corresponde, registro RENPUC ' +
      'y dispensación por establecimiento farmacéutico autorizado. EVIPro no vende cannabis.',
    fuente: 'DIGEMID · Perú',
    url: 'https://www.digemid.minsa.gob.pe/webDigemid/uso-medicinal-del-cannabis-y-sus-derivados/',
  },
]

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
    r: 'En una farmacia autorizada. EVIPro no vende, almacena ni dispensa productos de cannabis.',
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
    texto: 'Presencial o virtual. Solo nombre y teléfono, no hace falta crear cuenta.',
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
      '(la oficial del MINSA, por triplicado) si llega o pasa el 1%. Sales sabiendo qué ' +
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
  // Sin «Dr.» a propósito (Carlos, 2026-07-31): en «Quién te atiende» el título
  // ya lo dan las credenciales de abajo (CMP), y el nombre a secas se lee como
  // una presentación, no como un cargo. En el resto de la web sí va con Dr.
  nombre: 'Carlos Jara',
  // Sin «Especialista» a propósito (2026-07-31): el CMP reserva ese título para
  // quien está inscrito en el Registro Nacional de Especialistas. Describir el
  // área de práctica dice lo mismo sin arrogarse un título que no consta.
  especialidades: 'Médico Cirujano · Cannabis medicinal y medicina de altura',
  credenciales: 'CMP 82817 · RNA A10684',
  direccion: 'Av. Infancia 410, Consultorio 2 · Wanchaq, Cusco',
}

export const MEMBRESIA = {
  titulo: '¿Vas a venir más de una vez?',
  texto: 'La membresía EVIPro abarata cada consulta y te da seguimiento entre visitas',
  cta: 'Ver planes',
}

/** Lo que ve alguien en Google ANTES de hacer clic — o sea, la primera línea de
 *  verdad, antes que el hero. El layout traía «EVIPro — Medicina Integral y
 *  Cannabis Medicinal» y «Plataforma de membresías médicas»: las dos cosas que
 *  esta portada existe para dejar de decir. Nadie teclea «medicina integral», y
 *  liderar con «membresías» pone el precio delante de la pregunta «¿esto es para
 *  mí?».
 *
 *  El título lidera con lo que la gente sí teclea, añade la ciudad (búsqueda
 *  local que se puede ganar) y mete «con receta médica» dentro del propio
 *  resultado de búsqueda, para desactivar la duda número uno antes del clic.
 *  La marca va delante para que la pestaña del navegador diga quién eres aun
 *  truncada; el resto del título sigue cargando la búsqueda.
 *  Longitudes pensadas para no ser truncadas: ~55 y ~155 caracteres. */
export const META_PORTADA = {
  titulo: 'EVIPro · Cannabis medicinal en Cusco, con receta médica',
  descripcion:
    'Tratamiento con cannabis medicinal para dolor crónico y neuropático, ' +
    'migraña y espasticidad. Con receta y seguimiento. Dr. Carlos Jara, ' +
    'CMP 82817 · Cusco.',
}
