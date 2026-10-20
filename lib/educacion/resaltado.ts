export type AtomoSimple = { elem: string; bonds: number[] }

const vecinos = (a: AtomoSimple[], i: number, elem: string) => a[i].bonds.filter((j) => a[j].elem === elem)

/** Grupo ácido: el carbono con dos oxígenos vecinos, esos oxígenos y los H unidos a ellos. */
export function atomosAcido(atomos: AtomoSimple[]): number[] {
  const out = new Set<number>()
  atomos.forEach((at, i) => {
    const os = at.elem === 'C' ? vecinos(atomos, i, 'O') : []
    if (os.length !== 2) return
    out.add(i)
    for (const o of os) {
      out.add(o)
      vecinos(atomos, o, 'H').forEach((h) => out.add(h))
    }
  })
  return [...out]
}

/** Anillo de oxígeno: cada oxígeno unido a dos carbonos, más esos carbonos. */
export function atomosAnilloOxigeno(atomos: AtomoSimple[]): number[] {
  const out = new Set<number>()
  atomos.forEach((at, i) => {
    const cs = at.elem === 'O' ? vecinos(atomos, i, 'C') : []
    if (cs.length !== 2) return
    out.add(i)
    cs.forEach((c) => out.add(c))
  })
  return [...out]
}

/** Hidroxilos de fenol: cada oxígeno con un H y un C vecino, más ese H. Excluye el OH de un ácido (C con dos O). */
export function atomosHidroxiloFenol(atomos: AtomoSimple[]): number[] {
  const out: number[] = []
  atomos.forEach((at, i) => {
    if (at.elem !== 'O') return
    const hs = vecinos(atomos, i, 'H')
    const cs = vecinos(atomos, i, 'C')
    if (hs.length !== 1 || cs.length !== 1 || vecinos(atomos, cs[0], 'O').length !== 1) return
    out.push(i, hs[0])
  })
  return out
}
