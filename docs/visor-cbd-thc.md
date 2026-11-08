# Visor didáctico CBD/THC — V11: referencias Wikipedia

## V11 — corrección gráfica de Carlos, 2026-11-08

Los dos dibujos 2D activos son ahora los de Wikipedia en español: CBD `Cannabidiol_Structural_formula_V1.svg` y THC `Tetrahydrocannabinol.svg`, conservados localmente con versión/SHA256 y atribución Commons. Etiqueta y comparación plana comparten SVG originales sin redibujar; escala uniforme para evitar deformaciones. Los PNG de `public/moleculas/{cbd,thc}.png` se derivan de los mismos originales, con fondo blanco, para el módulo educativo y sus alternativas al 3D. El sync actualiza ambos desde la fuente central. Otras moléculas, modelos 3D y datos químicos PubChem permanecen intactos.

La página distingue fuentes de imágenes 2D y datos 3D. Los verificadores actuales garantizan integridad/procedencia/seguridad del SVG; hubo cotejo visual de conectividad/cuñas, sin extracción automática de grafo desde estos SVG. El informe RDKit previo corresponde al diseño V06 anterior y se conserva como histórico. Detalle durable en el repo raíz: `prototypes/cannavital-3d/REFERENCIAS-WIKIPEDIA-V11.md`.

Sin cambios de registro, Google, permisos, CSP, juego, datos clínicos ni dependencias npm. Publicado el 2026-11-08 con autorización de Carlos: web `088a4af` (incluye guía/juego `e728855`), Vercel correcto y GitHub Actions en verde. Chrome con sesión real: esquemas Wikipedia, fuentes 2D/3D separadas, guía y tres retos completados sin errores de consola. PNG públicos con hashes iguales a los archivos revisados; recursos privados redirigen a login sin sesión. Validación V11: 46 pruebas afectadas aprobadas, verificadores Python/Node, lint sin errores (una advertencia previa en reservas) y build de producción aprobado. Chrome: ambas caras, comparación plana y viewport 390×844 sin desbordamiento. No se repitió la suite clínica ni toda la suite web; la suite general de 732 descrita abajo pertenece a V10. Lo que sigue es antecedente V10.

## V10 reconstruida — 2026-11-08

Se recuperó únicamente la ampliación educativa aprobada sobre web `5536be1` y raíz `45ae5df`, sin restaurar las ramas antiguas de /tmp. Dos botones opcionales abren un panel no modal: guía de giro/apertura/CBD y juego de oxígeno/orientación/hidrógenos. Solo CBD para ambas modalidades de acceso; panel de tres pasos, pistas sin penalización, reinicio, teclado, Escape desde el visor y retorno de foco. La referencia plana conserva su diálogo y su propio Escape.

El módulo `learning.js` no almacena respuestas ni modifica concentraciones, geometría, estereoquímica o datos científicos. El picking usa desplazamiento máximo y cancela arrastres de ida/vuelta, multitouch, pointercancel y pérdida de captura. Cierre/navegación invalidan cargas; carga fallida no permite logros ni reabre el panel. Se mantienen Route Handler, CSP, sesión, Google, registro, perfil y pagos sin cambios. El script genera 18 recursos y manifiesto V10; el paquete funciona sin la fuente hermana en el checkout web.

Validación V10: 29 pruebas en ocho archivos de controlador/recursos protegidos/retornos/permisos/Google; verificadores Node de química, composición, tapa, gotero y etiqueta. Chrome local: guía y juego completos, oxígeno tocado en modelo, símbolos/teclado, referencia plana, hidrógenos, Escape/retorno y reinicio; viewport 390×844 sin desbordamiento. Revisión independiente sin hallazgos pendientes tras cubrir Escape desde hidrógenos. Build de producción aprobado. Lint sin errores, con una advertencia previa de variable sin usar en `reservar-book.test.ts`. Suite general nueva: 97 archivos, 732 pruebas aprobadas (`npm test -- --maxWorkers=2`). El verificador SVG con RDKit no se pudo ejecutar por módulo ausente; activos sin cambios byte a byte y verificaciones Node aprobadas. No se ha publicado V10 ni se ha probado en teléfono físico o con pacientes.

## Antecedente V09 (conservado como registro)

V09 y el registro mínimo/Google sí fueron publicados y aceptados antes de esta recuperación; la sección histórica siguiente refleja la preparación previa, no un bloqueo pendiente. El registro actual es Google o correo/contraseña/confirmación, con nombre opcional en perfil. Continuidad: `../docs/handoffs/2026-11-08-guia-detective-molecular.md` en el repo raíz.

Ruta: `/miembros/contenido/explora-cbd-thc`. Accesos desde Biblioteca y calculadora cannabinoide. Uso educativo: envase, concentraciones y estructuras de referencia, sin recomendaciones de dosis. Conserva tres caras, exploración 3D y comparación plana. No incluye juego ni datos de pacientes.

## Acceso gratuito y registro

Carlos aprobó cuenta gratuita para **solo CBD**: envase con ejemplo fijo al10%, moléculaCBD2D/3D, giro/acercamiento y apertura. THC, mezclas, porcentajes editables y calculadora requieren membresía activa (o vista previa admin). No se amplían permisos de otras herramientas.

El enlace compartido lleva al login contextual: explica qué se verá, acceso gratuito y límites; ofrece «Crear cuenta gratuita» y retorno automático. Registro educativo pide correo/contraseña/confirmación, sin nombre, documento ni contacto. Registro general conserva su comportamiento. Si hay sesión vuelve al visor; sin sesión muestra confirmación de correo pendiente. Callback PKCE `/auth/confirm` restringe el destino; si se activa confirmación de correo, permitir esa URL en Supabase. Google está integrado con PKCE, detección del proveedor y alternativa por correo; sigue pendiente activación de credenciales en Google/Supabase, por lo que el botón permanece oculto. Ver `docs/acceso-google.md`.

El perfil ampliado se completa en `/miembros/perfil` antes de contratar membresía; el visor gratuito lo indica. No se crea un perfil documental ni se cambia el esquema/pagos.

## Acceso y archivos

Página y cada recurso verifican sesión. `canUseMemberTools` decide versión completa o limitada: el servidor entrega `cbd.html` ante peticiones de `index.html` sin membresía y devuelve403 a SVG/modeloTHC. Querystrings no pueden ampliar el permiso. La varianteCBD se genera sin formulario de mezcla ni referencias/controlesTHC. Biblioteca gratuita no consulta contenido de pago ni firma URLs; consultas de miembros limitadas a24elementos. El HTML, JS, modelos y SVG residen en `private/frasco`, **fuera de public/**. El Route Handler solo permite nombres presentes en el manifiesto; no acepta traversal ni expone el manifiesto. Respuestas `private, no-store`, `nosniff`, `SAMEORIGIN` y CSP propia con hash del importmap. El Proxy añade una defensa previa y preserva únicamente el retorno exacto al visor en el login; destinos externos se descartan.

El iframe mantiene la altura de su contenido: mensajes aceptados solo del mismo origen, de su ventana y con altura finita de400–6000px. `postMessage` transmite altura, no porcentajes ni información personal. Se ofrece ventana completa con el mismo control de acceso.

Compartir el enlace no concede membresía: cuenta gratuita accede a CBD; cuenta con membresía accede al visor completo. Una persona autorizada puede capturar, grabar o guardar recursos ya recibidos: el control de acceso no es DRM. No se hicieron cambios a cuentas, credenciales o políticas de membresía.

## Fuente visual y sincronización

La fuente está en el repo clínico hermano: `../prototypes/cannavital-3d`. Se mantienen geometría, pruebas químicas y materiales allí. Tras modificarla, desde este repo:

```bash
node scripts/sync-bottle-viewer.mjs
```

El script copia16 archivos originales necesarios y licencia Three.js, genera una variante HTML de CBD (17recursos en total); registra SHA256 y hash de importmap en `private/frasco/manifest.json`. No ejecutar automáticamente en Vercel: la fuente hermana no existe allí. Se versiona la copia completa y reproducible. `next.config.ts` incluye esta carpeta en la traza de la ruta; comprobados18 archivos (17 recursos+manifiesto) en `route.js.nft.json`. ESLint ignora la copia/vendor; la fuente original se comprueba aparte.

La pipeta V08 reduce opacidad de0,22 a0,16 y el tinte blanco; añade aros finos de borde dentro del perfil ya existente. Sigue siendo transparencia alfa aproximada de WebGL, sin calibración óptica ni volumen por gota.

## Lenguaje de porcentajes

Calculadora y visor usan «Concentración (%)» y ejemplo visible «CBD al10% equivale a100mg en cada mL de aceite». La definición masa/volumen (%m/v o %p/v) queda desplegable. Los resultados de aceite muestran% sin abreviatura. Se conserva explícita la diferencia entre aceite por volumen y cartucho/flor por peso; no cambian enum, conversiones ni reglas. Traducción inglesa actualizada para esos textos.

## Validación y límites

75 pruebas afectadas aprobadas en V09: recurso privado, Proxy/retorno, login, página/iframe, registro educativo/callback, biblioteca y calculadora; control de origen/ventana/altura, hashes de todos los recursos y CSP/importmap. Regresiones Node del prototipo, sintaxis y geometría aprobadas. Revisión independiente sin bloqueantes. Lint y compilación de producción comprobados; en entorno restringido Next recibió salida vacía de `tsc --showConfig`, por lo que el build se ejecutó con permiso de proceso fuera del sandbox. No se cambiaron dependencias ni se desactivaron verificaciones.

Chrome: pipeta y giro inspeccionados en el prototipo. La compilación web local bloquea al anónimo y pide login. Los caminos de miembro/admin/no miembro están probados con mocks; **falta navegación completa con una sesión real de miembro y comprobación tras despliegue en Vercel**, además de teléfono físico. La suite clínica completa no se ejecutó porque no cambió el núcleo.

Estado V09: preparado, pendiente publicación. V08 ya publicado en55fdac2; esta iteración no está aún en producción. Para publicar hace falta autorización de Carlos: push a `main` en este repo dispara Vercel. El repo clínico raíz no despliega la web.
