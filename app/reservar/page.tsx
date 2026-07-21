import { DOCTORS } from '@/lib/doctors'
import ReservaForm, { type ReservaDoctor } from './ReservaForm'

export const metadata = {
  title: 'Agendar consulta médica — EVIPro',
  description: 'Solicita una consulta médica presencial, virtual o a domicilio. Sin membresía.',
}

export default function ReservarPage() {
  const doctors: ReservaDoctor[] = DOCTORS.map(d => ({
    slug: d.slug,
    name: d.name,
    whatsapp: d.whatsapp,
    schedule: d.counseling?.schedule ?? ['09:00', '10:00', '11:00', '14:00', '15:00', '17:00'],
  }))

  return (
    <main className="min-h-screen bg-ink text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-1">Consulta médica</p>
        <h1 className="text-3xl font-light font-serif italic mb-2">Agendar consulta</h1>
        <p className="text-muted text-sm mb-10 max-w-xl">
          Solicita tu consulta médica sin membresía. Eliges modalidad y horario; el médico confirma la cita y el precio por WhatsApp.
        </p>
        <ReservaForm doctors={doctors} />
      </div>
    </main>
  )
}
