-- 034: qué aliado mandó al paciente (enlace ?convenio=<slug>, 2026-11-03). Vacío = llegó sin convenio.
-- El servidor solo guarda slugs de CONVENIOS (lib/consulta-pricing.ts).
-- Aplicar en Supabase → SQL Editor ANTES de subir el código que la usa: sin la columna, reservar falla.

alter table public.counseling_bookings add column if not exists convenio text;
