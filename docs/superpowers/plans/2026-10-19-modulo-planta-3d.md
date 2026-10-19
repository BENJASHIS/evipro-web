# Módulo educativo 1 «¿Qué hay en la planta?» — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir en el área de miembros el módulo educativo «¿Qué hay en la planta?»: moléculas 3D reales, simulador de descarboxilación según Wang 2016, acceso completo para la Membresía EVIPro y parcial para Básica y Turista, contenido trazable y bilingüe.

**Architecture:** La lógica pura vive en `lib/educacion/` (acceso, moléculas, cinética, registro de contenido) con pruebas unitarias. Una página de servidor decide el nivel de acceso y entrega a los componentes cliente **solo** las secciones permitidas como props. El visor 3D carga `3dmol` bajo demanda y cae a imagen 2D más texto si no puede.

**Tech Stack:** Next.js 16.3.3 (App Router, build con webpack), React 19.2.4, TypeScript, Tailwind, Vitest + Testing Library (jsdom), `3dmol` 2.5.5.

**Spec:** `docs/superpowers/specs/2026-10-19-modulo-planta-3d-design.md`. Léelo completo antes de empezar: este plan argumenta desde él.

## Global Constraints

- Antes de escribir código Next, leer la guía pertinente en `node_modules/next/dist/docs/` (exigido por `AGENTS.md`). La carga de librerías externas sigue `01-app/02-guides/lazy-loading.md` § «Loading External Libraries» (`await import()` en el cliente).
- `3dmol` **exactamente 2.5.5** (`npm install 3dmol@2.5.5 --save-exact`), importado solo con `await import('3dmol')` dentro de un efecto cliente. Nunca en el servidor ni en el nivel superior de un módulo.
- Sin cambios en Supabase: sin migraciones, rutas de API ni secretos.
- Ningún texto da dosis (mg, ml, gotas), recomienda productos o marcas, ni usa verbos de instrucción para calentar.
- Todo literal de interfaz en `app/**/*.tsx` va dentro de `<T>` (`app/components/Language`) con su entrada en `lib/locales/en.json`. El contenido científico va en el registro `{ es, en }` de la Tarea 4, no en `<T>`.
- El color nunca es el único portador de significado: toda parte resaltada lleva etiqueta de texto.
- Commits en español, con el estilo del repo (`feat(educacion): …`) y la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Sin push** a `main` sin autorización explícita de Carlos. Vercel publica solo.
- Hasta que Carlos revise los textos (`REVISION.version === null`), el módulo solo es visible para administradores.

## Review Focus

1. **Celular sin WebGL, red lenta o archivo de molécula ausente:** el visor no se queda «cargando» para siempre; muestra la imagen 2D y la descripción. → prueba en la Tarea 5.
2. **Cambio de idioma con la página abierta:** cifras con formato del idioma («7,9 %» en español, «7.9%» en inglés) e igual contenido en ambos. → pruebas en las Tareas 3 y 4.
3. **Extremos del deslizador** (0 y 60 min) y cambio de temperatura con tiempo 0: 100 % de THCA, sin `NaN` ni valores fuera de 0–100. → prueba en la Tarea 3.
4. **Módulo sin publicar:** un administrador lo ve con aviso de borrador; un miembro, aunque tenga la Membresía EVIPro, no lo ve ni encuentra la tarjeta. → pruebas en las Tareas 1 y 8.
5. **Uso solo con teclado o lector de pantalla:** temperatura como grupo de radios nativo, tiempo como deslizador nativo etiquetado, repaso con botones. → prueba en las Tareas 6 y 7.

---

### Task 1: Nivel de acceso y publicación

**Files:**
- Create: `lib/educacion/acceso-modulo.ts`
- Test: `tests/lib/educacion-acceso.test.ts`

**Interfaces:**
- Consumes: `MemberAccess` de `lib/member-access.ts` (campos `isAdmin`, `hasActiveMembership`, `planType`).
- Produces:
  - `export type NivelModulo = 'completo' | 'parcial' | 'sin_acceso'`
  - `export function nivelModulo(access: Pick<MemberAccess, 'isAdmin' | 'hasActiveMembership' | 'planType'>): NivelModulo`
  - `export function moduloVisible(access: Pick<MemberAccess, 'isAdmin'>, publicado: boolean): boolean`

- [ ] **Step 1: Write the failing test**

```ts
import { buildMemberAccess } from '@/lib/member-access'
import { ADMIN_EMAILS } from '@/lib/auth'
import { nivelModulo, moduloVisible } from '@/lib/educacion/acceso-modulo'

const socio = (type: string | null) => buildMemberAccess({ id: 'u', email: 'p@example.com' }, type ? { id: 's', membership_plans: { type } } : null)
const admin = buildMemberAccess({ id: 'a', email: ADMIN_EMAILS[0] }, null)

it('Membresía EVIPro ve todo', () => expect(nivelModulo(socio('evipro'))).toBe('completo'))
it.each(['basica', 'turista_inicio', 'turista_plus', 'acceso'])('%s ve la parte abierta', t => expect(nivelModulo(socio(t))).toBe('parcial'))
it('sin membresía no accede', () => expect(nivelModulo(socio(null))).toBe('sin_acceso'))
it('admin sin membresía ve todo', () => expect(nivelModulo(admin)).toBe('completo'))
it('sin publicar solo lo ve el admin', () => {
  expect(moduloVisible(socio('evipro'), false)).toBe(false)
  expect(moduloVisible(admin, false)).toBe(true)
  expect(moduloVisible(socio('basica'), true)).toBe(true)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/educacion-acceso.test.ts` — Expected: FAIL (módulo inexistente).

- [ ] **Step 3: Implement `nivelModulo` y `moduloVisible` en `lib/educacion/acceso-modulo.ts`**

Orden de reglas: admin → `completo`; sin membresía activa → `sin_acceso`; `planType === 'evipro'` → `completo`; cualquier otro → `parcial`. No hay trato especial para planes retirados (spec §3).

- [ ] **Step 4: Run test to verify it passes** — `npx vitest run tests/lib/educacion-acceso.test.ts` — PASS.

- [ ] **Step 5: Commit** — `git add lib/educacion/acceso-modulo.ts tests/lib/educacion-acceso.test.ts && git commit -m "feat(educacion): nivel de acceso y publicación del módulo de la planta"`

---

### Task 2: Moléculas verificadas y resaltado de átomos

**Files:**
- Create: `public/moleculas/<id>.sdf` y `public/moleculas/<id>.png` (18 moléculas)
- Create: `lib/educacion/moleculas.ts` (catálogo), `lib/educacion/resaltado.ts` (helpers de átomos)
- Test: `tests/lib/educacion-moleculas.test.ts`

**Interfaces:**
- Produces:
  - `export type MoleculaId = 'thc' | 'cbd' | 'thca' | 'cbda' | 'cbga' | 'cbca' | 'cbg' | 'cbc' | 'cbn' | 'cbgva' | 'thcva' | 'thcv' | 'limoneno' | 'linalool' | 'mirceno' | 'cariofileno' | 'kuromanina' | 'cannflavina_a'`
  - `export const MOLECULAS: Record<MoleculaId, { nombre: { es: string; en: string }; cid: number; formula: string }>`
  - `export const rutaSdf = (id: MoleculaId) => \`/moleculas/${id}.sdf\``; `export const rutaPng = (id: MoleculaId) => \`/moleculas/${id}.png\``
  - En `resaltado.ts`: `export type AtomoSimple = { elem: string; bonds: number[] }`
  - En `resaltado.ts`: `export function atomosAcido(atomos: AtomoSimple[]): number[]`: el carbono con dos oxígenos vecinos, esos oxígenos y los hidrógenos unidos a ellos.
  - En `resaltado.ts`: `export function atomosAnilloOxigeno(atomos: AtomoSimple[]): number[]`: cada oxígeno unido a dos carbonos, más esos carbonos.

- [ ] **Step 1: Descargar los archivos desde PubChem**

CIDs y fórmulas exactos: spec §8. Para cada molécula, primero verificar con `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/<CID>/property/Title,MolecularFormula/JSON` que la fórmula coincide. Luego descargar `…/cid/<CID>/SDF?record_type=3d` → `public/moleculas/<id>.sdf` y `…/cid/<CID>/PNG` → `public/moleculas/<id>.png`. Si una fórmula no coincide, detenerse y avisar (el CID 3081999 ya falló para el CBCA).

- [ ] **Step 2: Write the failing test**

```ts
import { readFileSync, existsSync } from 'node:fs'
import { MOLECULAS } from '@/lib/educacion/moleculas'
import { atomosAcido, atomosAnilloOxigeno } from '@/lib/educacion/resaltado'

it.each(Object.entries(MOLECULAS))('%s: el SDF es del CID declarado y hay imagen', (id, m) => {
  const sdf = readFileSync(`public/moleculas/${id}.sdf`, 'utf8')
  expect(sdf.split('\n')[0].trim()).toBe(String(m.cid))       // PubChem escribe el CID en la primera línea
  expect(existsSync(`public/moleculas/${id}.png`)).toBe(true)
})
it('fórmulas de la spec', () => {
  expect(MOLECULAS.thc).toMatchObject({ cid: 16078, formula: 'C21H30O2' })
  expect(MOLECULAS.cbd).toMatchObject({ cid: 644019, formula: 'C21H30O2' })
  expect(MOLECULAS.cbca).toMatchObject({ cid: 3084339, formula: 'C22H30O4' })
  expect(MOLECULAS.thcv).toMatchObject({ cid: 93147, formula: 'C19H26O2' })
})
// Ácido acético mínimo: C0–C1(=O2)(O3–H4)
const acetico = [{ elem: 'C', bonds: [1] }, { elem: 'C', bonds: [0, 2, 3] }, { elem: 'O', bonds: [1] }, { elem: 'O', bonds: [1, 4] }, { elem: 'H', bonds: [3] }]
it('resalta el grupo ácido', () => expect(atomosAcido(acetico).sort()).toEqual([1, 2, 3, 4]))
// Éter mínimo: C0–O1–C2
it('resalta el oxígeno del anillo con sus carbonos', () => expect(atomosAnilloOxigeno([{ elem: 'C', bonds: [1] }, { elem: 'O', bonds: [0, 2] }, { elem: 'C', bonds: [1] }]).sort()).toEqual([0, 1, 2]))
```

- [ ] **Step 3: Run test** — `npx vitest run tests/lib/educacion-moleculas.test.ts` — FAIL.
- [ ] **Step 4: Implement `MOLECULAS` (nombres es/en, CID y fórmula de la spec §8) y los dos helpers.**
- [ ] **Step 5: Run test** — PASS.
- [ ] **Step 6: Commit** — `feat(educacion): moléculas de PubChem verificadas y resaltado de átomos`

---

### Task 3: Cinética de descarboxilación (Wang 2016)

**Files:**
- Create: `lib/educacion/descarboxilacion.ts`
- Test: `tests/lib/educacion-descarboxilacion.test.ts`

**Interfaces:**
- Produces:
  - `export const TEMPERATURAS = [80, 95, 110, 130, 145] as const`; `export type Temperatura = typeof TEMPERATURAS[number]`
  - `export function constanteTHCA(t: Temperatura): { k: number; origen: 'medido' | 'estimado' }`: k en s⁻¹.
  - `export function fraccionTHCARestante(t: Temperatura, minutos: number): number`: en [0, 1]; los minutos se acotan a [0, 60].
  - `export const CASI_CERO_MEDIDO: Partial<Record<Temperatura, number>> = { 110: 30, 130: 9, 145: 6 }`: minutos, texto de resultados de Wang.
  - `export const PERDIDA_TOTAL_110_PCT = 7.94`: Tabla 1.
  - `export const FUENTE_WANG = { cita: 'Wang M et al. Cannabis Cannabinoid Res 2016', pmid: '28861498', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5549281/' }`
  - `export function formatoPorcentaje(valor: number, locale: 'es' | 'en', decimales?: number): string`: con `Intl.NumberFormat`; español con coma decimal y espacio antes de «%».

- [ ] **Step 1: Write the failing test**

```ts
import { constanteTHCA, fraccionTHCARestante, CASI_CERO_MEDIDO, formatoPorcentaje } from '@/lib/educacion/descarboxilacion'

it('constantes medidas de la Tabla 2', () => {
  expect(constanteTHCA(80)).toEqual({ k: 0.18e-3, origen: 'medido' })
  expect(constanteTHCA(95)).toEqual({ k: 0.66e-3, origen: 'medido' })
  expect(constanteTHCA(110)).toEqual({ k: 1.83e-3, origen: 'medido' })
})
it('130 y 145 °C estimadas por Arrhenius (Ea 88 kJ/mol) y rotuladas', () => {
  expect(constanteTHCA(130).origen).toBe('estimado')
  expect(constanteTHCA(130).k).toBeCloseTo(7.2e-3, 4)
  expect(constanteTHCA(145).k).toBeCloseTo(18.5e-3, 3)
})
it('coincide con los tiempos medidos de casi cero', () => {
  for (const [t, min] of Object.entries(CASI_CERO_MEDIDO)) expect(fraccionTHCARestante(Number(t) as 110, min!)).toBeLessThan(0.05)
})
it('bajo 100 °C no se completa en 60 min', () => {
  expect(fraccionTHCARestante(95, 60)).toBeGreaterThan(0.05)
  expect(fraccionTHCARestante(80, 60)).toBeGreaterThan(0.4)
})
it('extremos del tiempo sin NaN', () => {
  expect(fraccionTHCARestante(145, 0)).toBe(1)
  expect(fraccionTHCARestante(110, -5)).toBe(1)
  expect(fraccionTHCARestante(110, 999)).toBe(fraccionTHCARestante(110, 60))
})
it('formato por idioma', () => {
  expect(formatoPorcentaje(7.94, 'es', 1)).toBe('7,9 %')
  expect(formatoPorcentaje(7.94, 'en', 1)).toBe('7.9%')
})
```

- [ ] **Step 2: Run test** — `npx vitest run tests/lib/educacion-descarboxilacion.test.ts` — FAIL.
- [ ] **Step 3: Implement.** Arrhenius desde 110 °C: `k(T) = 1.83e-3 · exp(−(88000 / 8.314) · (1/(T+273.15) − 1/383.15))`, solo para 130 y 145. Primer orden: `exp(−k · 60 · minutos)`. Si `Intl` produce un espacio no separable en español, normalizarlo para que el resultado sea `'7,9 %'` exacto o ajustar la prueba a ` `. Elegir una opción y mantenerla.
- [ ] **Step 4: Run test** — PASS.
- [ ] **Step 5: Commit** — `feat(educacion): cinética de descarboxilación del THCA según Wang 2016`

---

### Task 4: Registro de contenido trazable y bilingüe

**Files:**
- Create: `lib/educacion/contenido-planta.ts`
- Test: `tests/lib/educacion-contenido.test.ts`

**Interfaces:**
- Consumes: `NivelModulo` (Tarea 1), `MoleculaId` (Tarea 2), `FUENTE_WANG` (Tarea 3).
- Produces:
  - `export type TipoAfirmacion = 'quimica' | 'personas' | 'laboratorio' | 'orientacion'`
  - `export type Fuente = { cita: string; pmid?: string; doi?: string; url?: string }`
  - `export type Afirmacion = { id: string; tipo: TipoAfirmacion; es: string; en: string; fuente?: Fuente; motivo?: string; revisado?: string }`. El responsable y la fecha de cada afirmación (spec §5) se toman de `REVISION`, porque Carlos revisa todo junto. `revisado` (`'AAAA.MM.DD'`) solo se agrega si una afirmación se actualiza después por separado: `// ponytail: revisión común, fecha propia solo al actualizar una afirmación`.
  - `export type SeccionId = 'seguridad' | 'terpenos' | 'flavonoides' | 'arbol' | 'calor' | 'isomeros' | 'degradacion' | 'menores'`
  - `export type Seccion = { id: SeccionId; parte: 'todos' | 'abierta' | 'evipro'; titulo: { es: string; en: string }; afirmaciones: Afirmacion[]; moleculas: MoleculaId[] }`
  - `export type Pregunta = { id: string; parte: 'todos' | 'abierta' | 'evipro'; enunciado: { es: string; en: string }; opciones: { es: string; en: string }[]; correcta: number; explicacion: { es: string; en: string } }`
  - `export const SECCIONES: Seccion[]`, `export const PREGUNTAS: Pregunta[]`
  - `export const REVISION: { responsable: 'Dr. Carlos Jara'; version: string | null }`: empieza en `null`.
  - `export function seccionesPara(nivel: NivelModulo): Seccion[]`: completo → todas; parcial → `todos` + `abierta`; sin_acceso → `[]`.
  - `export function preguntasPara(nivel: NivelModulo): Pregunta[]`: misma regla.
  - `export function fuentesDe(secciones: Seccion[]): Fuente[]`: únicas, en orden de aparición.

- [ ] **Step 1: Verificar las cuatro fuentes pendientes (spec §11, puntos 1 a 4)** con PubMed E-utilities o Crossref, leyendo el resumen. Incluir una afirmación pendiente **solo** si su fuente se confirma; si no, omitirla. Anotar el resultado en el mensaje del commit.

- [ ] **Step 2: Redactar el contenido** siguiendo la spec §4 al pie de la letra: frases fijadas (limoneno, mirceno, «algunos flavonoides dan color», «misma fórmula molecular, distinta estructura»), tipos y fuentes de cada afirmación, recuadro de seguridad con `parte: 'todos'`. Tres preguntas:
  - `todos`: ¿cuál te puede volar, THC o CBD?
  - `abierta`: ¿qué aportan los terpenos?
  - `evipro`: ¿qué hace el calor con el THCA?

  Menores: una afirmación **por efecto o indicación** (por ejemplo «CBN y sueño: pocos estudios en personas, resultados no concluyentes»; «THCV: puede reducir algunos efectos del THC», revisión PMID 42708292). Solo con fuentes verificadas; un efecto sin fuente verificable no se incluye.

  Moléculas por sección: terpenos `[limoneno, linalool, mirceno, cariofileno]`; flavonoides `[kuromanina]`; árbol `[cbga, thca, cbda, cbca, cbgva, thcva]`; calor `[thca, thc]`; isómeros `[thc, cbd]`; degradación `[thc, cbn]`; menores `[cbg, cbn, cbc, thcv]`. Cada afirmación verificable se cita con PMID, DOI o URL de PubChem ya comprobados.

- [ ] **Step 3: Write the failing test**

```ts
import { SECCIONES, PREGUNTAS, REVISION, seccionesPara, preguntasPara, fuentesDe } from '@/lib/educacion/contenido-planta'

const todas = SECCIONES.flatMap(s => s.afirmaciones)
it('ids únicos', () => expect(new Set(todas.map(a => a.id)).size).toBe(todas.length))
it('paridad español e inglés', () => todas.forEach(a => { expect(a.es.trim()).not.toBe(''); expect(a.en.trim()).not.toBe('') }))
it('evidencia con fuente; orientación con motivo', () => todas.forEach(a =>
  a.tipo === 'orientacion' ? expect(a.motivo?.trim()).toBeTruthy() : expect(a.fuente && (a.fuente.pmid || a.fuente.doi || a.fuente.url)).toBeTruthy()))
it('sin dosis ni instrucciones de calentar', () => todas.forEach(a => {
  expect(`${a.es} ${a.en}`).not.toMatch(/\b\d+\s?(mg|ml)\b|\bgotas?\b|\bdrops?\b/i)
  expect(`${a.es} ${a.en}`).not.toMatch(/\b(calienta|hornea|precalienta|heat it|bake)\b/i)
}))
it('la seguridad la ve todo nivel con acceso', () => {
  expect(SECCIONES.find(s => s.id === 'seguridad')!.parte).toBe('todos')
  expect(seccionesPara('parcial').map(s => s.id)).toEqual(expect.arrayContaining(['seguridad', 'terpenos', 'flavonoides']))
  expect(seccionesPara('parcial').some(s => s.parte === 'evipro')).toBe(false)
  expect(seccionesPara('sin_acceso')).toEqual([])
})
it('repaso por nivel', () => {
  expect(preguntasPara('parcial').map(p => p.parte).sort()).toEqual(['abierta', 'todos'])
  expect(preguntasPara('completo')).toHaveLength(3)
  PREGUNTAS.forEach(p => expect(p.correcta).toBeLessThan(p.opciones.length))
})
it('fuentes sin duplicados', () => {
  const f = fuentesDe(SECCIONES)
  expect(new Set(f.map(x => x.pmid ?? x.doi ?? x.url)).size).toBe(f.length)
})
it('nace sin publicar', () => expect(REVISION.version).toBeNull())
```

- [ ] **Step 4: Run test** — `npx vitest run tests/lib/educacion-contenido.test.ts` — FAIL, luego implementar hasta PASS.
- [ ] **Step 5: Commit** — `feat(educacion): contenido trazable y bilingüe del módulo de la planta`

---

### Task 5: Visor molecular 3D con respaldo

**Files:**
- Modify: `package.json`, `package-lock.json` (`npm install 3dmol@2.5.5 --save-exact`)
- Create: `app/miembros/contenido/que-hay-en-la-planta/VisorMolecula.tsx`
- Test: `tests/components/VisorMolecula.test.tsx`

**Interfaces:**
- Consumes: `MOLECULAS`, `rutaSdf`, `rutaPng`, `atomosAcido`, `atomosAnilloOxigeno` (Tarea 2).
- Produces: `export default function VisorMolecula(props: { molecula: MoleculaId; resaltar?: 'acido' | 'anillo'; etiquetaResaltado?: string; alto?: number }): JSX.Element` (componente cliente).

Comportamiento (spec §6):
- Monta un contenedor. Solo cuando entra en pantalla (`IntersectionObserver`) hace `await import('3dmol')`. El namespace puede venir como módulo o en `.default`: aceptar ambos.
- Descarga el SDF y dibuja barras y esferas sin hidrógenos, salvo los resaltados. La parte resaltada va en naranja `#ff9f0a` con la etiqueta visible `etiquetaResaltado`.
- Gira solo si `matchMedia('(prefers-reduced-motion: reduce)')` no coincide.
- Si no hay `IntersectionObserver` o WebGL, o falla la importación o el `fetch`, o pasan 8 s sin dibujar, muestra `<img src={rutaPng(id)} alt={nombre}>` y una línea de texto con nombre y fórmula.
- Botón «Pantalla completa» (`element.requestFullscreen`), con texto en `<T>`. Se oculta si la API no existe.

Referencia de comportamiento: boceto A de la sesión de diseño (spec §6). El método `setStyle({ index: [...] }, …)` de 3Dmol funcionó en el boceto para resaltar.

- [ ] **Step 1: Write the failing test** (jsdom no tiene WebGL ni `IntersectionObserver`):

```tsx
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/app/components/Language'
import VisorMolecula from '@/app/miembros/contenido/que-hay-en-la-planta/VisorMolecula'

it('sin 3D muestra imagen 2D y texto', async () => {
  render(<LanguageProvider locale="es"><VisorMolecula molecula="thc" /></LanguageProvider>)
  expect(await screen.findByRole('img', { name: /THC|tetrahidrocannabinol/i })).toHaveAttribute('src', '/moleculas/thc.png')
  expect(screen.getByText(/C21H30O2/)).toBeInTheDocument()
})
it('si la librería falla, también cae al respaldo', async () => {
  vi.stubGlobal('IntersectionObserver', class { constructor(cb: IntersectionObserverCallback) { setTimeout(() => cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never)) } observe() {} disconnect() {} })
  vi.doMock('3dmol', () => { throw new Error('sin red') })
  render(<LanguageProvider locale="es"><VisorMolecula molecula="cbd" /></LanguageProvider>)
  expect(await screen.findByRole('img', { name: /CBD|cannabidiol/i })).toBeInTheDocument()
  vi.unstubAllGlobals()
})
```

- [ ] **Step 2: Run test** — `npx vitest run tests/components/VisorMolecula.test.tsx` — FAIL.
- [ ] **Step 3: Implement** el componente y agregar a `lib/locales/en.json` sus literales `<T>`.
- [ ] **Step 4: Run test** — PASS. Además, `npx vitest run tests/i18n-catalogue.test.ts` — PASS.
- [ ] **Step 5: Commit** — `feat(educacion): visor molecular 3D con carga diferida y respaldo 2D`

---

### Task 6: Simulador de calor y tiempo

**Files:**
- Create: `app/miembros/contenido/que-hay-en-la-planta/SimuladorCalor.tsx`
- Test: `tests/components/SimuladorCalor.test.tsx`

**Interfaces:**
- Consumes: `TEMPERATURAS`, `constanteTHCA`, `fraccionTHCARestante`, `CASI_CERO_MEDIDO`, `PERDIDA_TOTAL_110_PCT`, `FUENTE_WANG`, `formatoPorcentaje` (Tarea 3); `VisorMolecula` (Tarea 5); `useLanguage` y `T`.
- Produces: `export default function SimuladorCalor(): JSX.Element` (cliente, sin props).

Comportamiento (spec §4.3.2):
- Temperatura: `role="radiogroup"` con cinco radios nativos, inicial 110 °C. Tiempo: `<input type="range" min=0 max=60>` con etiqueta «Tiempo (min)», inicial 0.
- Muestra «THCA que queda: X %» (`formatoPorcentaje` con un decimal si el valor es menor que 10 y sin decimales si no: «3,7 %», «100 %»), la marca «medido» o «estimado» según `constanteTHCA(t).origen`, y si existe `CASI_CERO_MEDIDO[t]`, la nota «En el estudio, casi cero a los N min».
- A 80 y 95 °C: «En el estudio no se completó en 60 min».
- El visor muestra `thca` con `resaltar="acido"` y etiqueta «grupo ácido · sale CO₂» mientras queda ≥ 50 %, y `thc` debajo de 50 %.
- Siempre visibles: las condiciones del experimento (extractos de cannabis, horno al vacío, sin oxígeno ni luz), «a 110 °C, cerca de 92 % se recuperó como THC» (derivado de `PERDIDA_TOTAL_110_PCT`) y la cita de Wang.
- Ningún verbo de instrucción.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageProvider } from '@/app/components/Language'
import SimuladorCalor from '@/app/miembros/contenido/que-hay-en-la-planta/SimuladorCalor'

const montar = (locale: 'es' | 'en' = 'es') => render(<LanguageProvider locale={locale}><SimuladorCalor /></LanguageProvider>)

it('110 °C y 30 min: casi cero, medido', () => {
  montar()
  fireEvent.change(screen.getByRole('slider', { name: /tiempo/i }), { target: { value: '30' } })
  expect(screen.getByText(/THCA que queda: 3,7 %/)).toBeInTheDocument()
  expect(screen.getByText(/medido/i)).toBeInTheDocument()
})
it('130 °C se rotula estimado', () => {
  montar()
  fireEvent.click(screen.getByRole('radio', { name: /130/ }))
  expect(screen.getByText(/estimado/i)).toBeInTheDocument()
})
it('tiempo 0 es 100 % en cualquier temperatura', () => {
  montar()
  fireEvent.click(screen.getByRole('radio', { name: /145/ }))
  expect(screen.getByText(/THCA que queda: 100 %/)).toBeInTheDocument()
})
it('condiciones del experimento siempre visibles', () => {
  montar()
  expect(screen.getByText(/horno al vacío/i)).toBeInTheDocument()
})
it('en inglés usa punto decimal', () => {
  montar('en')
  fireEvent.change(screen.getByRole('slider', { name: /time/i }), { target: { value: '30' } })
  expect(screen.getByText(/3\.7%/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test** — `npx vitest run tests/components/SimuladorCalor.test.tsx` — FAIL.
- [ ] **Step 3: Implement** y agregar sus literales a `en.json`. Plantillas con `<T values={…}>`, por ejemplo `«THCA que queda: {pct}»`.
- [ ] **Step 4: Run test** — PASS. `npx vitest run tests/i18n-catalogue.test.ts` — PASS.
- [ ] **Step 5: Commit** — `feat(educacion): simulador de calor y tiempo con datos medidos y estimados`

---

### Task 7: Mini repaso

**Files:**
- Create: `app/miembros/contenido/que-hay-en-la-planta/Repaso.tsx`
- Test: `tests/components/Repaso.test.tsx`

**Interfaces:**
- Consumes: `Pregunta` (Tarea 4), `useLanguage`, `T`.
- Produces: `export default function Repaso(props: { preguntas: Pregunta[] }): JSX.Element` (cliente). No guarda nada.

- [ ] **Step 1: Write the failing test**

```tsx
import type { Pregunta } from '@/lib/educacion/contenido-planta'
const p: Pregunta = { id: 'q', parte: 'todos', enunciado: { es: '¿Cuál te puede volar?', en: 'Which one can get you high?' },
  opciones: [{ es: 'THC', en: 'THC' }, { es: 'CBD', en: 'CBD' }], correcta: 0,
  explicacion: { es: 'El THC es intoxicante; el CBD no.', en: 'THC is intoxicating; CBD is not.' } }

it('responder muestra si acertó y la explicación', () => {
  render(<LanguageProvider locale="es"><Repaso preguntas={[p]} /></LanguageProvider>)
  fireEvent.click(screen.getByRole('button', { name: 'CBD' }))
  expect(screen.getByText(/no es correcta|incorrect/i)).toBeInTheDocument()
  expect(screen.getByText('El THC es intoxicante; el CBD no.')).toBeInTheDocument()
})
it('usa el idioma activo', () => {
  render(<LanguageProvider locale="en"><Repaso preguntas={[p]} /></LanguageProvider>)
  expect(screen.getByText('Which one can get you high?')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run** — FAIL. **Step 3: Implement** (botones nativos; mensaje de acierto o error con `<T>`) y agregar los literales a `en.json`. **Step 4: Run** — PASS, también el catálogo i18n.
- [ ] **Step 5: Commit** — `feat(educacion): mini repaso del módulo de la planta`

---

### Task 8: Página, composición por nivel y tarjeta en Contenido

**Files:**
- Create: `app/miembros/contenido/que-hay-en-la-planta/page.tsx` (servidor)
- Create: `app/miembros/contenido/que-hay-en-la-planta/ModuloPlanta.tsx` (cliente)
- Modify: `app/miembros/contenido/page.tsx` (tarjeta destacada al inicio)
- Modify: `lib/locales/en.json`
- Test: `tests/components/ModuloPlanta.test.tsx`

**Interfaces:**
- Consumes: Tareas 1, 3 (`FUENTE_WANG`), 4, 5, 6, 7; `getMemberAccess` y `createServerSupabaseClient`.
- Produces:
  - `ModuloPlanta(props: { nivel: Exclude<NivelModulo, 'sin_acceso'>; secciones: Seccion[]; preguntas: Pregunta[]; fuentes: Fuente[]; revision: { responsable: string; version: string | null }; adminPreview: boolean })`
  - `ModuloPlanta` **no importa** `contenido-planta.ts`: renderiza solo lo que recibe. Así el contenido EVIPro no viaja al cliente en el nivel parcial.

Comportamiento:
- **`page.tsx`:**
  - Sin usuario → `redirect('/login')`.
  - `!moduloVisible(access, REVISION.version !== null)` → `redirect('/miembros/contenido')`.
  - `sin_acceso` → el patrón de Herramientas («Esta zona se activa con una membresía vigente.» + `Ver membresías →` a `/planes#membresias`).
  - Si no, `<ModuloPlanta nivel secciones={seccionesPara(nivel)} preguntas={preguntasPara(nivel)} fuentes={fuentesDe(seccionesPara(nivel))} revision={REVISION} adminPreview={access.adminPreview} />`.
- **`ModuloPlanta`**, en este orden:
  1. Aviso «Borrador · pendiente de revisión médica» si `revision.version === null`. Aviso «Modo admin» si `adminPreview`.
  2. Recuadro de seguridad (sección `seguridad`).
  3. Secciones abiertas con sus visores.
  4. La sección `calor` incluye `<SimuladorCalor />`; las secciones con `resaltar` usan `VisorMolecula`. Isómeros: `thc` con `resaltar="anillo"` y etiqueta «anillo cerrado», y `cbd` con etiqueta de texto «anillo abierto».
  5. Si `nivel === 'parcial'`: vista previa bloqueada (título «Los cannabinoides», una línea de descripción, enlace «Ver Membresía EVIPro →» a `/planes#membresias`).
  6. Cada afirmación con su etiqueta de tipo: Química · Estudio en personas · Estudio de laboratorio o animales · Orientación. Para orientación: «Orientación del equipo médico».
  7. `<Repaso />`, la lista de fuentes con enlace (PMID → `https://pubmed.ncbi.nlm.nih.gov/<pmid>/`; DOI → `https://doi.org/<doi>`; o `url`) y el sello «Revisado por {responsable} · versión {version}», solo si la versión no es `null`.
- **Tarjeta en `contenido/page.tsx`:** se muestra si `moduloVisible(access, REVISION.version !== null)`. Lleva título, una línea y el enlace al módulo, con el estilo de la biblioteca existente.

- [ ] **Step 1: Write the failing test**

```tsx
import { SECCIONES, seccionesPara, preguntasPara, fuentesDe } from '@/lib/educacion/contenido-planta'
const props = (nivel: 'completo' | 'parcial', version: string | null = '2026.10.20') => ({
  nivel, secciones: seccionesPara(nivel), preguntas: preguntasPara(nivel), fuentes: fuentesDe(seccionesPara(nivel)),
  revision: { responsable: 'Dr. Carlos Jara', version }, adminPreview: false })
const textoDe = (id: string) => SECCIONES.find(s => s.id === id)!.afirmaciones[0].es

it('parcial: seguridad sí, contenido EVIPro no, invitación sí', () => {
  render(<LanguageProvider locale="es"><ModuloPlanta {...props('parcial')} /></LanguageProvider>)
  expect(screen.getByText(textoDe('seguridad'))).toBeInTheDocument()
  expect(screen.queryByText(textoDe('calor'))).not.toBeInTheDocument()
  expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Membresía EVIPro/i })).toHaveAttribute('href', '/planes#membresias')
})
it('completo: incluye el simulador y sin invitación', () => {
  render(<LanguageProvider locale="es"><ModuloPlanta {...props('completo')} /></LanguageProvider>)
  expect(screen.getByRole('slider', { name: /tiempo/i })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /Ver Membresía EVIPro/i })).not.toBeInTheDocument()
})
it('sin revisión: aviso de borrador y sin sello', () => {
  render(<LanguageProvider locale="es"><ModuloPlanta {...props('completo', null)} /></LanguageProvider>)
  expect(screen.getByText(/pendiente de revisión médica/i)).toBeInTheDocument()
  expect(screen.queryByText(/Revisado por/)).not.toBeInTheDocument()
})
it('cada afirmación muestra su tipo', () => {
  render(<LanguageProvider locale="es"><ModuloPlanta {...props('completo')} /></LanguageProvider>)
  expect(screen.getAllByText(/Estudio en personas/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Orientación del equipo médico/).length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run** — `npx vitest run tests/components/ModuloPlanta.test.tsx` — FAIL.
- [ ] **Step 3: Implement** `page.tsx`, `ModuloPlanta.tsx` y la tarjeta. Agregar todos los literales nuevos a `en.json`.
- [ ] **Step 4: Run** — PASS. Luego la suite completa y las comprobaciones:
  - `npm test` — todas en verde (había 414 pruebas antes de este trabajo).
  - `npm run lint` — sin errores.
  - `npm run build` — compila. El bloque de `AGENTS.md` que regenera `next dev` puede aparecer como cambio: comitearlo si aparece.
- [ ] **Step 5: Revisión manual local** con `npm run dev`, como administrador: el módulo aparece con aviso de borrador; las moléculas giran; el simulador responde con teclado; la vista a 375 px de ancho no desborda; con «reducir movimiento» del sistema no gira.
- [ ] **Step 6: Commit** — `feat(educacion): módulo «¿Qué hay en la planta?» en el área de miembros, oculto hasta la revisión médica`

---

### Task 9: Cierre y entrega a revisión médica

**Files:**
- Modify: `/home/carlos/EVIPro/docs/ROADMAP.md` (repo raíz, otro git). Antes de editar, revisar `git -C /home/carlos/EVIPro status`: si hay cambios ajenos sin commitear en el ROADMAP (Codex trabaja en paralelo), coordinar con Carlos y no pisarlos.

- [ ] **Step 1:** En el ROADMAP, mover la idea de la guía educativa a ✅ «Módulo 1 construido, oculto hasta revisión», con un 🙋 para Carlos:
  - Autorizar el push.
  - Revisar los textos en producción como administrador.
  - Al aprobar, fijar `REVISION.version = 'AAAA.MM.DD'` (un commit) para publicarlo.

  Dejar como siguientes los módulos 2 a 4 (sistema endocannabinoide, neuropatía, pantorrilla).
- [ ] **Step 2:** Commit en el repo raíz: `docs: módulo educativo 1 construido, pendiente de revisión médica`.
- [ ] **Step 3:** Informar a Carlos con la lista de afirmaciones incluidas u omitidas por la verificación de fuentes (Tarea 4, paso 1). **No hacer push sin su autorización.**
