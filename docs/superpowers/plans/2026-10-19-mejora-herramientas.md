# Mejora de herramientas de miembros

Alcance autorizado por Carlos: continuar con todas las mejoras de la revisión del 19 de octubre. Implementación en la plataforma Next.js actual, en el checkout limpio existente; sin modificar el motor clínico Python, publicar ni usar datos reales.

## Contratos y límites

- Calculadora: conversión aritmética de etiquetas. Datos incompletos no equivalen a cero; no se asume gotero. Validación de masa en cartucho/flor; no extrapolar límites de % p/p a % p/v. Las pautas clínicas siguen fuera.
- Hábitos: cargar el día seleccionado antes de editar, proteger datos existentes y conflictos concurrentes, distinguir desconocido de cero, resumir siete fechas reales en Lima. Escrituras sensibles solo por API. Cualquier cambio de esquema se entrega como migración revisable; comprobar su aplicación antes de desplegar código dependiente.
- Regen: reflexión de bienestar con preguntas propias, no escala clínica validada. Puntajes y umbrales 50/75 y bandera >=2 se conservan. Una señal informada de miedo/acoso/peligro con cualquier frecuencia ofrece ayuda como precaución, no determina diagnóstico ni gravedad. Se versiona esta diferencia y el período orientativo de referencia; no se reinterpretan evaluaciones antiguas.
- Dominio `platform` para flujo/privacidad, `education` para explicaciones. La orientación de apoyo tiene fuentes oficiales identificadas; no crea una regla de prescripción ni se exporta como investigación.

## Trabajo

1. Pruebas de regresión calculadora: incompatibilidades, vacíos, cero explícito y gotero; validar biblioteca y resultado visible.
2. Pruebas hábitos: reapertura del día, resumen por fechas, datos desconocidos y conflictos; migración de permisos/datos necesaria.
3. Regen: probar apoyo ante señal infrecuente sin cambiar score; navegación por cuatro bloques, progreso y errores accesibles; resultado prudente y estado de guardado.
4. Historial Regen: consultar solo usuario/columnas necesarias, hasta cinco evaluaciones, mostrar resúmenes versionados con fechas Lima y errores de lectura, sin fingir ausencia de registros.
5. Herramientas: jerarquía de seguimiento, instrucciones y navegación coherentes; traducciones del contenido nuevo.
6. Verificar pruebas afectadas, suite completa, lint, TypeScript/build y vista sintética local. Revisión final de seguridad y privacidad; actualizar roadmap y commits en español. Sin push hasta confirmación.

## Fuentes de apoyo consultadas (2026-10-19)

- MINSA, 2026-01-13: https://www.gob.pe/institucion/minsa/noticias/1332478-minsa-recuerda-que-la-linea-113-brinda-orientacion-y-apoyo-psicologico-gratuito-las-24-horas
- MIMP, 2026-06-06: https://www.gob.pe/institucion/mimp/noticias/1402338-mimp-servicios-de-atencion-y-proteccion-contra-la-violencia-continuaran-funcionando-durante-la-segunda-vuelta-electoral

Fuentes administrativas oficiales para contacto, no evidencia de validación del cuestionario. La revisión científica del instrumento propio sigue pendiente del responsable médico.
