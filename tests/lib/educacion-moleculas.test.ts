import { it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { MOLECULAS } from '@/lib/educacion/moleculas'
import { atomosAcido, atomosAnilloOxigeno, atomosHidroxiloFenol, type AtomoSimple } from '@/lib/educacion/resaltado'

it.each(Object.entries(MOLECULAS))('%s: el SDF es del CID declarado y hay imagen', (id, m) => {
  const sdf = readFileSync(`public/moleculas/${id}.sdf`, 'utf8')
  expect(sdf.split('\n')[0].trim()).toBe(String(m.cid)) // PubChem escribe el CID en la primera línea
  expect(existsSync(`public/moleculas/${id}.png`)).toBe(true)
})
it('fórmulas de la spec', () => {
  expect(MOLECULAS.thc).toMatchObject({ cid: 16078, formula: 'C21H30O2' })
  expect(MOLECULAS.cbd).toMatchObject({ cid: 644019, formula: 'C21H30O2' })
  expect(MOLECULAS.cbca).toMatchObject({ cid: 3084339, formula: 'C22H30O4' })
  expect(MOLECULAS.thcv).toMatchObject({ cid: 93147, formula: 'C19H26O2' })
})
// Ácido acético mínimo: C0–C1(=O2)(O3–H4)
const acetico = [{ elem: 'C', bonds: [1] }, { elem: 'C', bonds: [0, 2, 3] }, { elem: 'O', bonds: [1] }, { elem: 'O', bonds: [1, 4] }, { elem: 'H', bonds: [3] }]
it('resalta el grupo ácido', () => expect(atomosAcido(acetico).sort()).toEqual([1, 2, 3, 4]))
// Éter mínimo: C0–O1–C2
it('resalta el oxígeno del anillo con sus carbonos', () => expect(atomosAnilloOxigeno([{ elem: 'C', bonds: [1] }, { elem: 'O', bonds: [0, 2] }, { elem: 'C', bonds: [1] }]).sort()).toEqual([0, 1, 2]))

// SDF V2000 de PubChem: línea 4 = recuento de átomos y enlaces; enlaces con índices desde 1.
function leerSdf(id: string): AtomoSimple[] {
  const lineas = readFileSync(`public/moleculas/${id}.sdf`, 'utf8').split('\n')
  const nAtomos = Number(lineas[3].slice(0, 3)), nEnlaces = Number(lineas[3].slice(3, 6))
  const atomos: AtomoSimple[] = lineas.slice(4, 4 + nAtomos).map(l => ({ elem: l.slice(31, 34).trim(), bonds: [] }))
  for (const l of lineas.slice(4 + nAtomos, 4 + nAtomos + nEnlaces)) {
    const a = Number(l.slice(0, 3)) - 1, b = Number(l.slice(3, 6)) - 1
    atomos[a].bonds.push(b); atomos[b].bonds.push(a)
  }
  return atomos
}
const elems = (atomos: AtomoSimple[], idx: number[]) => idx.map(i => atomos[i].elem).sort().join('')
it('SDF real: THCA resalta los 4 átomos del grupo ácido', () => {
  const thca = leerSdf('thca')
  expect(elems(thca, atomosAcido(thca))).toBe('CHOO')
})
it('SDF real: el THC tiene oxígeno de anillo y el CBD no', () => {
  const thc = leerSdf('thc')
  expect(elems(thc, atomosAnilloOxigeno(thc))).toBe('CCO')
  expect(atomosAnilloOxigeno(leerSdf('cbd'))).toEqual([])
})
it('SDF real: hidroxilos de fenol, dos en CBD, uno en THC y THCA (sin el OH del ácido)', () => {
  const cbd = leerSdf('cbd'), thc = leerSdf('thc'), thca = leerSdf('thca')
  expect(elems(cbd, atomosHidroxiloFenol(cbd))).toBe('HHOO')
  expect(elems(thc, atomosHidroxiloFenol(thc))).toBe('HO')
  expect(elems(thca, atomosHidroxiloFenol(thca))).toBe('HO')
})
