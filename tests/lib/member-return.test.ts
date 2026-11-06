import { expect, it } from 'vitest'
import { memberReturnPath, BOTTLE_PATH } from '@/lib/member-return'
it('solo permite volver al visor privado y rechaza destinos externos o alterados',()=>{
  expect(memberReturnPath(BOTTLE_PATH)).toBe(BOTTLE_PATH)
  for(const bad of [null,'https://otro.example','//otro.example','/\\otro.example','javascript:alert(1)',`${BOTTLE_PATH}/../admin`,`${BOTTLE_PATH}?extra=1`])expect(memberReturnPath(bad)).toBe('/miembros')
})
