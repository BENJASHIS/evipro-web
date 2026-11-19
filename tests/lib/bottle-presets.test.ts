import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const doc = new DOMParser().parseFromString(readFileSync('private/frasco/index.html', 'utf8'), 'text/html')

it('cinco ejemplos, en el orden de Carlos, con THC primero', () => {
  const botones = [...doc.querySelectorAll<HTMLButtonElement>('[data-thc]')]
  expect(botones.map(b => [b.dataset.thc, b.dataset.cbd])).toEqual([['0', '10'], ['0.9', '10'], ['2.5', '5'], ['5', '5'], ['10', '5']])
  expect(botones.map(b => b.textContent!.replace(/\s+/g, ' ').trim())).toEqual([
    'CBD 10 % Solo CBD', 'THC 0.9 % : CBD 10 % 1:11 THC:CBD · CBD dominante', 'THC 2.5 % : CBD 5 % 1:2 THC:CBD · CBD dominante',
    'THC 5 % : CBD 5 % 1:1 THC:CBD · balanceado', 'THC 10 % : CBD 5 % 2:1 THC:CBD · THC dominante'])
  expect(doc.getElementById('restore-v04')).toBeNull()
})
