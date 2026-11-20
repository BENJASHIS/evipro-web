'use client'
import { Analytics } from '@vercel/analytics/next'
import { rutaSinToken } from '@/lib/analitica'

// Vercel Analytics con la guía del frasco sin su token (la función no puede pasarse desde el layout de servidor).
export default function AnaliticaVercel() {
  return <Analytics beforeSend={event => ({ ...event, url: rutaSinToken(event.url) })} />
}
