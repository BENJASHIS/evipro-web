import { readFileSync, existsSync } from 'node:fs'
import { MOLECULAS } from '@/lib/educacion/moleculas'
import { atomosAcido, atomosAnilloOxigeno } from '@/lib/educacion/resaltado'

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
