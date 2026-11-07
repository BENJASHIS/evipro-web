import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'

vi.mock('next/navigation', () => ({ notFound: vi.fn() }))
vi.mock('@/app/components/Nav', () => ({ default: () => null }))

import AgendarPage from '../../app/medicos/[slug]/agendar/page'
import AgendarForm from '../../app/medicos/[slug]/agendar/AgendarForm'

const buscar = (el: unknown): ReactElement<{ doctor: Record<string, unknown> }> | null => {
  if (!el || typeof el !== 'object') return null
  const e = el as ReactElement<{ children?: unknown }>
  if (e.type === AgendarForm) return e as ReactElement<{ doctor: Record<string, unknown> }>
  const hijos = ([] as unknown[]).concat(e.props?.children ?? [])
  for (const h of hijos) { const r = buscar(h); if (r) return r }
  return null
}

describe('/medicos/[slug]/agendar', () => {
  it('no manda al navegador el enlace de PayPal ni las rutas de los QR', async () => {
    const pagina = await AgendarPage({ params: Promise.resolve({ slug: 'dr-jara' }) })
    const form = buscar(pagina)
    expect(form).not.toBeNull()
    expect(form!.props.doctor.pagoAlReservar).toBeTruthy()
    const enviado = JSON.stringify(form!.props.doctor)
    expect(enviado).not.toContain('paypal')
    expect(enviado).not.toContain('yape.png')
  })
})
