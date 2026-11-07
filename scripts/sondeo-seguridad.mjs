#!/usr/bin/env node
// Sondeo de seguridad de evipro.pe desde fuera, como lo haría un atacante sin cuenta.
// Solo lee o manda datos inválidos que el servidor debe rechazar: no crea reservas, pagos
// ni cuentas, y no toca datos de pacientes.
// Uso: node scripts/sondeo-seguridad.mjs [https://www.evipro.pe]   → sale con 1 si algo falla.

const SITIO = (process.argv[2] ?? 'https://www.evipro.pe').replace(/\/$/, '')
const UUID_AL_AZAR = crypto.randomUUID()
const resultados = []
const anotar = (ok, nombre, detalle = '') => resultados.push({ ok, nombre, detalle })

const pedir = (ruta, init = {}) =>
  fetch(ruta.startsWith('http') ? ruta : SITIO + ruta, { redirect: 'manual', ...init })
const json = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

// 1. Lo que cualquiera descarga (HTML y JS de las páginas públicas) no trae secretos ni datos de pago.
const PAGINAS = ['/', '/medicos/dr-jara', '/medicos/dr-jara/agendar', '/login', '/registro', '/terminos', '/checkout']
const PROHIBIDO = [
  [/service_role/, 'llave service_role de Supabase'],
  [/sk_live_[A-Za-z0-9]{10,}/, 'llave secreta de pagos'],
  [/APP_USR-\d{10,}-\d{6}-[a-f0-9]{32}-\d+/, 'token de acceso de Mercado Pago'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'llave privada'],
  [/DOCTOR_PORTAL_SECRET|GOOGLE_PRIVATE_KEY|SUPABASE_SERVICE_ROLE/, 'nombre de variable secreta'],
  [/pagos-qr|dr-jara\/(yape|plin)\.png/, 'ruta de los QR de pago'],
  [/paypal\.me\/|paypalme\//, 'enlace de PayPal'],
]
const textos = []
for (const pagina of PAGINAS) {
  const r = await pedir(pagina, { redirect: 'follow' })
  const html = await r.text()
  textos.push(html)
  for (const js of new Set(html.match(/\/_next\/static\/[^"'\s]+\.js/g) ?? [])) textos.push(await (await pedir(js)).text())
}
const todo = textos.join('\n')
for (const [patron, que] of PROHIBIDO) {
  const m = todo.match(patron)
  anotar(!m, `Páginas públicas sin ${que}`, m ? `aparece: ${m[0].slice(0, 40)}…` : '')
}

// 2. Supabase con la llave pública: sin filas de tablas privadas ni QR del bucket.
const url = todo.match(/https:\/\/[a-z0-9]{20}\.supabase\.co/)?.[0]
const llave = todo.match(/sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)
  ?.find(k => k.startsWith('sb_') || /"role":"anon"/.test(Buffer.from(k.split('.')[1], 'base64url').toString()))
if (!url || !llave) {
  anotar(false, 'Encontrar URL y llave pública de Supabase en el sitio', 'no se encontraron; sin pruebas de base')
} else {
  const sb = (ruta, init = {}) => fetch(url + ruta, { ...init, headers: { apikey: llave, Authorization: `Bearer ${llave}`, ...init.headers } })
  const PRIVADAS = ['counseling_bookings', 'consultation_credits', 'profiles', 'subscriptions', 'payments', 'complaints',
    'messages', 'conversations', 'pharmacy_requests', 'partnership_proposals', 'raffle_tickets', 'subscription_addons']
  for (const tabla of PRIVADAS) {
    const r = await sb(`/rest/v1/${tabla}?select=*&limit=1`)
    const cuerpo = await r.text()
    const filas = r.ok ? JSON.parse(cuerpo).length : 0
    anotar(filas === 0, `Tabla ${tabla} no se lee sin cuenta`, filas ? `devolvió ${filas} fila(s)` : `HTTP ${r.status}`)
  }
  let r = await sb('/storage/v1/object/public/pagos-qr/dr-jara/yape.png')
  anotar(r.status !== 200, 'QR de Yape no se baja directo del bucket', `HTTP ${r.status}`)
  r = await sb('/storage/v1/object/list/pagos-qr', json({ prefix: 'dr-jara', limit: 10 }))
  const lista = r.ok ? await r.json() : []
  anotar(!lista.length, 'Bucket de QR no se lista sin llave', r.ok ? `${lista.length} archivo(s)` : `HTTP ${r.status}`)
}

// 3. Rutas de la API: rechazan ids inventados, inyecciones y pedidos sin permiso.
const esperar = async (nombre, ruta, init, validos) => {
  const r = await pedir(ruta, init)
  anotar(validos.includes(r.status), nombre, `HTTP ${r.status}`)
}
await esperar('Pago de reserva inventada → 404', `/api/reservar/pago?reserva=${UUID_AL_AZAR}`, {}, [404])
await esperar('Inyección en el id de reserva → 404', `/api/reservar/pago?reserva=${encodeURIComponent("1' or '1'='1")}`, {}, [404])
await esperar('QR de reserva inventada → 404', `/api/reservar/qr?reserva=${UUID_AL_AZAR}&medio=yape`, {}, [404])
await esperar('QR con ruta ../ → 404', `/api/reservar/qr?reserva=${UUID_AL_AZAR}&medio=${encodeURIComponent('../../x')}`, {}, [404])
await esperar('Aviso de pago con número inyectado → 400', '/api/reservar/pago',
  json({ reserva: UUID_AL_AZAR, medio: 'yape', referencia: "1' OR '1'='1" }), [400])
await esperar('Reserva sin datos ni consentimiento → 400', '/api/reservar/book', json({}), [400])
await esperar('Webhook de Mercado Pago sin firma → 401', '/api/webhooks/mercadopago',
  json({ type: 'payment', data: { id: '1' } }), [400, 401, 403])
await esperar('Perfil sin sesión → 401', '/api/profile', {}, [401])
await esperar('Suscribirse sin sesión → 401', '/api/subscriptions', json({}), [401])
await esperar('Mensajes sin sesión → 401', '/api/messages', {}, [401, 403])
await esperar('Mensajes de admin sin sesión → 401/403', '/api/admin/messages', {}, [401, 403])
await esperar('Subir contenido de admin sin sesión → 401/403', '/api/admin/content', { method: 'POST' }, [401, 403])

// 4. Páginas privadas: sin token o sin sesión no muestran nada.
await esperar('Portal médico sin token → 404', '/medicos/dr-jara/reservas', {}, [404])
await esperar('Portal médico con token falso → 404', '/medicos/dr-jara/reservas?token=abc', {}, [404])
await esperar('Admin sin sesión → redirige', '/admin', {}, [302, 303, 307, 308])
await esperar('Herramientas de miembros sin sesión → redirige', '/miembros/herramientas/calculadora-cannabinoide', {}, [302, 303, 307, 308])

// 5. Lo que se escribe en la dirección no vuelve como código en la página.
const xss = '<script>alert(1)</script>'
const pagina = await (await pedir(`/medicos/dr-jara/agendar?reserva=${encodeURIComponent(xss)}`, { redirect: 'follow' })).text()
anotar(!pagina.includes(xss), 'Texto en la dirección no se ejecuta como código')

// 6. Cabeceras de seguridad (aviso, no bloquea).
const h = (await pedir('/')).headers
for (const [cab, que] of [['strict-transport-security', 'solo HTTPS'], ['x-content-type-options', 'no adivinar tipos'],
  ['x-frame-options', 'no meter la página en otra'], ['content-security-policy', 'política de contenido']]) {
  const soloReporte = cab === 'content-security-policy' && h.has(`${cab}-report-only`)
  anotar(h.has(cab) ? true : 'aviso', `Cabecera ${cab} (${que})`, h.has(cab) ? '' : soloReporte ? 'en modo de solo aviso, no bloquea' : 'falta')
}

const fallas = resultados.filter(r => r.ok === false)
for (const r of resultados) console.log(`${r.ok === true ? '✓' : r.ok === 'aviso' ? '△' : '✗'} ${r.nombre}${r.detalle ? ` · ${r.detalle}` : ''}`)
console.log(`\n${resultados.length} pruebas · ${fallas.length} fallas · ${resultados.filter(r => r.ok === 'aviso').length} avisos · ${SITIO}`)
process.exit(fallas.length ? 1 : 0)
