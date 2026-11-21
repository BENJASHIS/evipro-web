'use client'
import { useState } from 'react'
import { interpolar, useLanguage } from '@/app/components/Language'
import { FUENTE_DIGEMID, LISTA_DIGEMID, filtrarFarmacias } from '@/lib/farmacias'
import styles from './ListaFarmacias.module.css'

const fechaDe = (locale: string) => new Date(`${FUENTE_DIGEMID.actualizado}T12:00:00Z`)
  .toLocaleDateString(locale === 'en' ? 'en-US' : 'es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })

export default function ListaFarmacias() {
  const [consulta, setConsulta] = useState('')
  const { locale, t } = useLanguage()
  const filas = filtrarFarmacias(LISTA_DIGEMID, consulta)
  return <div>
    <label htmlFor="buscar-farmacia" className="block text-sm mb-2">{t('Busca por nombre, ciudad, distrito o RUC')}</label>
    <input id="buscar-farmacia" type="search" autoComplete="off" value={consulta} onChange={e => setConsulta(e.target.value)}
      className="w-full max-w-md rounded border border-subtle bg-transparent px-3 py-2" />
    <p role="status" className="text-sm text-muted mt-2">{interpolar(t('{n} de {total}'), { n: filas.length, total: LISTA_DIGEMID.length })}</p>
    <div tabIndex={0} role="region" aria-labelledby="farmacias-titulo" className={styles.marco}>
      <table className={styles.tabla}>
        <caption id="farmacias-titulo">{t('Boticas y farmacias autorizadas por DIGEMID')}</caption>
        <thead><tr>
          <th scope="col">{t('Nombre')}</th><th scope="col">{t('Categoría')}</th><th scope="col">{t('Dirección')}</th><th scope="col">{t('Distrito')}</th>
          <th scope="col">{t('Provincia')}</th><th scope="col">RUC</th><th scope="col">{t('Estado')}</th>
        </tr></thead>
        <tbody>{filas.map(f => <tr key={f.n}>
          <th scope="row">{f.nombre}</th><td>{f.categoria}</td><td>{f.direccion}</td><td>{f.distrito}</td>
          <td>{f.provincia}</td><td>{f.ruc}</td><td>{f.estado}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="text-sm mt-3">{t('Fuente:')} <a href={FUENTE_DIGEMID.url} target="_blank" rel="noopener noreferrer" className="underline">{interpolar(t('DIGEMID, lista actualizada al {fecha}'), { fecha: fechaDe(locale) })}</a>.</p>
  </div>
}
