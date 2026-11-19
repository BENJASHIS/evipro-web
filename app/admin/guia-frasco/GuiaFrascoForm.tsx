'use client'
import { useActionState, useState } from 'react'
import { crearEnlaceGuia, type EstadoEnlace } from './actions'

const campo = 'mt-1 block w-full rounded border border-subtle bg-transparent px-3 py-2'

export default function GuiaFrascoForm({ vigencias, vigenciaDefecto }: { vigencias: number[]; vigenciaDefecto: number }) {
  const [estado, accion, enviando] = useActionState<EstadoEnlace | null, FormData>(crearEnlaceGuia, null)
  const [copiado, setCopiado] = useState(false)
  async function copiar(url: string) {
    try { await navigator.clipboard.writeText(url); setCopiado(true) } catch { setCopiado(false) }
  }
  return <form action={accion} onSubmit={() => setCopiado(false)} className="space-y-4">
    <label className="block text-sm">THC %<input name="thc" inputMode="decimal" required autoComplete="off" className={campo} /></label>
    <label className="block text-sm">CBD %<input name="cbd" inputMode="decimal" required autoComplete="off" className={campo} /></label>
    <label className="block text-sm">Vigencia
      <select name="dias" defaultValue={String(vigenciaDefecto)} className={campo}>
        {vigencias.map(d => <option key={d} value={d} className="text-black">{d} días</option>)}
      </select>
    </label>
    <button type="submit" disabled={enviando} className="rounded bg-brand px-4 py-2 text-black disabled:opacity-50">{enviando ? 'Generando…' : 'Generar enlace'}</button>
    {estado && !estado.ok && <p role="alert" className="text-sm text-red-300">{estado.error}</p>}
    {estado?.ok && <div aria-live="polite" className="rounded border border-subtle p-4 space-y-2 text-sm">
      <p className="font-semibold">{estado.linea}</p>
      <p className="text-muted">{estado.proporcion}</p>
      <p>Válido hasta el {estado.vence}</p>
      <p className="break-all"><a href={estado.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">{estado.url}</a></p>
      <div className="flex gap-3">
        <button type="button" onClick={() => copiar(estado.url)} className="rounded border border-subtle px-3 py-1">{copiado ? 'Copiado' : 'Copiar'}</button>
        <a href={estado.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded border border-subtle px-3 py-1">WhatsApp</a>
      </div>
    </div>}
  </form>
}
