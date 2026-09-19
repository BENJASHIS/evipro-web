import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { it, expect } from 'vitest'
import english from '@/lib/locales/en.json'

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? sources(join(dir, entry.name)) : entry.name.endsWith('.tsx') ? [join(dir, entry.name)] : [])
}

it('every literal marked for translation has an English entry', () => {
  const missing: string[] = []
  for (const file of sources('app')) {
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    function visit(node: ts.Node) {
      if (ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === 'T') {
        for (const child of node.children) {
          const value = ts.isJsxText(child) ? child.text : ts.isJsxExpression(child) && child.expression && ts.isStringLiteral(child.expression) ? child.expression.text : ''
          const key = value.replace(/\s+/g, ' ').trim()
          if (key && !Object.hasOwn(english, key)) missing.push(`${file}: ${key}`)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  expect(missing).toEqual([])
})
