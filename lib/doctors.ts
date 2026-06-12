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
    bio: 'Médico especialista en Cannabis Medicinal y Medicina de Altura, con formación en la Universidad Peruana Cayetano Heredia y auditoría médica en la UNSAAC. Atiende desde Cusco con enfoque basado en evidencia científica, integrando la realidad andina y el contexto peruano en cada consulta. Pionero en telemedicina médica cannábica en la región.',
    formation: [
      { title: 'Especialización', institution: 'UPCH Cayetano Heredia' },
      { title: 'Auditoría Médica', institution: 'UNSAAC' },
    ],
    languages: [
      { name: 'Español', level: 'Nativo' },
      { name: 'Inglés', level: 'Intermedio' },
      { name: 'Quechua', level: 'Básico' },
    ],
    location: 'Cusco, Perú',
    modality: 'Teleconsulta y presencial',
    plans: ['Plan Express', 'Plan Cannabis', 'Plan Integral', 'Plan Turista Inicio', 'Plan Turista Plus'],
    availability: 'Lun–Vie · 9am–6pm',
    whatsapp: '51942185939',
    photo: '/images/medicos/dr-jara.jpeg',
    counseling: {
      available: true,
      description: 'Orientación sobre cannabis medicinal, preparación para consulta, dudas sobre medicina de altura y síntomas de salud mental.',
      modalities: ['video', 'messaging', 'whatsapp'],
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
    plans: ['Plan Express', 'Plan Integral', 'Plan Turista Inicio', 'Plan Turista Plus'],
    availability: 'Lun–Vie · 9am–6pm',
    whatsapp: '51942185939',
    photo: '/images/medicos/dr-vera.jpeg',
    counseling: {
      available: true,
      description: 'Consejería para adulto mayor, cuidados paliativos, diabetes y enfermedades crónicas. Orientación para familias y cuidadores.',
      modalities: ['video', 'messaging', 'whatsapp'],
      schedule: ['09:00','10:00','11:00','14:00','15:00','17:00'],
    },
  },
]
