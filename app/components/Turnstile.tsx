'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      theme?: 'light' | 'dark' | 'auto'
      size?: 'normal' | 'compact' | 'flexible'
      language?: string
      action?: string
      callback?: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
    },
  ) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

interface TurnstileProps {
  action: string
  className?: string
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  resetSignal?: number
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''
export const TURNSTILE_CLIENT_ENABLED = TURNSTILE_SITE_KEY.trim().length > 0

export default function Turnstile({
  action,
  className,
  onVerify,
  onError,
  onExpire,
  resetSignal = 0,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const callbacksRef = useRef({ onVerify, onError, onExpire })
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.turnstile),
  )

  useEffect(() => {
    callbacksRef.current = { onVerify, onError, onExpire }
  }, [onVerify, onError, onExpire])

  useEffect(() => {
    if (!TURNSTILE_CLIENT_ENABLED || !scriptReady || !window.turnstile || !containerRef.current || widgetIdRef.current) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'dark',
      size: 'flexible',
      language: 'es',
      action,
      callback: token => callbacksRef.current.onVerify(token),
      'expired-callback': () => {
        callbacksRef.current.onVerify('')
        callbacksRef.current.onExpire?.()
      },
      'error-callback': () => {
        callbacksRef.current.onVerify('')
        callbacksRef.current.onError?.()
      },
    })

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [action, scriptReady])

  useEffect(() => {
    if (!resetSignal || !widgetIdRef.current || !window.turnstile) return
    window.turnstile.reset(widgetIdRef.current)
    callbacksRef.current.onVerify('')
  }, [resetSignal])

  if (!TURNSTILE_CLIENT_ENABLED) return null

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  )
}
