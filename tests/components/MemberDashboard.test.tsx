import {render,screen,cleanup} from '@testing-library/react'
import {afterEach,expect,it,vi} from 'vitest'
import {LanguageProvider} from '@/app/components/Language'
vi.mock('@/lib/locale-server',()=>({getLocale:async()=> 'en'}))
vi.mock('@/lib/supabase-server',()=>({createServerSupabaseClient:async()=>({auth:{getUser:async()=>({data:{user:{id:'u'}}})},from:(table:string)=>{
 const data=table==='profiles'?{full_name:'Test'}:table==='subscriptions'?null:table==='counseling_bookings'?['presencial','virtual','video',null].map((modality,i)=>({id:String(i),modality,cancelled_at:'2026-11-01',cancel_reason:'Texto original',slot_date:'2026-11-03',price_soles:17})):[]
 return {select(){return this},eq(){return this},in(){return this},order(){return this},limit(){return this},single:async()=>({data}),maybeSingle:async()=>({data}),then:(resolve:(value:{data:unknown})=>unknown)=>Promise.resolve({data}).then(resolve)}
}})}))
import Page from '@/app/miembros/page'
afterEach(cleanup)
it('renders current, legacy and missing booking modalities in English',async()=>{
 render(<LanguageProvider locale="en">{await Page()}</LanguageProvider>)
 expect(screen.getByText('In person')).toBeInTheDocument()
 expect(screen.getByText('Online consultation')).toBeInTheDocument()
 expect(screen.getByText('Consultation')).toBeInTheDocument()
 expect(screen.getAllByText(/Texto original/)).toHaveLength(4)
})
