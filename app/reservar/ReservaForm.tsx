'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CONSULTA_MODALITY_LABELS,
  escaleraReserva,
  type ModalidadReserva,
} from '@/lib/consulta-pricing'

export interface ReservaDoctor {
  slug: string
  name: string
  whatsapp: string
  schedule: string[]
}

const MODALIDADES: ModalidadReserva[] = ['presencial', 'virtual', 'domicilio']

function getWeekdays(count: number): Date[] {
  const days: Date[] = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  while (days.length < count) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) days.push(new Date(d))
  }
  return days
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function ReservaForm({ doctors }: { doctors: ReservaDoctor[] }) {
  const [doctorSlug, setDoctorSlug] = useState<string | null>(doctors.length === 1 ? doctors[0].slug : null)
  const [modality, setModality] = useState<ModalidadReserva | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())

  const doctor = doctors.find(d => d.slug === doctorSlug) ?? null
  const SCHEDULE = doctor?.schedule ?? ['09:00', '10:00', '11:00', '14:00', '15:00', '17:00']
  const weekdays = getWeekdays(7)

  useEffect(() => {
    if (!doctorSlug) return
    fetch(`/api/consejeria/booked-slots?doctor_slug=${doctorSlug}`)
      .then(r => r.ok ? r.json() : { booked: [] })
      .then((data: { booked: string[] }) => setBookedSlots(new Set(data.booked)))
      .catch(() => {})
  }, [doctorSlug])

  async function submit() {
    if (!doctorSlug || !modality) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reservar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_slug: doctorSlug,
          modality,
          slot_date: selectedDate ?? null,
          slot_time: selectedTime ?? null,
          patient_name: name,
          patient_phone: phone,
          patient_note: note || null,
        }),
      })
      if (res.ok) {
        const data = await res.json() as { booking_id: string }
        setBookingId(data.booking_id)
      } else {
        setError('Error al guardar la solicitud. Intenta de nuevo.')
      }
    } catch {
      setError('No se pudo conectar. Revisa tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (bookingId) {
    const waMsg = encodeURIComponent(
      `Hola, solicité una consulta médica.\n` +
      `Ref: ${bookingId.slice(0, 8)}\n` +
      `Nombre: ${name}\n` +
      `Modalidad: ${modality ? CONSULTA_MODALITY_LABELS[modality] : ''}\n` +
      (selectedDate ? `Fecha: ${selectedDate} ${selectedTime ?? ''}\n` : '') +
      (note ? `Motivo: ${note}` : '')
    )
    return (
      <div className="text-center py-16">
        <p className="text-brand text-5xl mb-6">✓</p>
        <h2 className="text-2xl font-light mb-2">Solicitud registrada</h2>
        <p className="text-muted text-sm mb-8 max-w-sm mx-auto">
          El médico confirmará tu cita y el precio por WhatsApp.
        </p>
        {doctor && (
          <a
            href={`https://wa.me/${doctor.whatsapp}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand text-black px-8 py-3 rounded font-mono text-sm hover:bg-brand-hover transition-colors"
          >
            Enviar datos al médico →
          </a>
        )}
      </div>
    )
  }

  const needsSlot = modality === 'presencial' || modality === 'virtual'
  const slotOk = !needsSlot || (selectedDate !== null && selectedTime !== null)
  const showData = doctorSlug !== null && modality !== null && slotOk
  const canSubmit = showData && name.trim() !== '' && phone.trim() !== ''

  return (
    <div className="space-y-10 max-w-2xl">
      {/* Paso 1: médico */}
      {/* ponytail: sin gate por doctors.length>1 — el test asume el picker visible
          incluso con un solo médico, y confirmar a quién se reserva es buen UX igual. */}
      {doctors.length > 0 && (
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3">1 · Médico</p>
          <div className="space-y-2">
            {doctors.map(d => (
              <button
                key={d.slug}
                onClick={() => { setDoctorSlug(d.slug); setSelectedDate(null); setSelectedTime(null) }}
                className={`w-full text-left p-4 border rounded transition-colors focus-visible:border-brand ${
                  doctorSlug === d.slug ? 'border-brand bg-brand/5' : 'border-subtle hover:border-white/30'
                }`}
              >
                <p className="text-white text-sm">{d.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 2: modalidad */}
      {doctorSlug && (
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3">2 · Modalidad</p>
          <div className="space-y-2">
            {MODALIDADES.map(m => (
              <button
                key={m}
                onClick={() => { setModality(m); setSelectedDate(null); setSelectedTime(null) }}
                className={`w-full text-left p-4 border rounded transition-colors focus-visible:border-brand ${
                  modality === m ? 'border-brand bg-brand/5' : 'border-subtle hover:border-white/30'
                }`}
              >
                <div className="flex justify-between items-center gap-4">
                  <p className="text-white text-sm">{CONSULTA_MODALITY_LABELS[m]}</p>
                  <p className="text-gray-300 text-xs font-mono shrink-0">{escaleraReserva(m)}</p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-faint text-xs font-mono mt-2">
            Precios sin membresía. Miembros EVIPro pagan menos — <Link href="/planes" className="underline hover:text-white">ver planes</Link>.
          </p>
        </div>
      )}

      {/* Paso 3: horario (presencial/virtual) */}
      {modality && needsSlot && (
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3">3 · Horario</p>
          <div className="space-y-5">
            {weekdays.map(day => (
              <div key={toISODate(day)}>
                <p className="text-xs text-faint font-mono mb-2 capitalize">{formatDate(day)}</p>
                <div className="flex flex-wrap gap-2">
                  {SCHEDULE.map(time => {
                    const active = selectedDate === toISODate(day) && selectedTime === time
                    const taken = bookedSlots.has(`${toISODate(day)}T${time}`)
                    return (
                      <button
                        key={time}
                        disabled={taken}
                        onClick={() => { setSelectedDate(toISODate(day)); setSelectedTime(time) }}
                        className={`px-3 py-1.5 text-xs rounded font-mono transition-colors ${
                          taken ? 'bg-white/5 text-faint line-through cursor-not-allowed'
                            : active ? 'bg-brand text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paso 4: datos */}
      {showData && (
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3">4 · Tus datos</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">Nombre completo *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">WhatsApp / Teléfono *</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="9XXXXXXXX"
                className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">Motivo (opcional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-xs font-mono">{error}</p>}

      {showData && (
        <button
          disabled={!canSubmit || loading}
          onClick={submit}
          className="w-full py-2.5 bg-brand-deep hover:bg-brand-mid text-white text-sm rounded transition-colors disabled:opacity-40 font-mono"
        >
          {loading ? 'Enviando...' : 'Solicitar consulta →'}
        </button>
      )}

      <p className="text-xs text-faint font-mono">
        Es una solicitud: el médico confirma la cita y cobra al atender (presencial, Yape o WhatsApp).
      </p>
    </div>
  )
}
