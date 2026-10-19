// Estructuras de PubChem (dominio público), CID y fórmula verificados el 2026-10-19 (spec §8).
export type MoleculaId = 'thc' | 'cbd' | 'thca' | 'cbda' | 'cbga' | 'cbca' | 'cbg' | 'cbc' | 'cbn' | 'cbgva' | 'thcva' | 'thcv' | 'limoneno' | 'linalool' | 'mirceno' | 'cariofileno' | 'kuromanina' | 'cannflavina_a'

export const MOLECULAS: Record<MoleculaId, { nombre: { es: string; en: string }; cid: number; formula: string }> = {
  thc: { nombre: { es: 'THC (tetrahidrocannabinol)', en: 'THC (tetrahydrocannabinol)' }, cid: 16078, formula: 'C21H30O2' },
  cbd: { nombre: { es: 'CBD (cannabidiol)', en: 'CBD (cannabidiol)' }, cid: 644019, formula: 'C21H30O2' },
  thca: { nombre: { es: 'THCA (ácido tetrahidrocannabinólico)', en: 'THCA (tetrahydrocannabinolic acid)' }, cid: 98523, formula: 'C22H30O4' },
  cbda: { nombre: { es: 'CBDA (ácido cannabidiólico)', en: 'CBDA (cannabidiolic acid)' }, cid: 160570, formula: 'C22H30O4' },
  cbga: { nombre: { es: 'CBGA (ácido cannabigerólico)', en: 'CBGA (cannabigerolic acid)' }, cid: 6449999, formula: 'C22H32O4' },
  cbca: { nombre: { es: 'CBCA (ácido cannabicroménico)', en: 'CBCA (cannabichromenic acid)' }, cid: 3084339, formula: 'C22H30O4' },
  cbg: { nombre: { es: 'CBG (cannabigerol)', en: 'CBG (cannabigerol)' }, cid: 5315659, formula: 'C21H32O2' },
  cbc: { nombre: { es: 'CBC (cannabicromeno)', en: 'CBC (cannabichromene)' }, cid: 30219, formula: 'C21H30O2' },
  cbn: { nombre: { es: 'CBN (cannabinol)', en: 'CBN (cannabinol)' }, cid: 2543, formula: 'C21H26O2' },
  cbgva: { nombre: { es: 'CBGVA (ácido cannabigerovarínico)', en: 'CBGVA (cannabigerovarinic acid)' }, cid: 59444383, formula: 'C20H28O4' },
  thcva: { nombre: { es: 'THCVA (ácido tetrahidrocannabivarínico)', en: 'THCVA (tetrahydrocannabivarinic acid)' }, cid: 59444416, formula: 'C20H26O4' },
  thcv: { nombre: { es: 'THCV (tetrahidrocannabivarina)', en: 'THCV (tetrahydrocannabivarin)' }, cid: 93147, formula: 'C19H26O2' },
  limoneno: { nombre: { es: 'd-limoneno', en: 'd-limonene' }, cid: 440917, formula: 'C10H16' },
  linalool: { nombre: { es: 'linalool', en: 'linalool' }, cid: 6549, formula: 'C10H18O' },
  mirceno: { nombre: { es: 'mirceno', en: 'myrcene' }, cid: 31253, formula: 'C10H16' },
  cariofileno: { nombre: { es: 'β-cariofileno', en: 'β-caryophyllene' }, cid: 5281515, formula: 'C15H24' },
  kuromanina: { nombre: { es: 'kuromanina (cianidina-3-glucósido)', en: 'kuromanin (cyanidin-3-glucoside)' }, cid: 441667, formula: 'C21H21O11+' },
  cannflavina_a: { nombre: { es: 'cannflavina A', en: 'cannflavin A' }, cid: 10071695, formula: 'C26H28O6' },
}

export const rutaSdf = (id: MoleculaId) => `/moleculas/${id}.sdf`
export const rutaPng = (id: MoleculaId) => `/moleculas/${id}.png`
