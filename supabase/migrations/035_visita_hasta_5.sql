-- 035: el paciente declara hasta la 5ª consulta («Quinta o más»): la virtual baja hasta la 4ª y
-- los miembros no pagan desde la 5ª (reajuste de Carlos, 2026-11-03). 032 la limitaba a 1–3.
-- Aplicar en Supabase → SQL Editor ANTES de subir el código: sin esto, reservar la 4ª o la 5ª falla.

alter table public.counseling_bookings drop constraint if exists counseling_bookings_visit_number_check;
alter table public.counseling_bookings
  add constraint counseling_bookings_visit_number_check check (visit_number between 1 and 5);
