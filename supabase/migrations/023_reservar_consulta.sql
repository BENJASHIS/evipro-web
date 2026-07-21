-- ═══════════════════════════════════════════════════════════════
-- 023 — /reservar: consulta médica sin membresía sobre counseling_bookings
-- Amplía los CHECK para admitir las modalidades de consulta médica
-- (presencial/virtual/domicilio) y el cobro manual (payment_method='manual').
-- La consulta médica reusa la misma tabla que la consejería; se distingue
-- por el valor de modality. Cobro fuera de línea: paid=false, method='manual'.
-- Idempotente.
-- ═══════════════════════════════════════════════════════════════

alter table public.counseling_bookings
  drop constraint if exists counseling_bookings_modality_check;
alter table public.counseling_bookings
  add constraint counseling_bookings_modality_check
  check (modality in ('video','messaging','whatsapp','presencial','virtual','domicilio'));

alter table public.counseling_bookings
  drop constraint if exists counseling_bookings_payment_method_check;
alter table public.counseling_bookings
  add constraint counseling_bookings_payment_method_check
  check (payment_method in ('mercadopago','yape','free','manual'));
