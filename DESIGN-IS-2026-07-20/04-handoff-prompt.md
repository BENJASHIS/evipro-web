```
/make-plan Redesign la página /planes de evipro-platform (app/planes/page.tsx + ConfiguradorEvipro.tsx). Falló el audit Rams a 16/30, con huecos en #3 estético (1), #5 discreto (1), #8 minucioso (1) y #10 menos-diseño (1).

Veredicto (citado): El número cae en REDESIGN, pero los tres principios de carga (#2 útil, #4 comprensible, #6 honesto) pasaron en 2 — la arquitectura de compra de 3 rutas (apoyo / membresía completa / turista) es correcta y se conserva. Lo que falla es la capa de presentación: dos lenguajes visuales, CTA divergentes, estados flojos y ~15 MB de peso de imágenes.

Por qué redesign y no refine: el total (16) cae bajo el umbral 20; los fallos son de sistema visual, no de un solo detalle — hay que unificar el lenguaje de tarjeta en las tres rutas, no parchar una.

Preservar del diseño actual:
- Los tokens de color/tipo (app/globals.css:5-18) — sistema único, sin huérfanos.
- El patrón configurador de EVIPro (duración + módulos + total en vivo) — ConfiguradorEvipro.tsx.
- La arquitectura de 3 rutas de compra (Básica / EVIPro / Turista) y toda la lógica de BD/checkout (membership_plans, plan_addons, /api/subscriptions con recálculo en servidor). NO tocar la capa de datos.

Descartar:
- Las tarjetas hero-foto de Turista. Evidencia: page.tsx:113-160. Causó fallo en #3 y #5 (foto compite con contenido, 5 MB servidos).
- Los 3 tratamientos distintos de CTA para la misma acción. Evidencia: page.tsx:84, ConfiguradorEvipro.tsx:83, page.tsx:139. Causó fallo en #3.
- Las 6 imágenes huérfanas public/images/planes/{express,esencial,cannabis,integral,especialistas,acceso}.jpg (~10.3 MB, 0 refs). Causó fallo en #10 y #9.

Top moves (verbatim):
1. #3/#5 estético/discreto: unificar en UN lenguaje de tarjeta; convertir Turista en el mismo configurador que EVIPro (elegir Inicio/Plus + duración), sin hero-foto. Evidencia: page.tsx:113-160.
2. #10/#9 menos-diseño/ecológico: borrar las 6 imágenes huérfanas de public/images/planes/. Evidencia: grep de refs vacío.
3. #3 estético: un solo tratamiento de CTA en las tres rutas. Evidencia: page.tsx:84, ConfiguradorEvipro.tsx:83, page.tsx:139.
4. #8 minucioso: :focus-visible propio + empty-state honesto cuando no hay filas (hoy muestra "S/. 0"). Evidencia: ConfiguradorEvipro.tsx:20-24.
5. #3 estético: un solo criterio de encabezado (serif-italic O font-light, no ambos). Evidencia: page.tsx:58,78.

Principios de redesign en orden de prioridad:
1. #3 estético — las tres rutas leen como un solo sistema; cero estilos huérfanos.
2. #10 menos diseño — cada elemento se gana su lugar; cero peso muerto.
3. #5 discreto — el contenido es la figura, el chrome el fondo; sin foto decorativa.

Deliverables del plan:
- Nueva IA de la página (3 rutas, un solo lenguaje de tarjeta) con mapa low-fi.
- Flujo primario etiquetado, comparado lado a lado con el actual.
- Checklist de estados (empty, loading, error, focus, disabled).
- Migración: ninguna de datos (Turista sigue siendo turista_inicio/turista_plus en BD; solo cambia la presentación).
- Criterio de corte: cuándo se retira el layout viejo (al mergear).

Constraint: tema oscuro comprometido, Next 16, sin romper la lógica de compra ni las migraciones 020/021 ya aplicadas.

Anti-patterns a evitar: portar la estructura vieja bajo estilo nuevo; mantener ambos layouts tras un flag; rediseñar por tendencia en vez de por estos principios; tocar la capa de datos/checkout.
```
