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
    const text = readFileSync(file, 'utf8')
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    // Algunos textos llegan a <T> como parámetro: label="…", label: '…' o t('…').
    const translatedProps = new Set([...text.matchAll(/<T>\{(?:\w+\.)?(\w+)\}<\/T>/g)].map(match=>match[1]))
    function literalBranches(node: ts.Node): string[] {
      if(ts.isStringLiteralLike(node)) return [node.text]
      if(ts.isConditionalExpression(node)) return [...literalBranches(node.whenTrue),...literalBranches(node.whenFalse)]
      return []
    }
    const passedAsProp = (value: string) => {
      const key = value.replace(/\s+/g, ' ').trim()
      if (/[a-záéíóúñ]{3}/.test(key) && !Object.hasOwn(english, key)) missing.push(`${file}: ${key}`)
    }
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && node.expression.getText(source) === 't' && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
        passedAsProp(node.arguments[0].text)
      }
      if (translatedProps.size) {
        const named = ts.isJsxAttribute(node) || ts.isPropertyAssignment(node)
        const isPropName = named && translatedProps.has(node.name.getText(source))
        const value = isPropName ? node.initializer : undefined
        if (value && ts.isStringLiteralLike(value)) passedAsProp(value.text)
      }
      if (ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === 'T') {
        for (const child of node.children) {
          const values = ts.isJsxText(child) ? [child.text] : ts.isJsxExpression(child) && child.expression ? literalBranches(child.expression) : []
          for (const value of values) {
          const key = value.replace(/\s+/g, ' ').trim()
          if (key && !Object.hasOwn(english, key)) missing.push(`${file}: ${key}`)
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  expect(missing).toEqual([])
})
