import { describe, expect, it } from 'vitest'
import { FUENTE_DIGEMID, LISTA_DIGEMID, filtrarFarmacias, type Farmacia } from '@/lib/farmacias'

describe('lista oficial de DIGEMID', () => {
  it('copia completa y bien formada de la lista oficial', () => {
    expect(FUENTE_DIGEMID.actualizado).toBe('2026-06-16')
    expect(FUENTE_DIGEMID.url).toMatch(/^https:\/\/www\.digemid\.minsa\.gob\.pe\/.+\.pdf$/)
    expect(LISTA_DIGEMID).toHaveLength(52)
    expect(new Set(LISTA_DIGEMID.map(f => f.n))).toEqual(new Set(Array.from({ length: 52 }, (_, i) => i + 1)))
    for (const f of LISTA_DIGEMID) {
      expect(Object.keys(f).sort()).toEqual(['categoria', 'direccion', 'distrito', 'estado', 'n', 'nombre', 'provincia', 'ruc'])
      expect(f.ruc).toMatch(/^\d{11}$/)
      expect(['BOTICA', 'FARMACIA', 'FARES']).toContain(f.categoria)
      expect(['ACTIVO', 'INACTIVO']).toContain(f.estado)
      expect(f.nombre.trim()).not.toBe('')
    }
    const clave = (f: Farmacia) => `${f.provincia}|${f.distrito}`
    expect(LISTA_DIGEMID.map(clave)).toEqual(LISTA_DIGEMID.map(clave).sort((a, b) => a.localeCompare(b, 'es')))
    expect(LISTA_DIGEMID.filter(f => f.estado === 'INACTIVO').map(f => f.ruc)).toEqual(['20608098357'])
  })
  it('filtra sin importar tildes, mayúsculas ni espacios', () => {
    expect(filtrarFarmacias(LISTA_DIGEMID, '  Wánchaq ').map(f => f.ruc)).toEqual(['20605764780'])
    expect(filtrarFarmacias(LISTA_DIGEMID, 'CUSCO').map(f => f.ruc)).toEqual(['20605764780'])
    expect(filtrarFarmacias(LISTA_DIGEMID, '20605764780')).toHaveLength(1)
    expect(filtrarFarmacias(LISTA_DIGEMID, '')).toHaveLength(52)
    expect(filtrarFarmacias(LISTA_DIGEMID, 'zzz')).toEqual([])
  })
})
