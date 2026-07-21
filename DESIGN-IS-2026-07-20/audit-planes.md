# Design-Is audit — `/planes` (evipro-platform)

Fecha: 2026-07-20 · Método: análisis estático de fuente (sin dev server; facts visuales marcados INFERRED).

## 00 · Scope
- **Superficie:** `app/planes/page.tsx` + `app/planes/ConfiguradorEvipro.tsx`.
- **Usuario primario:** paciente/visitante que evalúa y compra una membresía.
- **Tarea primaria:** elegir un plan y llegar al checkout.
- **Stack/constraint:** Next 16 App Router, tema oscuro comprometido, tokens en `app/globals.css`.

## 01 · Evidencia
**Estructural** (`page.tsx`, `ConfiguradorEvipro.tsx`)
- Tres modelos de tarjeta para la MISMA tarea (comprar): Básica = flex-card de texto (`page.tsx:75-90`); EVIPro = configurador (botones de duración + checkboxes + total en vivo, `ConfiguradorEvipro.tsx`); Turista = 2 tarjetas hero-foto (`page.tsx:113-160`).
- El CTA "ir a checkout" aparece con **3 tratamientos distintos**: pill bordeado (Básica `page.tsx:84`), botón full-width bordeado (`ConfiguradorEvipro.tsx:83`), celdas de grid "Reservar →" (`page.tsx:139-152`).
- Encabezados inconsistentes: `h1`/algunos `h2` en `font-serif italic` (`page.tsx:58,109`), otros `h2` en `font-light` plano (Básica `page.tsx:78`, EVIPro `ConfiguradorEvipro.tsx:37`).

**Visual (INFERRED de fuente + tokens)**
- Color: sistema único — `--color-brand #7bc96f`, `-mid #4a8c42`, `-deep #2d5a27`, `--muted #9ca3af`, `--faint #6b7280`, `--subtle rgb(255 255 255/.08)` (`globals.css:5-18`). Sin colores huérfanos.
- Tipo/espaciado: escala Tailwind coherente, pero saltos grandes (`mb-16`, `mb-20`).
- Estados: el configurador tiene `selected`/`hover` en botones. Foco = default del navegador (no se vio `:focus-visible` propio). Empty-state pobre: si no hay filas EVIPro el configurador muestra "S/. 0" y oculta el CTA (`ConfiguradorEvipro.tsx:20-24,79`).

**Peso & fricción**
- Hero Turista servidos en `/planes`: `turista-inicio.jpg` **3.1 MB**, `turista-plus.jpg` **2.0 MB** — fuente sin optimizar.
- **6 imágenes huérfanas** en `public/images/planes/` (express, esencial, cannabis, integral, especialistas, acceso) = **~10.3 MB muertos**, 0 referencias (grep vacío).
- Sin animación idle.

**Copy & honestidad**
- "Recomendado" en EVIPro = honesto (es el flagship). Sin dark patterns, sin escasez falsa.
- "Cancela cuando quieras" (`page.tsx:163`): mismatch menor — son compras de período único, no hay auto-renovación que cancelar.

## 02 · Scorecard (0–3, tie-break al menor, se puntúa la peor instancia)
| # | Principio | Score | Justificación |
|---|-----------|:---:|---------------|
| 1 | Innovador | 2 | El configurador (duración + módulos + total en vivo) mejora el muro de 18 tarjetas; patrón e-commerce conocido, no nuevo. |
| 2 | Útil | 2 | La compra se completa en cada ruta, pero tres modelos de interacción para la misma tarea suman carga. |
| 3 | Estético | 1 | Dos lenguajes de tarjeta (texto vs hero-foto) = violación jarring; +3 tratamientos de CTA; encabezados mixtos. |
| 4 | Comprensible | 2 | Controles bien etiquetados ("Cannabis medicinal (Dr. Jara)"); el concepto de módulos pide un beat. |
| 5 | Discreto | 1 | Básica/EVIPro recede; los hero de Turista (5 MB de foto) compiten con el contenido. |
| 6 | Honesto | 2 | Sin engaños; una inflación menor ("cancela cuando quieras" sobre compra única). |
| 7 | Duradero | 2 | Tokens atemporales; un marcador fechado: hero stock-photos. |
| 8 | Minucioso | 1 | Foco default, empty-state pobre, sin estado de error → 2-3 estados flojos. |
| 9 | Ecológico | 2 | Sin motion; oscuro comprometido; pero hero pesados y 10 MB huérfanos en el deploy. |
| 10 | Menos diseño | 1 | 6 imágenes muertas + hero decorativos + CTA duplicados = 3-5 elementos removibles. |
| | **TOTAL** | **16/30** | |

## 03 · Veredicto: **REDESIGN** (regla: total < 20)
El número cae en REDESIGN, pero honestidad sobre el matiz: **los tres principios de carga (#2 útil, #4 comprensible, #6 honesto) pasaron en 2** — la arquitectura de compra (3 rutas: apoyo / membresía completa / turista) es correcta y se conserva. Lo que falla es la **capa de presentación**: dos lenguajes visuales, CTA divergentes, estados flojos y ~15 MB de peso de imágenes (5 servidos + 10 muertos). Es un redesign del *sistema visual de la página*, no del producto.

**Movimientos de mayor palanca:**
1. **#3/#5** — Unificar en UN lenguaje de tarjeta. Matar los hero-foto de Turista; convertir Turista en el mismo patrón configurador que EVIPro (elegir Inicio/Plus + duración). Evidencia: `page.tsx:113-160`.
2. **#10/#9** — Borrar las 6 imágenes huérfanas (`public/images/planes/{express,esencial,cannabis,integral,especialistas,acceso}.jpg`, ~10.3 MB). Evidencia: grep de refs vacío.
3. **#3** — Un solo tratamiento de CTA "Suscribirme/Reservar" en las tres rutas. Evidencia: `page.tsx:84`, `ConfiguradorEvipro.tsx:83`, `page.tsx:139`.
4. **#8** — Estados: foco `:focus-visible` propio; empty-state honesto cuando no hay filas EVIPro/Turista (hoy "S/. 0"). Evidencia: `ConfiguradorEvipro.tsx:20-24`.
5. **#3** — Un solo criterio de encabezado (elegir serif-italic *o* font-light, no ambos). Evidencia: `page.tsx:58,78`.
