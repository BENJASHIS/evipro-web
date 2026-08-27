'use client'

import { useState } from 'react'
import Link from 'next/link'
import Marca from '@/app/components/ui/Marca'

// Orden = el camino de quien llega de cero: primero lo que ve (con quién
// trabajamos), después lo que cuesta, y al final las dos acciones de cuenta.
// «Médicos» no está como enlace a propósito: el botón Agendar lleva ahí y
// decirlo dos veces era la misma puerta repetida.
const LINKS = [
  { href: '/aliados', label: 'Aliados' },
  { href: '/planes', label: 'Planes' },
  { href: '/planes#turista', label: 'Turistas' },
  { href: '/registro', label: 'Unirme' },
  { href: '/login', label: 'Ingresar' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="relative max-w-5xl mx-auto px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <Marca />

        {/* Enlaces en escritorio */}
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-muted">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
          ))}
          <Link
            href="/medicos"
            className="border border-brand text-brand px-4 py-1.5 rounded hover:bg-brand hover:text-black transition-colors"
          >
            Agendar
          </Link>
        </div>

        {/* Botón hamburguesa en móvil */}
        <button
          type="button"
          aria-label="Menú"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="md:hidden flex flex-col justify-center gap-1.5 w-9 h-9 -mr-2 shrink-0"
        >
          <span className={`block h-0.5 w-6 bg-white transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-white transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Menú desplegable en móvil */}
      {open && (
        <div className="md:hidden mt-3 flex flex-col gap-1 text-sm font-mono text-muted border-t border-subtle pt-3">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/medicos"
            onClick={() => setOpen(false)}
            className="mt-2 border border-brand text-brand px-4 py-2 rounded text-center hover:bg-brand hover:text-black transition-colors"
          >
            Agendar
          </Link>
        </div>
      )}
    </nav>
  )
}
