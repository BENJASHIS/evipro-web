import datos from './farmacias-digemid.json'

// Copia fiel de la lista oficial de DIGEMID: se muestra completa, sin destacar ninguna (diseño del 18/19-nov).
export interface Farmacia {
  n: number
  categoria: 'BOTICA' | 'FARMACIA' | 'FARES'
  nombre: string
  direccion: string
  provincia: string
  distrito: string
  ruc: string
  estado: 'ACTIVO' | 'INACTIVO'
}

export const FUENTE_DIGEMID = { fuente: datos.fuente, url: datos.url, actualizado: datos.actualizado }
export const LISTA_DIGEMID = datos.farmacias as Farmacia[]

export const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export function filtrarFarmacias(lista: Farmacia[], consulta: string): Farmacia[] {
  const q = normalizar(consulta)
  if (!q) return lista
  return lista.filter(f => [f.nombre, f.provincia, f.distrito, f.ruc].some(campo => normalizar(campo).includes(q)))
}
