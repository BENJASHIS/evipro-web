import type { DoctorCounseling } from '@/lib/counseling'

export type LanguageLevel = 'Nativo' | 'Avanzado' | 'Intermedio' | 'Básico'

export interface Language {
  name: string
  level: LanguageLevel
}

export interface Formation {
  title: string
  institution: string
  year?: number
}

export interface Doctor {
  slug: string
  name: string
  cmp: string
  rna?: string
  specialties: string[]
  bio: string
  formation: Formation[]
  languages: Language[]
  location: string
  modality: string
  plans: string[]
  availability: string
  whatsapp: string
  photo: string
  counseling?: DoctorCounseling
}

export const DOCTORS: Doctor[] = [
  {
    slug: 'dr-jara',
    name: 'Dr. José Carlos Benjamín Jara Ovalle',
    cmp: '82817',
    rna: 'A10684',
    specialties: ['Cannabis Medicinal', 'Medicina de Altura', 'Salud Mental'],
    // No dice "médico especialista": el CMP reserva ese título para quien consta
    // en el Registro Nacional de Especialistas (mismo motivo por el que se quitó
    // "Especialista en Cannabinología" de la portada, 2026-07-31).
    bio: 'Médico cirujano con formación en uso medicinal del cannabis por la Universidad Peruana Cayetano Heredia y auditoría médica por la UNSAAC. Atiende en Cusco desde 2023 con enfoque basado en evidencia, integrando la realidad andina y el contexto peruano en cada consulta. Médico auditor y asesor de la Asociación de Cannabis Medicinal del Cusco desde 2021, y médico deportivo del Club Cienciano (división reserva) entre 2023 y 2024.',
    formation: [
      // Sin la universidad de origen (decisión de Carlos). Y no dice
      // "convalidación": lo que otorga el CMP es la COLEGIATURA. Revalidar o
      // reconocer un título extranjero es de SUNEDU o de una universidad
      // peruana autorizada, no del Colegio.
      { title: 'Médico Cirujano', institution: 'Colegiatura · Colegio Médico del Perú' },
      { title: 'Especialización en Uso Medicinal del Cannabis', institution: 'UPCH Cayetano Heredia' },
      { title: 'Diplomado en Auditoría Médica', institution: 'UNSAAC' },
      { title: 'Diplomado en Salud Mental y Psiquiatría', institution: 'UNSAAC · Facultad de Medicina Humana', year: 2026 },
      { title: 'Seminario de Endomedicina · Cannabis y terapias complementarias', institution: 'U. de Antioquia y U. del Cauca, Colombia', year: 2019 },
      { title: 'Inteligencia Artificial en Salud · nivel intermedio', institution: 'INSN San Borja', year: 2025 },
    ],
    languages: [
      { name: 'Español', level: 'Nativo' },
      { name: 'Inglés', level: 'Básico' },
      { name: 'Quechua', level: 'Básico' },
    ],
    location: 'Cusco, Perú',
    modality: 'Teleconsulta y presencial',
    plans: ['Membresía Básica', 'Membresía EVIPro', 'Plan Turista Inicio', 'Plan Turista Plus'],
    availability: 'Lun–Vie · 9am–6pm',
    whatsapp: '51942185939',
    photo: '/images/medicos/dr-jara.jpeg',
    counseling: {
      // ponytail: este canal se retiró del producto (decisión 2026-07-30) — uno de S/5
      // invita preguntas que exigen consulta médica. Se apaga el flag, no se borra la máquina
      // de reservas; volver a true si alguna vez se reactiva.
      available: false,
      description: 'Orientación sobre cannabis medicinal, preparación para consulta, dudas sobre medicina de altura y síntomas de salud mental.',
      modalities: ['video', 'whatsapp'],
      schedule: ['09:00','10:00','11:00','14:00','15:00','17:00'],
    },
  },
  {
    slug: 'dr-vera',
    name: 'Dr. Shinvert Enmanuel Vera Sanchez',
    cmp: '099649',
    specialties: ['Gerontología', 'Cuidados Paliativos', 'Diabetes y Metabólico', 'Telemedicina'],
    bio: 'Médico con más de ocho años de experiencia clínica y directiva en Bolivia y Perú, especializado en la atención integral del adulto mayor, cuidados paliativos y enfermedades crónicas no transmisibles. Gerontólogo y paliativista con maestrías en diabetes y cuidados paliativos, y diplomado en gestión de telemedicina. Su enfoque holístico y humanizado acompaña al paciente y su familia en todas las etapas del proceso de atención.',
    formation: [
      { title: 'Médico Cirujano', institution: 'Univ. de Aquino Bolivia', year: 2017 },
      { title: 'Especialidad Gerontología', institution: 'UMSS Cochabamba', year: 2022 },
      { title: 'Master Cuidados Paliativos', institution: 'U. Cardenal Herrera', year: 2022 },
      { title: 'Master Diabetes y Trastornos Metabólicos', institution: 'U. Cardenal Herrera', year: 2025 },
      { title: 'Diplomado Gestión de Telemedicina', institution: 'ENSP Perú', year: 2025 },
    ],
    languages: [
      { name: 'Español', level: 'Nativo' },
      { name: 'Quechua', level: 'Intermedio' },
      { name: 'Inglés', level: 'Básico' },
    ],
    location: 'Abancay, Apurímac',
    modality: 'Virtual',
    // Su atención es el módulo de especialista que se suma a EVIPro (migración 025).
    plans: ['Módulo de especialista sobre Membresía EVIPro'],
    availability: 'Lun–Vie · 9am–6pm',
    whatsapp: '51942185939',
    photo: '/images/medicos/dr-vera.jpeg',
    counseling: {
      available: false,
      // Texto inerte mientras `available` sea false; se deja el canal, no la oferta.
      description: 'Orientación para adulto mayor, cuidados paliativos, diabetes y enfermedades crónicas, y para familias y cuidadores.',
      modalities: ['video', 'whatsapp'],
      schedule: ['09:00','10:00','11:00','14:00','15:00','17:00'],
    },
  },
]
