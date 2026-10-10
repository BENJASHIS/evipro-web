'use client'

import { useLanguage } from './Language'
import { WHATSAPP } from '@/lib/home-content'

export default function WhatsAppContact({ fixed = false }: { fixed?: boolean }) {
  const { t } = useLanguage()
  const message = t('Hola, quisiera coordinar una teleconsulta. ¿Qué horarios tienen disponibles?')
  return <a href={`https://wa.me/51${WHATSAPP}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={`${fixed ? 'fixed bottom-4 right-4 left-4 sm:left-auto z-40 shadow-lg' : 'inline-block'} bg-brand text-black rounded px-5 py-3 text-sm font-medium text-center hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand`}>
    {t('Coordinar teleconsulta por WhatsApp')}
  </a>
}
