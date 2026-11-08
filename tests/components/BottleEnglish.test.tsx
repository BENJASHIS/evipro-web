import {readFileSync} from 'node:fs'
import {expect,it,vi} from 'vitest'
import {render,screen,cleanup} from '@testing-library/react'
import {LanguageProvider} from '@/app/components/Language'
import {createLearning} from '@/private/frasco/learning-en.js'
vi.mock('@/lib/supabase-server',()=>({createServerSupabaseClient:async()=>({auth:{getUser:async()=>({data:{user:{id:'u'}}})}})}))
vi.mock('@/lib/member-access',async(original)=>({...await original<typeof import('@/lib/member-access')>(),getMemberAccess:async()=>({hasActiveMembership:true,adminPreview:false})}))
import CalculatorPage from '@/app/miembros/herramientas/calculadora-cannabinoide/page'
const flush=async()=>{await Promise.resolve();await Promise.resolve()}
it('finishes all three molecular challenges in English from its own package',async()=>{
 document.body.innerHTML=''
 document.body.innerHTML=readFileSync('private/frasco/cbd-en.html','utf8')
 const learning=createLearning(document,{showGuideStep:async()=>true,showGameStep:async()=>true,cancelPending:()=>{},highlightElement:()=>{},showHydrogens:()=>{}})
 const click=(id:string)=>document.getElementById(id)!.click()
 click('start-game');await flush()
 expect(document.getElementById('learning-panel')!.textContent).toContain('Molecular detective')
 click('answer-oxygen');click('learning-next');await flush()
 expect(document.getElementById('learning-panel')!.textContent).toContain('2/3')
 click('answer-same');click('learning-next');await flush()
 learning.hydrogens(true);click('learning-next');await flush()
 expect(document.getElementById('learning-panel')!.textContent).toContain('You completed all three challenges')
 document.body.innerHTML=''
})
it('translates the calculator page as well as its existing form',async()=>{
 render(<LanguageProvider locale="en">{await CalculatorPage()}</LanguageProvider>)
 expect(screen.getByRole('heading',{name:'Cannabinoid calculator'})).toBeInTheDocument()
 expect(screen.getByRole('link',{name:'Understand the bottle composition · open the learning resource →'})).toBeInTheDocument()
 cleanup()
})
