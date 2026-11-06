'use client'
import { useEffect, useRef, useState } from 'react'

export default function VisorFrasco() {
  const iframe = useRef<HTMLIFrameElement>(null)
  const [height,setHeight] = useState(1500)
  useEffect(()=>{
    const resize = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow) return
      const message = event.data
      if (message?.type !== 'evipro-visor-height' || typeof message.height !== 'number' || !Number.isFinite(message.height) || message.height < 400 || message.height > 6000) return
      setHeight(Math.ceil(message.height))
    }
    window.addEventListener('message',resize)
    return ()=>window.removeEventListener('message',resize)
  },[])
  return <iframe ref={iframe} title="Explora CBD y THC: visor didáctico" src="/miembros/contenido/explora-cbd-thc/visor/index.html"
    className="w-full border-0 bg-[#f4f0e8]" style={{height}} allowFullScreen />
}
