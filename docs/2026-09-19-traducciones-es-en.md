# Traducciones de la web publica

Fecha: 2026-09-19. Version editorial: es-en.v1.
Dominio: platform (interfaz y contenido publico). No modifica clinical ni evidence.

## Alcance

Portada, consulta, equipo y perfiles, reserva, membresias y turista, aliados,
acceso y recuperacion de cuenta, checkout y sus resultados, condiciones,
cancelaciones y formulario de reclamaciones. El panel privado, los documentos
clinicos y el contenido aportado por pacientes no se traducen con este catalogo.

`lib/locales/en.json` relaciona el texto original con su traduccion inglesa.
Las traducciones fueron redactadas y revisadas linguisticamente con asistencia
de Codex. Esto no constituye validacion cientifica ni juridica independiente de
las afirmaciones originales. La revision humana medica/legal sigue pendiente.
La fuente de cada traduccion es el texto espanol de la propia interfaz.

## Criterios editoriales

- Medico Cirujano: Physician; no implica especialidad quirurgica.
- Areas de practica: no se convierten en acreditaciones de especialista.
- Idioma ingles del medico: Basic, como consta en el perfil original.
- Receta: condicionada a la evaluacion; no garantizada por reservar o pagar.
- Farmacia magistral: compounding pharmacy.
- Consejeria: guidance session; no se anuncia como psicoterapia.
- RENPUC, CMP, RNA, nombres propios, medicamentos y cifras se conservan.
- No se envian textos a Google ni a otro traductor al visitar la web.

## Funcionamiento

El servidor prioriza la eleccion explicita guardada en la cookie `evipro_locale`;
en su ausencia interpreta `Accept-Language`, incluidas variantes regionales y
pesos. El idioma de respaldo es espanol. El atributo HTML `lang` y los textos
se entregan juntos para evitar un cambio de idioma tras la carga.

El selector guarda solo `es` o `en` mediante `/api/locale`, con validacion de
origen y cookie HttpOnly/SameSite. Refresca los componentes del servidor sin
perder el estado local del formulario. No almacena identidad ni datos medicos.
Se mantienen las rutas y canonical existentes; esta entrega no crea rutas
indexables separadas `/es` y `/en`.

Los identificadores de modalidades, planes y servicios enviados a la API no
cambian. Los mensajes preparados para WhatsApp traducen las etiquetas, nunca
el nombre ni el motivo escrito por la persona. Las tarifas siguen saliendo de
la misma tabla/funcion que en espanol.

## Mantenimiento y limites

Cada nuevo texto publico necesita su entrada inglesa y su marcado `T` (o `t`
para atributos). Los textos marcados sin traduccion fallan en el test de
catalogo. Las etiquetas nuevas procedentes de la base de datos tambien deben
incorporarse al catalogo antes de publicar. Un texto desconocido conserva su
original; no se improvisa una traduccion automatica.

El contenido juridico traduce la version espanola existente, incluyendo sus
plazos y referencias. Revisar por separado la referencia al articulo 45 para
el desistimiento y el plazo publicado de respuesta a reclamaciones antes de
dar esos textos por juridicamente validados. No se alteran por esta traduccion.

## Verificacion

Pruebas de deteccion y prioridad del idioma, cookie y origen, catalogo, portada
inglesa y reserva con identificadores y texto del paciente intactos. Pruebas
de regresion existentes, TypeScript y build de produccion. Navegacion Chromium
en escritorio y movil, cambio manual de idioma y persistencia tras recarga.
Sin reservas, pagos o altas reales durante las pruebas.
