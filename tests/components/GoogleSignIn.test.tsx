import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import GoogleSignIn from '@/app/components/GoogleSignIn'
import { BOTTLE_PATH } from '@/lib/member-return'
afterEach(()=>vi.unstubAllGlobals())
it('muestra Google solo si está habilitado y conserva el destino',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({google:true})}))
  render(<GoogleSignIn next={BOTTLE_PATH} />)
  expect(await screen.findByRole('link',{name:'Continuar con Google'})).toHaveAttribute('href',`/auth/google?next=${encodeURIComponent(BOTTLE_PATH)}`)
})
it('avisa junto al botón que continuar con Google acepta los Términos',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({google:true})}))
  render(<GoogleSignIn />)
  expect(await screen.findByRole('link',{name:'Términos y Condiciones'})).toHaveAttribute('href','/terminos')
  expect(screen.getByText(/Al continuar con Google aceptas/)).toBeInTheDocument()
})
it('sin proveedor disponible conserva solo la alternativa por correo',async()=>{
  const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({google:false})})
  vi.stubGlobal('fetch',fetcher)
  render(<GoogleSignIn />)
  await waitFor(()=>expect(fetcher).toHaveBeenCalled())
  expect(screen.queryByRole('link',{name:'Continuar con Google'})).toBeNull()
})
