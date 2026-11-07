// Política de contenido: qué puede cargar el navegador en evipro.pe y desde dónde.
// Va como Content-Security-Policy-Report-Only: avisa en la consola, no bloquea nada.
// Pasarla a Content-Security-Policy (bloquear) es otro paso, con OK de Carlos.
// Sin nonce, como recomienda Next 16 para no volver dinámicas las páginas: los scripts en línea de
// Next quedan permitidos con 'unsafe-inline'; lo que se cierra es cargar código o marcos de otros sitios.
// ponytail: sin report-uri; las faltas se ven en la consola. Agregar un receptor si hace falta medir en pacientes reales.
const SUPABASE = 'https://bfcyzdrxnjkfeplcxyxv.supabase.co'
const TURNSTILE = 'https://challenges.cloudflare.com'
// Google Analytics; analytics.google.com va aparte porque el comodín *. no cubre el dominio sin subdominio.
const GOOGLE = 'https://*.googletagmanager.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.g.doubleclick.net'

export const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} ${TURNSTILE} https://*.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  // Imágenes de cualquier sitio https: Google Analytics usa el dominio del país del visitante (google.com.pe,
  // google.com.br…), que no se puede listar. Una imagen no ejecuta código.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE} ${TURNSTILE} ${GOOGLE}`,
  // Facebook: la publicación incrustada en el perfil del médico.
  `frame-src 'self' ${TURNSTILE} https://www.facebook.com`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')
