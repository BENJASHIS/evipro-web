# Agendado unificado por médico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fusionar los dos formularios de agendado (consejería online + consulta manual) en un solo `AgendarForm` con las 5 modalidades, vivido en `/medicos/[slug]/agendar`, y redirigir/limpiar las rutas viejas.

**Architecture:** Un componente cliente `AgendarForm` recibe un `Doctor`, muestra las modalidades agrupadas (consejería si el médico las ofrece + consulta siempre), y ramifica el submit por modalidad: consejería → `/api/consejeria/book` (pago online MercadoPago), consulta → `/api/reservar/book` (solicitud manual). Ambas persisten en `counseling_bookings`. Se reusan los endpoints y la máquina de reservas existentes sin cambios.

**Tech Stack:** Next.js 16 (App Router), React, TypeScript, vitest + @testing-library/react.

## Global Constraints

- Plataforma `evipro-platform/` (repo anidado, remoto evipro-web, Vercel auto-deploy en push a `main`). Todos los comandos desde `evipro-platform/`.
- Next.js 16: consultar `node_modules/next/dist/docs/` para `permanentRedirect` y rutas antes de codear; no confiar en memoria.
- No tocar la máquina de reservas ni los endpoints (`/api/consejeria/book`, `/api/reservar/book`, `/api/consejeria/booked-slots`, `/api/consejeria/check-first`) — se reusan tal cual.
- Modalidades: consejería = `Modality` (`'video'|'messaging'|'whatsapp'`, de `lib/counseling.ts`); consulta = `ModalidadReserva` (`'presencial'|'virtual'|'domicilio'`, de `lib/consulta-pricing.ts`).
- Slots: piden horario `video`, `presencial`, `virtual`; NO piden `whatsapp`, `messaging`, `domicilio`.
- Pago: consejería → `paid:true, payment_method:'mercadopago'`; consulta → `paid:false, payment_method:'manual'` (lo fija el endpoint).

---

### Task 1: Componente `AgendarForm` (fusión de los dos formularios)

**Files:**
- Create: `app/medicos/[slug]/agendar/AgendarForm.tsx`
- Test: `tests/components/AgendarForm.test.tsx`

**Interfaces:**
- Consumes: `Doctor` de `@/lib/doctors`; `MODALITY_LABELS`, `MODALITY_DURATION`, `getPrice`, `type Modality` de `@/lib/counseling`; `CONSULTA_MODALITY_LABELS`, `escaleraReserva`, `type ModalidadReserva` de `@/lib/consulta-pricing`.
- Produces: `export default function AgendarForm({ doctor }: { doctor: Doctor })` — usado por la página de la Task 2.

- [ ] **Step 1: Escribir el test que falla**

Create `tests/components/AgendarForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AgendarForm from '../../app/medicos/[slug]/agendar/AgendarForm'
import type { Doctor } from '../../lib/doctors'

const doctor = {
  slug: 'dr-jara',
  name: 'Dr. Jara',
  cmp: '82817',
  whatsapp: '51999999999',
  counseling: {
    available: true,
    description: '',
    modalities: ['video', 'whatsapp'],
    schedule: ['09:00', '10:00'],
  },
} as unknown as Doctor

beforeEach(() => {
  // booked-slots (mount) y check-first (debounce) devuelven vacío/ok; book devuelve un id
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/book')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ booking_id: 'abc12345' }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ booked: [], is_first: true }) })
  }))
})

describe('AgendarForm', () => {
  it('muestra las 5 modalidades: consejería (Video, WhatsApp) + consulta (Presencial, Virtual, A domicilio)', () => {
    render(<AgendarForm doctor={doctor} />)
    expect(screen.getByText('Video (15–20 min)')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Presencial')).toBeInTheDocument()
    expect(screen.getByText('Virtual (teleconsulta)')).toBeInTheDocument()
    expect(screen.getByText('A domicilio')).toBeInTheDocument()
  })

  it('presencial muestra el paso de horario', () => {
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('Presencial'))
    expect(screen.getByText(/Horario/)).toBeInTheDocument()
  })

  it('A domicilio NO muestra horario y salta a los datos', () => {
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('A domicilio'))
    expect(screen.queryByText(/Horario/)).not.toBeInTheDocument()
    expect(screen.getByText(/Tus datos/)).toBeInTheDocument()
  })

  it('consulta (A domicilio) envía a /api/reservar/book', async () => {
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('A domicilio'))
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: '987654321' } })
    fireEvent.click(screen.getByText(/Solicitar/))
    await waitFor(() =>
      expect(vi.mocked(fetch).mock.calls.some(c => c[0] === '/api/reservar/book')).toBe(true),
    )
  })

  it('consejería (WhatsApp) envía a /api/consejeria/book', async () => {
    render(<AgendarForm doctor={doctor} />)
    fireEvent.click(screen.getByText('WhatsApp'))
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: '987654321' } })
    fireEvent.click(screen.getByText(/Pagar/))
    await waitFor(() =>
      expect(vi.mocked(fetch).mock.calls.some(c => c[0] === '/api/consejeria/book')).toBe(true),
    )
  })
})
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npx vitest run tests/components/AgendarForm.test.tsx`
Expected: FAIL — no existe `app/medicos/[slug]/agendar/AgendarForm.tsx` (error de import/módulo no encontrado).

- [ ] **Step 3: Implementar `AgendarForm`**

Create `app/medicos/[slug]/agendar/AgendarForm.tsx`:

```tsx
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
        else setError('Error al guardar la solicitud. Intenta de nuevo.')
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
        } else setError('Error al guardar la reserva. Intenta de nuevo.')
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
```

- [ ] **Step 4: Correr los tests para verificar que pasan**

Run: `npx vitest run tests/components/AgendarForm.test.tsx`
Expected: PASS (5 tests verdes).

- [ ] **Step 5: Commit**

```bash
git add app/medicos/[slug]/agendar/AgendarForm.tsx tests/components/AgendarForm.test.tsx
git commit -m "feat(agendar): AgendarForm unificado (consejería online + consulta manual)"
```

---

### Task 2: Página `/medicos/[slug]/agendar` + CTA en la ficha

**Files:**
- Create: `app/medicos/[slug]/agendar/page.tsx`
- Modify: `app/medicos/[slug]/page.tsx` (botón del sidebar)

**Interfaces:**
- Consumes: `AgendarForm` de `./AgendarForm` (Task 1); `DOCTORS` de `@/lib/doctors`.

- [ ] **Step 1: Crear la página del agendado**

Create `app/medicos/[slug]/agendar/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Nav from '@/app/components/Nav'
import { DOCTORS } from '@/lib/doctors'
import AgendarForm from './AgendarForm'

export function generateStaticParams() {
  return DOCTORS.map(d => ({ slug: d.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) return {}
  return { title: `Agendar cita con ${doctor.name} — EVIPro` }
}

export default async function AgendarPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) notFound()

  return (
    <main className="min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-12">
          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-white/5">
            <Image src={doctor.photo} alt={doctor.name} fill className="object-cover object-top" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brand mb-0.5">Agendar cita</p>
            <h1 className="text-2xl font-light">{doctor.name}</h1>
            <p className="text-faint text-xs font-mono">CMP {doctor.cmp}</p>
          </div>
        </div>
        <AgendarForm doctor={doctor} />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Cambiar el CTA en la ficha del médico**

En `app/medicos/[slug]/page.tsx`, reemplazar el bloque condicional del botón de consejería:

```tsx
            {doctor.counseling?.available && (
              <Link
                href={`/consejeria/${doctor.slug}`}
                className="block w-full text-center bg-brand text-black py-3 rounded font-mono text-sm hover:bg-brand-hover transition-colors"
              >
                Agendar consejería →
              </Link>
            )}
```

por (sin condición, apuntando al agendado unificado):

```tsx
            <Link
              href={`/medicos/${doctor.slug}/agendar`}
              className="block w-full text-center bg-brand text-black py-3 rounded font-mono text-sm hover:bg-brand-hover transition-colors"
            >
              Agendar cita →
            </Link>
```

- [ ] **Step 3: Verificar build (la ruta compila y la ficha enlaza)**

Run: `npm run build`
Expected: build OK; en la lista de rutas aparece `/medicos/[slug]/agendar`.

Run: `grep -n "agendar" "app/medicos/[slug]/page.tsx"`
Expected: la línea del `href` a `/medicos/${doctor.slug}/agendar` presente; ya no hay `href={\`/consejeria/${doctor.slug}\`}`.

- [ ] **Step 4: Commit**

```bash
git add "app/medicos/[slug]/agendar/page.tsx" "app/medicos/[slug]/page.tsx"
git commit -m "feat(agendar): página /medicos/[slug]/agendar + CTA 'Agendar cita' en la ficha"
```

---

### Task 3: Redirects, nav y limpieza de código muerto

**Files:**
- Modify: `app/consejeria/[slug]/page.tsx` (→ redirect)
- Modify: `app/reservar/page.tsx` (→ redirect)
- Modify: `app/components/Nav.tsx` (quitar pestaña Reservar)
- Modify: `app/consejeria/page.tsx` (CTA per-médico apunta al agendado unificado)
- Delete: `app/consejeria/[slug]/BookingForm.tsx`, `app/reservar/ReservaForm.tsx`, `tests/components/ReservaForm.test.tsx`

- [ ] **Step 1: Redirigir `/consejeria/[slug]` al agendado unificado**

Reemplazar todo el contenido de `app/consejeria/[slug]/page.tsx` por:

```tsx
import { permanentRedirect } from 'next/navigation'

export default async function ConsejeriaSlugRedirect(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  permanentRedirect(`/medicos/${slug}/agendar`)
}
```

- [ ] **Step 2: Redirigir `/reservar` a la lista de médicos**

Reemplazar todo el contenido de `app/reservar/page.tsx` por:

```tsx
import { permanentRedirect } from 'next/navigation'

export default function ReservarRedirect() {
  permanentRedirect('/medicos')
}
```

- [ ] **Step 3: Quitar la pestaña "Agendar" (→/reservar) del nav**

En `app/components/Nav.tsx`, eliminar esta línea del array `LINKS`:

```tsx
  { href: '/reservar', label: 'Agendar' },
```

(El array queda: Planes, Médicos, Consejería, Ingresar.)

- [ ] **Step 4: Apuntar el CTA per-médico del landing de consejería al agendado unificado**

En `app/consejeria/page.tsx`, cambiar el `href` del enlace "Agendar →" (≈ línea 92) de:

```tsx
                  href={`/consejeria/${doctor.slug}`}
```

a:

```tsx
                  href={`/medicos/${doctor.slug}/agendar`}
```

- [ ] **Step 5: Borrar el código muerto**

```bash
git rm "app/consejeria/[slug]/BookingForm.tsx" "app/reservar/ReservaForm.tsx" tests/components/ReservaForm.test.tsx
```

- [ ] **Step 6: Verificar que no quedan referencias a lo borrado**

Run: `grep -rn "ReservaForm\|consejeria/\[slug\]/BookingForm\|from './BookingForm'" app tests`
Expected: sin resultados (ninguna importación viva).

- [ ] **Step 7: Verificar test suite + build**

Run: `npm test`
Expected: verde (incluye `AgendarForm.test.tsx`; ya no está `ReservaForm.test.tsx`).

Run: `npm run build`
Expected: build OK; `/consejeria/[slug]` y `/reservar` compilan como redirects.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(agendar): redirects de /reservar y /consejeria/[slug], quita pestaña Reservar, borra forms muertos"
```

---

## Self-Review

**Spec coverage:**
- Componente unificado `AgendarForm` con 5 modalidades + ramificación de pago → Task 1. ✓
- Página propia `/medicos/[slug]/agendar` + CTA en la ficha → Task 2. ✓
- Redirects (`/consejeria/[slug]`, `/reservar`), nav sin "Reservar", CTA del landing, borrado de código muerto → Task 3. ✓
- Tests (5 modalidades, WhatsApp/Domicilio sin horario, ramificación de submit) → Task 1. ✓
- Endpoints y máquina de reservas sin tocar → respetado (solo se llaman los existentes). ✓
- Slots: video/presencial/virtual piden horario; whatsapp/messaging/domicilio no → `SLOT_MODS`/`needsSlot`. ✓

**Placeholder scan:** sin TBD/TODO; todo el código está completo en los steps.

**Type consistency:** `AnyModality = Modality | ModalidadReserva`; `isConsulta`/`needsSlot`/`labelOf` usados consistentemente; `AgendarForm({ doctor })` firma igual en Task 1 (definición), Task 1 test (import) y Task 2 (uso). Endpoints `/api/reservar/book` y `/api/consejeria/book` con los mismos cuerpos que hoy usan `ReservaForm`/`BookingForm`.

**Nota de riesgo (Next 16):** `permanentRedirect` debe importarse de `next/navigation`; verificar en `node_modules/next/dist/docs/` que la firma no cambió antes de codear la Task 3.
```
