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
