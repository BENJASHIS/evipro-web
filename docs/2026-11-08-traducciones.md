# Traducciones — 2026-11-08

Inglés de Explora CBD/THC, visor, guía, tres retos de Detective molecular y página alrededor del formulario de calculadora. El roadmap anterior cubría el formulario, no todos los textos de la página.

Se reutiliza el sistema de idiomas. El empaquetado genera variantes protegidas desde prototypes/cannavital-3d/en.json. El servidor elige según el idioma conservando acceso gratuito solo a CBD, lista de recursos, hashes y CSP. Imágenes Wikipedia, modelos y cálculos intactos.

También se completan textos de navegación, citas, recetas, mensajes y pago. Se conservan mensajes de usuarios, códigos e información clínica; registro y Google sin cambios.

Validación: pruebas focalizadas de catálogo, juego completo en inglés, página de calculadora y restricciones aprobadas; verificadores moleculares e imágenes aprobados; ESLint sin errores, un aviso previo en reservar-book.test.ts. Navegador local: servidor inaccesible, sin comprobación visual. 18 pruebas focalizadas aprobadas y build completo correcto. La batería completa se interrumpió al permanecer sin resultados; no se declara aprobada. Las pruebas afectadas sí terminaron correctamente.

Cambios locales, sin push. La traducción del resto del sitio requiere auditoría.

## Mezcla detectada por capturas de Carlos

La versión publicada aún no incorpora los commits locales. Se completan además biblioteca, tarjeta de acceso al visor, estado vacío, tipo de documento, descarga y fechas. Pruebas de biblioteca y tarjetas de herramientas en inglés aprobadas, junto al catálogo y controles de mensajes/farmacia (7 pruebas en dos ejecuciones). Las imágenes y documentos publicados conservan su idioma original; no se traducen automáticamente ni se alteran datos de usuarios. Sin push ni comprobación visual en producción.

Publicación autorizada: 945bb44 desplegado correctamente en Vercel. La revisión completa detectó dos fallos (743/745): simulación de idioma faltante en FreeEducationAccess y pérdida de «clinically» en una traducción. Se corrigen conservando el requisito clínico y las restricciones de acceso.
