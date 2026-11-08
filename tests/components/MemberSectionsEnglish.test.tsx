import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render,screen} from '@testing-library/react'
import {LanguageProvider} from '@/app/components/Language'
vi.mock('@/lib/locale-server',()=>({getLocale:async()=> 'en'}))
vi.mock('@/lib/supabase-server',()=>({createServerSupabaseClient:async()=>({auth:{getUser:async()=>({data:{user:{id:'u'}}})},from:()=>({select:()=>({not:()=>({order:()=>({limit:async()=>({data:[]})})})})})}),createServiceClient:vi.fn()}))
vi.mock('@/lib/member-access',async(original)=>({...await original<typeof import('@/lib/member-access')>(),getMemberAccess:async()=>({hasActiveMembership:true,adminPreview:false})}))
import Content from '@/app/miembros/contenido/page'
import Tools from '@/app/miembros/herramientas/page'
afterEach(cleanup)
it('translates library headings, interactive card and empty state together',async()=>{
 render(<LanguageProvider locale="en">{await Content()}</LanguageProvider>)
 expect(screen.getByRole('heading',{name:'Exclusive content'})).toBeInTheDocument()
 expect(screen.getByRole('heading',{name:'Explore CBD and THC'})).toBeInTheDocument()
 expect(screen.getByText('Coming soon: we are preparing exclusive content for members.')).toBeInTheDocument()
 expect(screen.queryByText('Biblioteca')).toBeNull()
})
it('translates every tools card including descriptive copy and links',async()=>{
 render(<LanguageProvider locale="en">{await Tools()}</LanguageProvider>)
 for(const text of ['Mi día a día','Bitácora de hábitos','Un momento para reflexionar','Entender mi etiqueta','Convertir datos de etiqueta →']) expect(screen.queryByText(text)).toBeNull()
 expect(screen.getAllByRole('article')).toHaveLength(3)
 expect(screen.getByRole('heading',{name:'Cannabinoid calculator'})).toBeInTheDocument()
})
