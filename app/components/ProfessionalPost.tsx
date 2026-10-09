'use client'

import { useEffect, useRef, useState } from 'react'
import { T } from '@/app/components/Language'

const POST_URL = 'https://www.facebook.com/Behashis/posts/pfbid02J5Hy2sEbSD7huSq7cbrxKJxtYxFPUvkAVbyvBsEaUxSms1Qr5bzn92ND6vtuPbW5l'

export default function ProfessionalPost() {
  const container = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.min(500, Math.floor(entry.contentRect.width)))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="publicaciones" className="scroll-mt-24">
      <h2 className="text-xs font-mono uppercase tracking-widest text-brand mb-4"><T>{"Publicaciones y actividad profesional"}</T></h2>
      <p className="text-sm text-muted mb-4"><T>{"Contenido educativo seleccionado por el Dr. Carlos Jara. No reemplaza una evaluación médica."}</T></p>
      <h3 className="text-lg mb-4">Altura, oxígeno y cognición</h3>
      <div ref={container} className="w-full max-w-[500px]">
        {width > 0 && (
          <iframe
            title="Publicación del Dr. Carlos Jara: altura, oxígeno y cognición"
            src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(POST_URL)}&show_text=true&width=${width}`}
            width={width}
            height={800}
            className="block max-w-full border-0"
            loading="lazy"
            allow="encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>
      <a href={POST_URL} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-brand underline underline-offset-4 mt-4"><T>{"Ver publicación en Facebook →"}</T></a>
    </section>
  )
}
