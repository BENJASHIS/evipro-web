'use client'
import { useEffect, useState } from 'react'
import { T } from '@/app/components/Language'
import { memberReturnPath } from '@/lib/member-return'
import { useAuthSearch } from '@/lib/use-bottle-entry'

export default function GoogleSignIn({next='/miembros'}: {next?:string}) {
  const [enabled,setEnabled] = useState(false)
  const search = useAuthSearch()
  const failed = new URLSearchParams(search).has('auth_error')
  useEffect(()=>{
    let active = true
    fetch('/api/auth/providers').then(async response=>{
      const settings = response.ok ? await response.json() : null
      if (active) setEnabled(settings?.google === true)
    }).catch(()=>{ if (active) setEnabled(false) })
    return ()=>{ active=false }
  },[])
  return <>
    {failed && <p role="alert" className="text-sm text-red-400 mb-4"><T>No se pudo completar el acceso. Intenta otra vez o usa tu correo.</T></p>}
    {enabled && <div className="mb-6">
      <a href={`/auth/google?next=${encodeURIComponent(memberReturnPath(next))}`} className="block w-full rounded border border-subtle bg-white px-4 py-3 text-center text-sm text-black hover:bg-gray-100"><T>Continuar con Google</T></a>
      <p className="text-center text-xs text-faint mt-3">
        <T>{"Al continuar con Google aceptas los "}</T>
        <a href="/terminos" target="_blank" rel="noopener noreferrer" className="underline"><T>{"Términos y Condiciones"}</T></a>
        <T>{" y el tratamiento de tus datos personales."}</T>
      </p>
      <p className="text-center text-xs text-faint mt-4"><T>O continúa con tu correo</T></p>
    </div>}
  </>
}
