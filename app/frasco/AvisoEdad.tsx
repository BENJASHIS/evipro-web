'use client'
import { useState, useSyncExternalStore, type ReactNode } from 'react'
import { useLanguage } from '@/app/components/Language'

export const CLAVE_EDAD = 'evipro-mayor-edad'

// El almacenamiento puede fallar (modo privado, navegador interno de WhatsApp): entonces se pregunta cada vez.
const yaConfirmo = () => { try { return localStorage.getItem(CLAVE_EDAD) === '1' } catch { return false } }
const sinSuscripcion = () => () => {}

// Aviso dentro de la página, no una ventana modal (Modern Web Guidance: no interrumpir con interstitials).
// Un «No» no se guarda: quien tocó por error vuelve a ver la pregunta al recargar.
export default function AvisoEdad({ children }: { children: ReactNode }) {
  const guardado = useSyncExternalStore(sinSuscripcion, yaConfirmo, () => false)
  const [respuesta, setRespuesta] = useState<'si' | 'no' | null>(null)
  const { t } = useLanguage()
  if (respuesta === 'si' || (respuesta === null && guardado)) return <>{children}</>
  if (respuesta === 'no') return <p role="status" className="public-panel rounded-lg p-6 max-w-xl">{t('Este contenido es solo para mayores de edad.')}</p>
  const confirmar = () => {
    try { localStorage.setItem(CLAVE_EDAD, '1') } catch { /* se preguntará la próxima vez */ }
    setRespuesta('si')
  }
  return <section aria-labelledby="aviso-edad" className="public-panel rounded-lg p-6 max-w-xl">
    <h2 id="aviso-edad" className="font-serif text-xl mb-2">{t('Aviso de edad')}</h2>
    <p>{t('Contenido educativo para mayores de 18 años en Perú (21 donde la ley de tu país lo exija). ¿Eres mayor de edad?')}</p>
    <div className="flex flex-wrap gap-3 mt-4">
      <button type="button" onClick={confirmar} className="rounded bg-brand px-4 py-2 text-black">{t('Sí, soy mayor de edad')}</button>
      <button type="button" onClick={() => setRespuesta('no')} className="rounded border border-subtle px-4 py-2">{t('No')}</button>
    </div>
  </section>
}
