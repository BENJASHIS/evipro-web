import { act, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import VisorFrasco from '@/app/miembros/contenido/explora-cbd-thc/VisorFrasco'

it('solo acepta alturas acotadas del iframe propio y del mismo origen',()=>{
  render(<VisorFrasco />)
  const iframe = screen.getByTitle('Explora CBD y THC: visor didáctico') as HTMLIFrameElement
  const send = (height:unknown,origin=window.location.origin,source:MessageEventSource|null=iframe.contentWindow)=>act(()=>window.dispatchEvent(new MessageEvent('message',{origin,source,data:{type:'evipro-visor-height',height}})))
  send(2000,'https://otro.example')
  send(2000,window.location.origin,window)
  for(const height of [NaN,Infinity,-1,0,6001,'1000',null])send(height)
  expect(iframe.style.height).toBe('1500px')
  send(2100.2)
  expect(iframe.style.height).toBe('2101px')
})
