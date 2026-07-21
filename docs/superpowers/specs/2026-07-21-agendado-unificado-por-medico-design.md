# Agendado unificado por médico — Design

> Fecha: 2026-07-21 · Estado: aprobado · Plataforma: `evipro-platform/` (Next.js 16)

## Problema

El agendado público está duplicado a nivel de UI. Existen dos formularios casi
iguales para reservar con un médico:

- `/consejeria/[slug]` → `BookingForm`: modalidades Video (S/15) / WhatsApp (S/5),
  **pago online** (MercadoPago).
- `/reservar` → `ReservaForm`: modalidades Presencial / Virtual / Domicilio
  (escalera de precios), **cobro manual** (`paid=false`).

Ambos escriben a la misma tabla (`counseling_bookings`), comparten disponibilidad
de horarios y el portal del médico ya los muestra unificados. La única diferencia
real entre los dos flujos es el **pago**. La pestaña `/reservar` se siente de más.

Decisión de Carlos (2026-07-21): unificar el agendado **dentro de cada médico** —
una sola página por médico con todas las modalidades.

## Objetivo

Una única experiencia de agendado por médico en `/medicos/[slug]/agendar`, con las
5 modalidades en un solo formulario, conservando la conducta de pago actual
(consejería online, consulta manual). Sin código muerto tras el cambio.

## Alcance

**Incluye:** formulario unificado, página propia por médico, CTA en la ficha,
redirects de las rutas viejas, ajuste de nav, tests.

**No incluye** (fuera de alcance, no cambia): la máquina de reservas
(`counseling_bookings`, slots compartidos), el portal del médico (ya unificado),
los endpoints de pago (se reusan tal cual), la escalera de precios
(`lib/consulta-pricing.ts`), el landing `/consejeria` (queda como info + Cannavital).

## Diseño

### 1. Componente `AgendarForm`

Fusiona `app/consejeria/[slug]/BookingForm.tsx` (consejería) y
`app/reservar/ReservaForm.tsx` (consulta) en un solo componente cliente. Recibe
**un** médico (ya elegido) — sin picker de médico.

Pasos:

1. **Modalidad** — agrupadas visualmente:
   - *Consejería*: Video, WhatsApp — solo si `doctor.counseling?.available`.
     Fuente de modalidades: `doctor.counseling?.modalities`.
   - *Consulta médica*: Presencial, Virtual, Domicilio — siempre (todos los
     médicos atienden consulta). Precio de referencia vía `escaleraReserva()`
     de `lib/consulta-pricing.ts`.
2. **Horario** — solo para modalidades con slot fijo: Video, Presencial, Virtual.
   WhatsApp y Domicilio **no** piden horario (convención existente del portal:
   `slot_date` null → van a "pendientes", no a "próximas").
3. **Datos** — nombre + teléfono (sin membresía), motivo opcional.
4. **Pagar / Solicitar** — ramifica por modalidad:
   - Consejería (video/whatsapp) → flujo de **pago online** actual (el mismo que
     hoy usa `BookingForm`: crea la reserva e inicia MercadoPago).
   - Consulta (presencial/virtual/domicilio) → **solicitud manual** vía
     `POST /api/reservar/book` (`paid=false`, `payment_method='manual'`).

Ambas ramas persisten en `counseling_bookings`. El `AgendarForm` decide la rama
a partir de si la modalidad seleccionada es de consejería o de consulta
(constante `MODALIDADES_CONSULTA = ['presencial','virtual','domicilio']`).

### 2. Página `/medicos/[slug]/agendar` + CTA

- **Nueva ruta** `app/medicos/[slug]/agendar/page.tsx`: server component; carga el
  médico por slug (`notFound()` si no existe); header con foto/nombre/CMP (patrón
  calcado de `app/consejeria/[slug]/page.tsx`); renderiza `<AgendarForm doctor={doctor} />`.
  `generateStaticParams` sobre todos los médicos (`DOCTORS`).
- **Ficha `app/medicos/[slug]/page.tsx`**: el botón del sidebar
  "Agendar consejería →" (→ `/consejeria/[slug]`) pasa a **"Agendar cita →"**
  (→ `/medicos/[slug]/agendar`), mostrado para **todos** los médicos (se quita la
  condición `doctor.counseling?.available`).

### 3. Redirects y nav

- `app/consejeria/[slug]/page.tsx` → `permanentRedirect('/medicos/${slug}/agendar')`
  (301). El `BookingForm` deja de referenciarse desde aquí.
- `app/reservar/page.tsx` → `permanentRedirect('/medicos')` (no tiene médico;
  manda a elegir). `ReservaForm` queda sin referencias.
- **Nav** (`app/components/Nav.tsx`): se quita la pestaña **Reservar**. "Consejería"
  sigue apuntando al landing `/consejeria` (info + Cannavital); su CTA de agendar
  manda a elegir médico. "Médicos" es la puerta principal al agendado.
- **Limpieza de código muerto**: tras la fusión, `ReservaForm.tsx` y el
  `BookingForm.tsx` de consejería quedan sin referencias → se **borran** en la
  misma tarea (los redirects cubren enlaces externos/marcadores).

## Tests

- `AgendarForm.test.tsx` (fusiona lo relevante de `ReservaForm.test.tsx`):
  - Las modalidades de consulta (presencial/virtual/domicilio) siempre presentes.
  - Modalidades de consejería presentes solo si el médico las ofrece.
  - WhatsApp y Domicilio no muestran el paso de horario; Video/Presencial/Virtual sí.
  - El submit ramifica al endpoint correcto según modalidad (consejería vs consulta).
- Los tests existentes que apuntaban a `ReservaForm`/`BookingForm` se migran o
  eliminan según queden obsoletos.
- `npm run build` + `npm test` verdes.

## Verificación E2E (manual, post-deploy)

Reservar en `/medicos/[slug]/agendar` en cada rama (una consejería online, una
consulta manual) → confirmar que persiste en `counseling_bookings` con su
`doctor_slug`/modalidad → verla en el portal del médico. Confirmar que
`/consejeria/[slug]` y `/reservar` redirigen.

## Notas

- El grueso del trabajo es la fusión de los dos formularios y su ramificación de
  pago; ruta, CTA, redirects y nav son cableado fino.
- Next.js 16: consultar `node_modules/next/dist/docs/` para `permanentRedirect` y
  convenciones de rutas antes de codear.
