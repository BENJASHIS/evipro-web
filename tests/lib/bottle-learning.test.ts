import { readFileSync } from 'node:fs'
import { describe, it, expect, vi } from 'vitest'
import { createLearning, createTapTracker } from '../../private/frasco/learning.js'
function setup(select = vi.fn().mockResolvedValue(true)) {
  document.body.replaceWith(document.createElement('body'))
  document.body.innerHTML = readFileSync('private/frasco/cbd.html', 'utf8')
  const actions = { showGuideStep: select, showGameStep: select, cancelPending: vi.fn(), highlightElement: vi.fn(), showHydrogens: vi.fn() }
  const learning = createLearning(document, actions)
  const click = (id: string) => document.getElementById(id)!.click()
  const content = () => document.getElementById('learning-panel')!.textContent!
  return { learning, actions, click, content }
}
const flush = async () => { await Promise.resolve(); await Promise.resolve() }
describe('guía y Detective del paquete web', () => {
  it('recorre y reinicia guía', async () => {
    const s = setup(); s.click('start-guide'); await flush()
    expect(s.content()).toContain('1/3')
    s.click('learning-next'); await flush(); expect(s.content()).toContain('2/3')
    s.click('learning-next'); await flush(); expect(s.content()).toContain('3/3')
    s.click('learning-next'); await flush(); expect(document.getElementById('learning-panel')!.hidden).toBe(true)
    s.click('start-guide'); await flush(); expect(s.content()).toContain('1/3')
  })
  it('pistas, respuestas, hidrógenos y reinicio', async () => {
    const s = setup(); s.click('start-game'); await flush(); s.click('learning-hint')
    expect(s.content()).toContain('O')
    s.learning.atom(6); expect(s.content()).toContain('Prueba')
    s.click('answer-oxygen'); expect(s.content()).toContain('oxígeno')
    s.click('learning-next'); await flush(); expect(s.content()).toContain('2/3')
    s.click('answer-same'); s.click('learning-next'); await flush(); expect(s.content()).toContain('3/3')
    s.learning.hydrogens(false); expect((document.getElementById('learning-next') as HTMLButtonElement).disabled).toBe(true)
    s.learning.hydrogens(true); expect(s.content()).toContain('visibilidad')
    s.click('learning-next'); await flush(); expect(s.content()).toContain('Completaste')
    s.click('learning-restart'); await flush(); expect(s.content()).toContain('1/3')
  })
  it('Escape devuelve foco; navegación no lo roba', async () => {
    const s = setup(); s.click('start-guide'); await flush()
    document.getElementById('hydrogens')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(document.activeElement?.id).toBe('start-guide'); expect(s.actions.cancelPending).toHaveBeenCalled()
    s.click('start-game'); await flush(); document.getElementById('assemble')!.focus(); s.learning.close(false)
    expect(document.activeElement?.id).toBe('assemble')
  })
  it('cierre durante carga no reabre', async () => {
    let resolve!: (ok: boolean) => void
    const s = setup(vi.fn(() => new Promise<boolean>(r => { resolve = r })))
    s.click('start-game'); s.click('learning-close'); resolve(true); await flush()
    expect(document.getElementById('learning-panel')!.hidden).toBe(true)
    expect(s.actions.cancelPending).toHaveBeenCalled()
  })
  it('fallo bloquea logros; doble clic no salta retos', async () => {
    const failed = setup(vi.fn().mockResolvedValue(false)); failed.click('start-game'); await flush(); failed.learning.atom(8)
    expect(failed.content()).toContain('No pudimos')
    expect((document.getElementById('learning-next') as HTMLButtonElement).disabled).toBe(true)
    const s = setup(); s.click('start-game'); await flush(); s.click('answer-oxygen')
    s.click('learning-next'); s.click('learning-next'); await flush(); expect(s.content()).toContain('2/3')
  })
})
describe('toque molecular', () => {
  const e = (pointerId: number, clientX = 0, clientY = 0) => ({ pointerId, clientX, clientY, button: 0 })
  it('rechaza ida y vuelta, cancelar y multitouch', () => {
    const t = createTapTracker()
    t.down(e(1)); expect(t.up(e(1, 2))).toBe(true)
    t.down(e(1)); t.move(e(1, 30)); expect(t.up(e(1))).toBe(false)
    t.down(e(1)); t.cancel(e(1)); expect(t.up(e(1))).toBe(false)
    t.down(e(1)); t.down(e(2)); expect(t.up(e(2))).toBe(false); expect(t.up(e(1))).toBe(false)
    t.down(e(3)); expect(t.up(e(3))).toBe(true)
  })
})
