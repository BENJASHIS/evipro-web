# Acceso con Google y registro educativo mínimo — 2026-11-06

Dominio platform; no modifica reglas clínicas ni permisos de membresía. Carlos autorizó Google+correo y registro educativo sin nombre/documento. V09 mantiene CBD gratuito con cuenta y THC/mezclas/calculadora con membresía.

## Implementación
- Login y registro usan GoogleSignIn: consulta `/api/auth/providers`, que devuelve solo un booleano Google y cachea60s; errores fallan cerrado. No muestra un botón de proveedor no disponible.
- `/auth/google` inicia OAuth con cliente SSR existente y PKCE/cookies; callback propio `/auth/confirm`, destino en lista cerrada, sin caché, límite10intentos/min por IP con helper existente.
- Callback intercambia código, conserva destino permitido, limita20intentos/min, error genérico y alternativa por correo. Nunca registra códigos o secretos.
- Registro educativo por correo pide correo/contraseña/confirmación, sin nombre ni documento; no escribe datos de perfil ni cambia registro general. Perfil ampliado se completa antes de servicios que lo necesitan.
- Google autentica; no concede membresía. No se solicitan permisos de Drive, Calendar ni datos clínicos.

## Activación externa pendiente
**Estado comprobado 2026-11-06:** activo. Código publicado, cliente OAuth «EVIPro web · acceso de usuarios» en `evipro-calendario` (cuenta eviproconsultas@gmail.com), retornos guardados y Client ID con secreto puestos por Carlos en Supabase. `/api/auth/providers` devuelve `google:true` y `/auth/google` llega a la pantalla de Google. Falta la prueba real con una cuenta y en teléfono. El resto de esta sección es la propuesta original: ya no aplica crear un proyecto nuevo.

Supabase proyecto `bfcyzdrxnjkfeplcxyxv`, evipro-web: Google deshabilitado, ClientIDs/Secret vacíos. En la cuenta Google abierta no se encontró proyectoEVIPro; proyecto actual My First Project no tiene AuthPlatform configurado. Formulario de nuevo proyecto preparado con nombreEVIPro (sin crearlo). No se modificaron ajustes externos ni credenciales.

Configuración propuesta, siguiendo [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-sign-in/auth-google):
1. Proyecto separadoEVIPro; identidad públicaEVIPro, soporteconsulta@evipro.pe. Cliente OAuth tipo Web para acceso de usuarios externos con identidad básica (openid/email/profile).
2. Orígenes propios: https://www.evipro.pe y https://evipro.pe. Redirect URI de Google: https://bfcyzdrxnjkfeplcxyxv.supabase.co/auth/v1/callback.
3. Supabase Auth URLConfiguration: permitir https://www.evipro.pe/auth/confirm y https://evipro.pe/auth/confirm con sus parámetros de retorno. Mantener SiteURL del dominio propio. No agregar comodines globales.
4. Poner ClientID y ClientSecret exclusivamente en el proveedor Google de Supabase; habilitarlo. No enviar secretos por chat ni versionarlos. Mantener nonce checks y email requerido.
5. Probar Google con una cuenta y comprobar retorno al visor, nivelgratuitoCBD y acceso completo solo para miembro. Comprobar público Google antes de anunciar acceso general (modo pruebas limita usuarios).

La herramienta de navegador exige confirmación al crear acceso/credenciales de seguridad y traspaso al usuario al introducir nuevas credenciales. No aceptar términos legales ni escribir secretos sin ese paso. El código detectará el proveedor habilitado sin nuevo despliegue (hasta60s de caché).

## Verificación
42pruebas afectadas aprobadas (13archivos): OAuth/proveedores, callback, login/registro, visor y recursos, retorno permitido, biblioteca y bloqueo de calculadora. Lint aprobado. Se probaron falta de proveedor, fallo de red, rechazo de retorno externo y límite de intentos. Revisión propia del flujo; el revisor independiente no estuvo disponible por límite de uso. Compilación de producción verificada antes de publicar.

Pendientes: activación real Google, prueba de loginGoogle y registro real por correo, teléfono físico. Núcleo clínico y sus pruebas no cambiaron. Sin dependencias nuevas, migraciones ni perfiles médicos.
