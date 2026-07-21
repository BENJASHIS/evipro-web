'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Doctor } from '@/lib/doctors'
import { MODALITY_LABELS, MODALITY_DURATION, getPrice, type Modality } from '@/lib/counseling'
import { CONSULTA_MODALITY_LABELS, escaleraReserva, type ModalidadReserva } from '@/lib/consulta-pricing'

type AnyModality = Modality | ModalidadReserva
const CONSULTA_MODS: ModalidadReserva[] = ['presencial', 'virtual', 'domicilio']
const SLOT_MODS: AnyModality[] = ['video', 'presencial', 'virtual']
const isConsulta = (m: AnyModality): m is ModalidadReserva => (CONSULTA_MODS as string[]).includes(m)
const needsSlot = (m: AnyModality) => (SLOT_MODS as string[]).includes(m)
const labelOf = (m: AnyModality) =>
  isConsulta(m) ? CONSULTA_MODALITY_LABELS[m] : MODALITY_LABELS[m as Modality]

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

export default function AgendarForm({ doctor }: { doctor: Doctor }) {
  const [modality, setModality] = useState<AnyModality | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [isFirst, setIsFirst] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())

  const SCHEDULE = doctor.counseling?.schedule ?? ['09:00', '10:00', '11:00', '14:00', '15:00', '17:00']
  const weekdays = getWeekdays(7)
  const consejeriaMods = doctor.counseling?.available ? (doctor.counseling.modalities ?? []) : []
  const price = modality && !isConsulta(modality) ? getPrice(modality as Modality, false) : null

  useEffect(() => {
    fetch(`/api/consejeria/booked-slots?doctor_slug=${doctor.slug}`)
      .then(r => r.ok ? r.json() : { booked: [] })
      .then((data: { booked: string[] }) => setBookedSlots(new Set(data.booked)))
      .catch(() => {})
  }, [doctor.slug])

  useEffect(() => {
    // is_first solo aplica a consejería (pago online); en consulta no se usa
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!modality || isConsulta(modality) || !phone || phone.length < 9) { setIsFirst(null); return }
    const timer = setTimeout(async () => {
      const res = await fetch('/api/consejeria/check-first', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_slug: doctor.slug, phone }),
      })
      setIsFirst(res.ok ? ((await res.json()) as { is_first: boolean }).is_first : true)
    }, 500)
    return () => clearTimeout(timer)
  }, [phone, modality, doctor.slug])

  async function submit() {
    if (!modality) return
    setLoading(true)
    setError(null)
    try {
      if (isConsulta(modality)) {
        const res = await fetch('/api/reservar/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctor_slug: doctor.slug,
            modality,
            slot_date: selectedDate ?? null,
            slot_time: selectedTime ?? null,
            patient_name: name,
            patient_phone: phone,
            patient_note: note || null,
          }),
        })
        if (res.ok) setBookingId(((await res.json()) as { booking_id: string }).booking_id)
        else {
          const data = await res.json().catch(() => null) as { error?: string } | null
          setError(data?.error ?? 'Error al guardar la solicitud. Intenta de nuevo.')
        }
      } else {
        const res = await fetch('/api/consejeria/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctor_slug: doctor.slug,
            modality,
            slot_date: selectedDate ?? null,
            slot_time: selectedTime ?? null,
            patient_name: name,
            patient_phone: phone,
            patient_note: note || null,
            is_first_session: isFirst ?? true,
            price_soles: price ?? 0,
            paid: true,
            payment_method: 'mercadopago',
          }),
        })
        if (res.ok) {
          const data = (await res.json()) as { booking_id: string; init_point?: string }
          if (data.init_point) { window.location.href = data.init_point; return }
          setBookingId(data.booking_id)
        } else {
          const err = await res.json().catch(() => null) as { error?: string } | null
          setError(err?.error ?? 'Error al guardar la reserva. Intenta de nuevo.')
        }
      }
    } catch {
      setError('No se pudo conectar. Revisa tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (bookingId) {
    const waMsg = encodeURIComponent(
      `Hola, solicité una cita.\n` +
      `Ref: ${bookingId.slice(0, 8)}\n` +
      `Nombre: ${name}\n` +
      `Modalidad: ${modality ? labelOf(modality) : ''}\n` +
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
        <a
          href={`https://wa.me/${doctor.whatsapp}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand text-black px-8 py-3 rounded font-mono text-sm hover:bg-brand-hover transition-colors"
        >
          Enviar datos al médico →
        </a>
      </div>
    )
  }

  const slotOk = !modality || !needsSlot(modality) || (selectedDate !== null && selectedTime !== null)
  const showData = modality !== null && slotOk
  const canSubmit = showData && name.trim() !== '' && phone.trim() !== ''
  const submitLabel = modality && isConsulta(modality)
    ? 'Solicitar consulta →'
    : price !== null ? `Pagar S/. ${price} →` : 'Solicitar →'

  return (
    <div className="space-y-10 max-w-2xl">
      {/* Paso 1: modalidad */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3">1 · Modalidad</p>

        {consejeriaMods.length > 0 && (
          <>
            <p className="text-faint text-xs font-mono mb-2">Consejería (apoyo, pago online)</p>
            <div className="space-y-2 mb-5">
              {consejeriaMods.map(m => (
                <button
                  key={m}
                  onClick={() => { setModality(m); setSelectedDate(null); setSelectedTime(null); setIsFirst(null) }}
                  className={`w-full text-left p-4 border rounded transition-colors focus-visible:border-brand ${
                    modality === m ? 'border-brand bg-brand/5' : 'border-subtle hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <p className="text-white text-sm">{MODALITY_LABELS[m]}</p>
                      <p className="text-faint text-xs font-mono mt-0.5">{MODALITY_DURATION[m]}</p>
                    </div>
                    <p className="text-gray-300 text-sm font-mono shrink-0">S/. {getPrice(m, false)}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <p className="text-faint text-xs font-mono mb-2">Consulta médica (cobro al atender)</p>
        <div className="space-y-2">
          {CONSULTA_MODS.map(m => (
            <button
              key={m}
              onClick={() => { setModality(m); setSelectedDate(null); setSelectedTime(null); setIsFirst(null) }}
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
          Precios de consulta sin membresía. Miembros EVIPro pagan menos — <Link href="/planes" className="underline hover:text-white">ver planes</Link>.
        </p>
      </div>

      {/* Paso 2: horario (solo modalidades con slot) */}
      {modality && needsSlot(modality) && (
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3">2 · Horario</p>
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

      {/* Paso 3: datos */}
      {showData && (
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3">3 · Tus datos</p>
          <div className="space-y-3">
            <div>
              <label htmlFor="ag-nombre" className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">Nombre completo *</label>
              <input id="ag-nombre" type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label htmlFor="ag-tel" className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">WhatsApp / Teléfono *</label>
              <input id="ag-tel" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="9XXXXXXXX"
                className="w-full bg-white/5 border border-subtle rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label htmlFor="ag-motivo" className="block text-xs text-muted mb-1 uppercase tracking-widest font-mono">Motivo (opcional)</label>
              <input id="ag-motivo" type="text" value={note} onChange={e => setNote(e.target.value)}
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
          {loading ? 'Enviando...' : submitLabel}
        </button>
      )}

      <p className="text-xs text-faint font-mono">
        Consulta médica: es una solicitud, el médico confirma y cobra al atender. Consejería: se paga online al reservar.
      </p>
    </div>
  )
}
