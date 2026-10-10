import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Hero, ParaQueSi, ParaQueNo, Preguntas, PrimeraConsulta, Membresia,
  EvidenciaLimites,
} from '@/app/components/home/secciones'
import { RENPUC_NOMBRE } from '@/lib/home-content'
import { DOCTORS } from '@/lib/doctors'

describe('Hero', () => {
  it('permite conocer las membresías desde la portada', () => {
    render(<Hero />)
    const cta = screen.getByRole('link', { name: /conocer las membresías/i })
    expect(cta.getAttribute('href')).toBe('/planes#membresias')
  })

  it('muestra la colegiatura de cada médico', () => {
    render(<Hero />)
    for (const doctor of DOCTORS) {
      expect(screen.getByText(`CMP ${doctor.cmp}`)).toBeTruthy()
    }
  })

  it('no muestra ningún precio', () => {
    const { container } = render(<Hero />)
    expect(container.textContent).not.toMatch(/S\/\.?\s?\d/)
  })
})

describe('ParaQueSi', () => {
  it('acota la epilepsia en la propia tarjeta', () => {
    render(<ParaQueSi />)
    expect(screen.getByText(/Dravet/)).toBeTruthy()
  })

  it('no anuncia ansiedad ni insomnio', () => {
    const { container } = render(<ParaQueSi />)
    expect(container.textContent?.toLowerCase()).not.toContain('ansiedad')
    expect(container.textContent?.toLowerCase()).not.toContain('insomnio')
  })
})

describe('ParaQueNo', () => {
  it('nombra ansiedad e insomnio como límite', () => {
    const { container } = render(<ParaQueNo />)
    const t = container.textContent!.toLowerCase()
    expect(t).toContain('ansiedad')
    expect(t).toContain('insomnio')
    expect(t).toContain('no recetarte nada')
  })
})

describe('EvidenciaLimites', () => {
  it('muestra fuentes clínicas y regulatorias como enlaces externos', () => {
    render(<EvidenciaLimites />)
    expect(screen.getByText(/Evidencia y límites/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /AHRQ 2024/i })).toHaveAttribute('href', expect.stringContaining('ahrq.gov'))
    expect(screen.getAllByRole('link', { name: /NICE NG144/i })[0]).toHaveAttribute('href', expect.stringContaining('ncbi.nlm.nih.gov'))
    expect(screen.getByRole('link', { name: /DIGEMID/i })).toHaveAttribute('href', expect.stringContaining('digemid.minsa.gob.pe'))
  })

  it('no presenta la evidencia como promesa de resultado', () => {
    const { container } = render(<EvidenciaLimites />)
    const t = container.textContent!.toLowerCase()
    expect(t).toContain('no todo paciente necesita cannabis')
    expect(t).toContain('beneficios pequeños')
  })
})

describe('Preguntas', () => {
  it('aclara la confirmación y separa consulta de productos', () => {
    render(<Preguntas />)
    expect(screen.getByText(/enviar un mensaje no reserva automáticamente/)).toBeTruthy()
    expect(screen.getByText(/El pago corresponde a la evaluación médica/)).toBeTruthy()
  })

})

describe('PrimeraConsulta', () => {
  it('distingue receta simple de receta especial por triplicado', () => {
    const { container } = render(<PrimeraConsulta />)
    const t = container.textContent!.toLowerCase()
    expect(t).toContain('simple')
    expect(t).toContain('triplicado')
  })

  it('el precio de consulta sale del helper, no de un literal', () => {
    const { container } = render(<PrimeraConsulta />)
    // escaleraReserva('presencial') produce "1ª S/100 · reconsulta S/50 · desde 3ª S/25"
    expect(container.textContent).toContain('reconsulta')
  })

  it('la sigla RENPUC lleva el nombre completo en un <abbr>', () => {
    const { container } = render(<PrimeraConsulta />)
    const abbr = container.querySelector('abbr')
    expect(abbr, 'falta el <abbr> del RENPUC').toBeTruthy()
    expect(abbr!.textContent).toBe('RENPUC')
    expect(abbr!.getAttribute('title')).toBe(RENPUC_NOMBRE)
    // El texto no puede quedar partido ni duplicado por insertar el <abbr>.
    expect(container.textContent).toContain(
      'El RENPUC es el registro que la ley exige',
    )
  })

  it('no hay ningún RENPUC fuera de un <abbr>', () => {
    const { container } = render(<PrimeraConsulta />)
    const clon = container.cloneNode(true) as HTMLElement
    const abbrs = clon.querySelectorAll('abbr')
    abbrs.forEach(abbr => abbr.remove())
    expect(clon.textContent).not.toContain('RENPUC')
  })
})

describe('Membresia', () => {
  it('muestra el precio que le pasan', () => {
    const { container } = render(<Membresia desde={9.9} basica={5} />)
    expect(container.textContent).toContain('9.9')
  })

  it('sin precio disponible, no inventa uno', () => {
    const { container } = render(<Membresia desde={null} basica={null} />)
    expect(container.textContent).not.toMatch(/S\/\.?\s?\d/)
    expect(screen.getByRole('link', { name: /ver precio y beneficios de básica/i })).toHaveAttribute('href', '/planes#basica')
    expect(screen.getByRole('link', { name: /comparar opciones evipro/i })).toHaveAttribute('href', '/planes#evipro')
  })
})
