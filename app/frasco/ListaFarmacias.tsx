'use client'
import { useState } from 'react'
import { FUENTE_DIGEMID, LISTA_DIGEMID, filtrarFarmacias } from '@/lib/farmacias'
import styles from './ListaFarmacias.module.css'

const fecha = new Date(`${FUENTE_DIGEMID.actualizado}T12:00:00Z`)
  .toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })

export default function ListaFarmacias() {
  const [consulta, setConsulta] = useState('')
  const filas = filtrarFarmacias(LISTA_DIGEMID, consulta)
  return <div>
    <label htmlFor="buscar-farmacia" className="block text-sm mb-2">Busca por nombre, ciudad, distrito o RUC</label>
    <input id="buscar-farmacia" type="search" autoComplete="off" value={consulta} onChange={e => setConsulta(e.target.value)}
      className="w-full max-w-md rounded border border-subtle bg-transparent px-3 py-2" />
    <p role="status" className="text-sm text-muted mt-2">{filas.length} de {LISTA_DIGEMID.length}</p>
    <div tabIndex={0} role="region" aria-labelledby="farmacias-titulo" className={styles.marco}>
      <table className={styles.tabla}>
        <caption id="farmacias-titulo">Boticas y farmacias autorizadas por DIGEMID</caption>
        <thead><tr>
          <th scope="col">Nombre</th><th scope="col">Categoría</th><th scope="col">Dirección</th><th scope="col">Distrito</th>
          <th scope="col">Provincia</th><th scope="col">RUC</th><th scope="col">Estado</th>
        </tr></thead>
        <tbody>{filas.map(f => <tr key={f.n}>
          <th scope="row">{f.nombre}</th><td>{f.categoria}</td><td>{f.direccion}</td><td>{f.distrito}</td>
          <td>{f.provincia}</td><td>{f.ruc}</td><td>{f.estado}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="text-sm mt-3">Fuente: <a href={FUENTE_DIGEMID.url} target="_blank" rel="noopener noreferrer" className="underline">DIGEMID, lista actualizada al {fecha}</a>.</p>
  </div>
}
