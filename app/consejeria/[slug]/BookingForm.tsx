'use client'
import { useState, useEffect } from 'react'
import type { Doctor } from '@/lib/doctors'
import { MODALITY_LABELS, MODALITY_DURATION, getPrice } from '@/lib/counseling'
import type { Modality } from '@/lib/counseling'

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

export default function BookingForm({ doctor }: { doctor: Doctor }) {
  const [modality, setModality] = useState<Modality | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [isFirst, setIsFirst] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [culqiReady, setCulqiReady] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())

  const SCHEDULE = doctor.counseling?.schedule ?? ['09:00','10:00','11:00','14:00','15:00','17:00']
  const weekdays = getWeekdays(7)

  const price = modality && isFirst !== null ? getPrice(modality, isFirst) : null
  const isFree = price === 0

  useEffect(() => {
    fetch(`/api/consejeria/booked-slots?doctor_slug=${doctor.slug}`)
      .then(r => r.ok ? r.json() : { booked: [] })
      .then((data: { booked: string[] }) => setBookedSlots(new Set(data.booked)))
      .catch(() => {})
  }, [doctor.slug])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.culqi.com/js/v3'
    script.async = true
    script.onload = () => {
      const w = window as Window & { Culqi?: { publicKey: string } }
      if (w.Culqi) {
        w.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? ''
        setCulqiReady(true)
      }
    }
    document.head.appendChild(script)
    return () => { if (document.head.contains(script)) document.head.removeChild(script) }
  }, [])

  useEffect(() => {
    if (!phone || phone.length < 9 || !modality) { setIsFirst(null); return }
    const timer = setTimeout(async () => {
      const res = await fetch('/api/consejeria/check-first', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_slug: doctor.slug, phone }),
      })
      if (res.ok) {
        const data = await res.json() as { is_first: boolean }
        setIsFirst(data.is_first)
      } else {
        setIsFirst(true)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [phone, modality, doctor.slug])

  async function saveBooking(extra: { paid: boolean; payment_method: 'culqi' | 'free'; culqi_order_id?: string }) {
    setLoading(true)
    setError(null)
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
        ...extra,
      }),
    })
    if (res.ok) {
      const data = await res.json() as { booking_id: string }
      setBookingId(data.booking_id)
    } else {
      setError('Error al guardar la reserva. Intenta de nuevo.')
    }
    setLoading(false)
  }

  function handlePaidBooking() {
    const w = window as Window & {
      Culqi?: { settings: (s: object) => void; open: () => void; token?: { id: string } }
      culqi?: () => void
    }
    if (!w.Culqi || price === null) return
    w.Culqi.settings({
      title: 'EVIPro Consejería',
      currency: 'PEN',
      amount: price * 100,
      description: `Consejería ${MODALITY_LABELS[modality!]} · ${doctor.name}`,
    })
    w.culqi = () => {
      const token = w.Culqi?.token
      if (!token?.id) { setError('Error al procesar el pago. Intenta de nuevo.'); return }
      saveBooking({ paid: true, payment_method: 'culqi', culqi_order_id: token.id })
    }
    w.Culqi.open()
  }

  if (bookingId) {
    const waMsg = encodeURIComponent(
      `Hola, acabo de agendar una consejería.\n` +
      `Ref: ${bookingId.slice(0, 8)}\n` +
      `Nombre: ${name}\n` +
      `Modalidad: ${modality ? MODALITY_LABELS[modality] : ''}\n` +
      (selectedDate ? `Fecha: ${selectedDate} ${selectedTime}\n` : '') +
      (note ? `Motivo: ${note}` : '')
    )
    return (
      <div className="text-center py-16">
        <p className="text-[#7bc96f] text-5xl mb-6">✓</p>
        <h2 className="text-2xl font-light mb-2">Reserva registrada</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
          El Dr. confirmará tu sesión por WhatsApp en menos de 2 h.
        </p>
        <a
          href={`https://wa.me/${doctor.whatsapp}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#7bc96f] text-black px-8 py-3 rounded font-mono text-sm hover:bg-[#6ab85f] transition-colors"
        >
          Enviar datos al médico →
        </a>
      </div>
    )
  }

  const canProceedStep2 = modality === 'video' ? (selectedDate !== null && selectedTime !== null) : true
  const showDataStep = modality !== null && canProceedStep2
  const canSubmit = showDataStep && name.trim() !== '' && phone.trim() !== '' && isFirst !== null
  const stepLabel = modality === 'video' ? '3 · Tus datos' : '2 · Tus datos'

  return (
    <div className="grid md:grid-cols-3 gap-10">
      {/* Form */}
      <div className="md:col-span-2 space-y-10">

        {/* Step 1: Modality */}
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#7bc96f] mb-3">
            1 · Modalidad
          </p>
          <div className="space-y-2">
            {(doctor.counseling?.modalities ?? (['video','messaging','whatsapp'] as Modality[])).map(m => (
              <button
                key={m}
                onClick={() => { setModality(m); setIsFirst(null) }}
                className={`w-full text-left p-4 border rounded transition-colors ${
                  modality === m
                    ? 'border-[#7bc96f] bg-[#7bc96f]/5'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm">{MODALITY_LABELS[m]}</p>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">{MODALITY_DURATION[m]}</p>
                  </div>
                  <p className="text-gray-300 text-sm font-mono shrink-0 ml-4">
                    {m === 'video' ? 'S/. 15' : 'Gratis 1ra vez · S/. 3'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Schedule (video only) */}
        {modality === 'video' && (
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#7bc96f] mb-3">
              2 · Horario
            </p>
            <div className="space-y-5">
              {weekdays.map(day => (
                <div key={toISODate(day)}>
                  <p className="text-xs text-gray-500 font-mono mb-2 capitalize">
                    {formatDate(day)}
                  </p>
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
                            taken
                              ? 'bg-white/5 text-gray-600 line-through cursor-not-allowed'
                              : active
                              ? 'bg-[#7bc96f] text-black'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
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

        {/* Step 3: Patient data */}
        {showDataStep && (
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#7bc96f] mb-3">
              {stepLabel}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest font-mono">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest font-mono">
                  WhatsApp / Teléfono *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="9XXXXXXXX"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
                />
                {isFirst === false && modality !== 'video' && (
                  <p className="text-xs text-yellow-400 font-mono mt-1">
                    Sesión recurrente · S/. 3
                  </p>
                )}
                {isFirst === true && modality !== 'video' && (
                  <p className="text-xs text-[#7bc96f] font-mono mt-1">
                    Primera sesión · Gratis
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest font-mono">
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
                />
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
      </div>

      {/* Sidebar */}
      <div>
        <div className="border border-white/10 rounded-lg p-5 space-y-3 sticky top-8">
          <p className="text-xs font-mono uppercase tracking-widest text-gray-500">Resumen</p>

          {modality && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{MODALITY_LABELS[modality]}</span>
              <span className="text-white">
                {price !== null ? (price === 0 ? 'Gratis' : `S/. ${price}`) : '—'}
              </span>
            </div>
          )}
          {selectedDate && selectedTime && (
            <p className="text-xs text-gray-500 font-mono">{selectedDate} · {selectedTime}</p>
          )}

          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-400 text-sm">Total</span>
              <span className="text-white text-xl font-light">
                {price !== null ? (price === 0 ? 'Gratis' : `S/. ${price}`) : '—'}
              </span>
            </div>
          </div>

          <button
            disabled={!canSubmit || loading || (price !== null && price > 0 && !culqiReady)}
            onClick={isFree
              ? () => saveBooking({ paid: false, payment_method: 'free' })
              : handlePaidBooking}
            className="w-full py-2.5 bg-[#2d5a27] hover:bg-[#4a8c42] text-white text-sm rounded transition-colors disabled:opacity-40 font-mono"
          >
            {loading
              ? 'Procesando...'
              : price === null
              ? 'Ingresa tus datos'
              : price === 0
              ? 'Reservar gratis →'
              : `Pagar S/. ${price} →`}
          </button>

          {price !== null && price > 0 && (
            <div className="text-xs text-gray-500 font-mono pt-2 border-t border-white/10 space-y-1">
              <p>O paga con Yape:</p>
              <p className="text-white">924 074 152</p>
              <p className="text-gray-600 text-[10px]">
                Envía comprobante al mismo número por WhatsApp.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-600 font-mono pt-1">
            El Dr. confirmará tu sesión por WhatsApp en menos de 2 h.
          </p>
        </div>
      </div>
    </div>
  )
}
