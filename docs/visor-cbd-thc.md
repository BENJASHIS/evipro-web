# Visor didáctico CBD/THC para miembros — V08

Ruta: `/miembros/contenido/explora-cbd-thc`. Accesos desde Biblioteca y calculadora cannabinoide. Uso educativo: envase, concentraciones y estructuras de referencia, sin recomendaciones de dosis. Conserva tres caras, exploración 3D y comparación plana. No incluye juego ni datos de pacientes.

## Acceso y archivos

Página y cada recurso de `/miembros/contenido/explora-cbd-thc/visor/[...asset]` verifican sesión y `canUseMemberTools`: membresía activa o vista previa admin. El HTML, JS, modelos y SVG residen en `private/frasco`, **fuera de public/**. El Route Handler solo permite nombres presentes en el manifiesto; no acepta traversal ni expone el manifiesto. Respuestas `private, no-store`, `nosniff`, `SAMEORIGIN` y CSP propia con hash del importmap. El Proxy añade una defensa previa y preserva únicamente el retorno exacto al visor en el login; destinos externos se descartan.

El iframe mantiene la altura de su contenido: mensajes aceptados solo del mismo origen, de su ventana y con altura finita de400–6000px. `postMessage` transmite altura, no porcentajes ni información personal. Se ofrece ventana completa con el mismo control de acceso.

Compartir el enlace no concede membresía. Una persona autorizada puede capturar, grabar o guardar recursos ya recibidos: el control de acceso no es DRM. No se hicieron cambios a cuentas, credenciales o políticas de membresía.

## Fuente visual y sincronización

La fuente está en el repo clínico hermano: `../prototypes/cannavital-3d`. Se mantienen geometría, pruebas químicas y materiales allí. Tras modificarla, desde este repo:

```bash
node scripts/sync-bottle-viewer.mjs
```

El script copia solo16 archivos necesarios y licencia Three.js; registra SHA256 y hash de importmap en `private/frasco/manifest.json`. No ejecutar automáticamente en Vercel: la fuente hermana no existe allí. Se versiona la copia completa y reproducible. `next.config.ts` incluye esta carpeta en la traza de la ruta; comprobados17 archivos (16 recursos+manifiesto) en `route.js.nft.json`. ESLint ignora la copia/vendor; la fuente original se comprueba aparte.

La pipeta V08 reduce opacidad de0,22 a0,16 y el tinte blanco; añade aros finos de borde dentro del perfil ya existente. Sigue siendo transparencia alfa aproximada de WebGL, sin calibración óptica ni volumen por gota.

## Lenguaje de porcentajes

Calculadora y visor usan «Concentración (%)» y ejemplo visible «CBD al10% equivale a100mg en cada mL de aceite». La definición masa/volumen (%m/v o %p/v) queda desplegable. Los resultados de aceite muestran% sin abreviatura. Se conserva explícita la diferencia entre aceite por volumen y cartucho/flor por peso; no cambian enum, conversiones ni reglas. Traducción inglesa actualizada para esos textos.

## Validación y límites

65 pruebas afectadas aprobadas: recurso privado, Proxy/retorno, login, página/iframe y calculadora; control de origen/ventana/altura, hashes de todos los recursos y CSP/importmap. Regresiones Node del prototipo, sintaxis y geometría aprobadas. Revisión independiente sin bloqueantes. Lint y compilación de producción comprobados; en entorno restringido Next recibió salida vacía de `tsc --showConfig`, por lo que el build se ejecutó con permiso de proceso fuera del sandbox. No se cambiaron dependencias ni se desactivaron verificaciones.

Chrome: pipeta y giro inspeccionados en el prototipo. La compilación web local bloquea al anónimo y pide login. Los caminos de miembro/admin/no miembro están probados con mocks; **falta navegación completa con una sesión real de miembro y comprobación tras despliegue en Vercel**, además de teléfono físico. La suite clínica completa no se ejecutó porque no cambió el núcleo.

Estado de entrega: código preparado y guardado; sin push ni despliegue. Para publicar hace falta autorización de Carlos: push a `main` en este repo dispara Vercel. El repo clínico raíz no despliega la web.
