# Opinión de Google y Dudas del viajero

Fecha: 2026-10-19. Dominios: `platform` (presentación y canal de contacto) y `education` (preguntas frecuentes). La integración solo muestra contenido público y permite preparar un correo; no modifica reglas `clinical`, no incorpora mensajes como `evidence` ni recoge datos para `research`.

## Alcance aprobado

- Portada: extracto breve de la reseña individual de Damian Orchowski, 5 estrellas, con atribución y enlace a la publicación original: https://maps.app.goo.gl/XbQYN9aeSS42sJ5B6. Texto comprobado en Google Maps durante la sesión. Se indica que el extracto corresponde a la versión en español mostrada por Maps; no se presenta como valoración global ni como prueba de eficacia.
- `/dudas-del-viajero`: preguntas frecuentes sobre el canal, referencia externa de los CDC para información de altura y formulario sin registro. Acceso desde portada y pie de página; URL en sitemap; interfaz y metadatos en español e inglés.
- El formulario **prepara un correo**, no lo envía: el visitante abre su aplicación, revisa y envía a `consulta@evipro.pe`. Alternativa visible para copiar la dirección si no tiene aplicación configurada. El texto se mantiene solo en memoria del componente, sin base de datos ni localStorage.
- No hay publicaciones automáticas, plazo de respuesta garantizado, foro público ni atención de urgencias. Las futuras respuestas generales se revisarán y editarán antes de publicarse, sin correo ni mensaje original.

## Fuente educativa

La página enlaza a [CDC: Travel to High Altitudes](https://wwwnc.cdc.gov/travel/page/travel-to-high-altitudes); no reproduce protocolos ni ofrece pautas farmacológicas. Referencia de contexto consultada el 2026-10-19: [CDC Yellow Book, edición 2026, capítulo de altura, publicado 2025-04-23](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html). No se realizó evaluación GRADE porque no se propone una recomendación clínica ni se sintetizan resultados de estudios.

## Validación

- `npm run build`: aprobado (compilación, TypeScript y rutas).
- ESLint sobre archivos modificados: aprobado.
- Formulario, traducciones, secciones y SEO: 21 pruebas aprobadas. Prueba de correo repetida tras ajustar espacios como `%20`: aprobada; pregunta con `&bcc=` conserva destinatario y cuerpo.
- Suite completa: **334 aprobadas, 3 fallidas**. Las mismas tres se reprodujeron sin cambios en una copia de `HEAD` inicial `1fcb399`:
  - `tests/lib/home-content.test.ts`: «no promete resultados en ningún texto» (el filtro de `garantiz` coincide con una pregunta que niega la garantía de receta).
  - `tests/lib/home-content.test.ts`: «explica el RENPUC en las preguntas frecuentes» (la portada anterior ya no incluye esa pregunta).
  - `tests/portada-sin-precios-literales.test.ts`: «hay exactamente un CTA primario en toda la portada» (el test anterior busca `variant="primary"` en el código de las secciones).
- Revisión independiente del cambio: sin hallazgos accionables.
- Vista local: página y formulario revisados en español e inglés; preparación de correo probada sin enviarlo; reseña revisada en portada. No se probó envío real desde un cliente de correo ni vista móvil.

## Corrección de pruebas preexistentes (2026-10-19)

Los tres fallos iniciales se corrigieron únicamente en tests: la pregunta informativa exacta sobre garantía se exceptúa del filtro, su respuesta permanece examinada y debe negar la garantía y exigir criterio profesional; cinco controles confirman que otras promesas siguen detectándose. RENPUC se comprueba donde está explicado actualmente (pasos de la primera consulta). El conteo de `variant="primary"` se elimina por ser una comprobación de estilo obsoleta, redundante con `Hero.test.tsx`, que ya verifica contacto, reserva y jerarquía visual.

Validación final: **55 archivos, 342 pruebas aprobadas, cero fallos** (`npm test -- --maxWorkers=2`). ESLint dirigido y `git diff --check` aprobados. El primer intento de la suite terminó por el entorno restringido (143); la ejecución completa fuera de esa restricción terminó con código 0. Estas correcciones se guardan en un commit local; no se realizó un segundo push.

## Estado de publicación y pendientes

- Publicación autorizada por Carlos y completada: commit `2c89684` en `evipro-web/main`, estado Vercel «Deployment has completed». Página pública `/dudas-del-viajero` comprobada en navegador; portada con reseña, enlace original y acceso del viajero comprobada por HTTP.
- AdSense, foro completo y espacios para profesionales/pacientes quedan pendientes; esta entrega no los activa.
