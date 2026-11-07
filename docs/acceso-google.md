# Cuenta básica y acceso con Google — 2026-11-06

Dominio `platform`: autenticación y perfil de cuenta. No modifica permisos de membresía, reglas clínicas ni historia clínica.

## Registro mínimo para todos

Todos los enlaces de registro piden únicamente correo, contraseña y repetición, con aceptación de Términos y protección antibot existentes. Google mantiene el acceso con nombre, correo y foto que el usuario autoriza. No se pide nombre, documento, teléfono, ciudad ni datos de salud al crear una cuenta. Si no hay sesión, se muestra el aviso de confirmar correo; si hay sesión, vuelve al visor solicitado o a `/miembros`.

`/miembros/perfil` muestra correo de solo lectura y nombre para mostrar opcional. `/api/profile` consulta exclusivamente `full_name` y el correo de Auth; si no hay fila, usa el nombre disponible en los metadatos de Google, sin crearla por lectura. Guardar crea o actualiza solo `id` y `full_name`; documentos y contacto existentes se conservan y no se devuelven a este formulario. Entradas validadas en servidor, respuestas privadas sin caché y máximo 20 escrituras/minuto por cuenta con el limitador existente.

La cuenta básica no es una historia clínica ni verifica identidad. Los datos requeridos para atención se recogen en el flujo de atención, con su finalidad explicada. No se trasladaron ni eliminaron registros antiguos. La reserva actual no se modifica en esta tarea y conserva sus campos y reglas; no se creó un nuevo formulario clínico ni consentimiento de salud. Para contratar membresía, la indicación del visor remite a guardar el perfil básico (sin documento/teléfono), porque las suscripciones referencian esa fila.

## Google y permisos

- `GoogleSignIn` consulta `/api/auth/providers`, que devuelve solo un booleano; el botón aparece cuando el proveedor está activo.
- `/auth/google` usa SSR, PKCE y cookies; retorno propio `/auth/confirm` con destino en lista cerrada. Inicio limitado a 10/min e intercambio a 20/min por IP.
- Google autentica, sin conceder membresía ni permisos de Gmail, Drive o Calendar.
- Proyecto existente `evipro-calendario`, cuenta EVIPro; proveedor activo en Supabase `bfcyzdrxnjkfeplcxyxv`. Orígenes apex/www y callback Supabase configurados, retornos exactos sin comodines globales. Secretos solo en paneles, nunca chat/git.
- Prueba real completada el 06-nov: Carlos aceptó consentimiento, retorno autenticado al visor, CBD 2D/3D visible, calculadora restringida y recurso THC denegado a la cuenta gratuita. Vista molecular comprobada a 390×844; no equivale a teléfono físico.

## Alcance de verificación del cambio de perfil

Pruebas de API: acceso autenticado, nombre opcional, datos Google como valor inicial, exclusión de datos sensibles, payload inválido, errores y límite de escrituras. Componentes: registro sin datos de identidad/contacto, confirmación de correo y sesión, perfil básico y recuperación tras fallo de red. Validación ejecutada: 710 pruebas generales aprobadas (95 archivos), 22 pruebas focalizadas finales (3 archivos), ESLint y build de producción completos; Chrome local de producción confirmó registro general sin identidad/contacto y captura a 390×844. Registro real por correo, teléfono físico y revisión jurídica no incluidos. No hay migraciones ni dependencias nuevas.
