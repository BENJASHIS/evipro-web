import { describe, it, expect } from 'vitest'
import {
  INDICACIONES_PORTADA, PARA_QUE_NO, PREGUNTAS, PASOS_PRIMERA_CONSULTA,
  RENPUC_NOMBRE, HERO, PALABRAS_PROHIBIDAS, OTRAS_ESPECIALIDADES,
  MEDICO, ESPECIALIDADES_PROXIMAS, WHATSAPP, MEMBRESIA,
} from '@/lib/home-content'

/** Todo el texto que la portada imprime, en un solo string, para barrerlo.
 *  Debe cubrir TODOS los exports que aparecen en la página: si alguien añade
 *  una constante nueva, debe meterla aquí para que el barrido de palabras
 *  prohibidas y precios la vigile. */
function textoDeLaPortada(): string {
  return [
    HERO.etiqueta, HERO.titulo, HERO.titulo2, HERO.subtitulo, HERO.credenciales,
    PARA_QUE_NO.titulo, PARA_QUE_NO.texto,
    ...INDICACIONES_PORTADA.flatMap(i => [i.titulo, i.matiz]),
    ...PREGUNTAS.flatMap(q => [q.p, q.r]),
    ...PASOS_PRIMERA_CONSULTA.flatMap(p => [p.titulo, p.texto]),
    ...OTRAS_ESPECIALIDADES,
    MEDICO.nombre, MEDICO.especialidades, MEDICO.credenciales, MEDICO.direccion,
    ...ESPECIALIDADES_PROXIMAS,
    MEMBRESIA.titulo, MEMBRESIA.texto, MEMBRESIA.cta,
    WHATSAPP,
  ].join(' ').toLowerCase()
}

describe('contenido de la portada — restricciones clínicas', () => {
  // Espejo de core/cannabinoide_indicaciones.py::INDICACIONES_AUTORIZADAS.
  // Si esa tabla cambia en el motor, este test es el que debe fallar primero.
  it('solo anuncia indicaciones con fuente registrada en el motor', () => {
    const titulos = INDICACIONES_PORTADA.map(i => i.titulo.toLowerCase())
    for (const t of titulos) {
      const autorizada =
        t.includes('dolor') || t.includes('migraña') ||
        t.includes('espasticidad') || t.includes('esclerosis') ||
        t.includes('náuseas') || t.includes('epilepsia')
      expect(autorizada, `"${t}" no está en INDICACIONES_AUTORIZADAS`).toBe(true)
    }
  })

  it('no anuncia ansiedad ni insomnio como indicación', () => {
    const titulos = INDICACIONES_PORTADA.map(i => i.titulo.toLowerCase()).join(' ')
    expect(titulos).not.toContain('ansiedad')
    expect(titulos).not.toContain('insomnio')
  })

  it('ansiedad e insomnio sí aparecen, pero como límite', () => {
    const limite = (PARA_QUE_NO.titulo + ' ' + PARA_QUE_NO.texto).toLowerCase()
    expect(limite).toContain('ansiedad')
    expect(limite).toContain('insomnio')
    expect(limite).toContain('muy baja')
  })

  it('acota la epilepsia a sus tres síndromes', () => {
    const epi = INDICACIONES_PORTADA.find(i => i.titulo.toLowerCase().includes('epilepsia'))
    expect(epi, 'falta la tarjeta de epilepsia').toBeDefined()
    const m = epi!.matiz.toLowerCase()
    expect(m).toContain('dravet')
    expect(m).toContain('lennox')
    expect(m).toContain('tuberosa')
  })

  it('no promete resultados en ningún texto', () => {
    const texto = textoDeLaPortada()
    for (const palabra of PALABRAS_PROHIBIDAS) {
      expect(texto, `aparece "${palabra}"`).not.toContain(palabra)
    }
  })

  it('no lleva ningún precio en el contenido', () => {
    expect(textoDeLaPortada()).not.toMatch(/s\/\s?\d/)
  })
})

describe('contenido de la portada — estructura', () => {
  it('deletrea el RENPUC completo, sin abreviar', () => {
    expect(RENPUC_NOMBRE).toBe(
      'Registro Nacional de Pacientes Usuarios del Cannabis y sus Derivados para Uso Medicinal y Terapéutico',
    )
  })

  it('explica el RENPUC en las preguntas frecuentes', () => {
    const renpuc = PREGUNTAS.find(q => q.p.toLowerCase().includes('renpuc'))
    expect(renpuc, 'falta la pregunta del RENPUC').toBeDefined()
    expect(renpuc!.r).toContain(RENPUC_NOMBRE)
  })

  it('la primera consulta son 4 pasos, en orden, con receta y registro', () => {
    expect(PASOS_PRIMERA_CONSULTA.map(p => p.n)).toEqual([1, 2, 3, 4])
    const paso3 = PASOS_PRIMERA_CONSULTA[2]
    expect(paso3.texto.toLowerCase()).toContain('simple')
    expect(paso3.texto.toLowerCase()).toContain('especial')
    expect(paso3.texto.toLowerCase()).toContain('triplicado')
    expect(PASOS_PRIMERA_CONSULTA[3].texto).toContain('RENPUC')
  })
})
