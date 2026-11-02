-- 033: el número de operación no sirve para dos reservas, sin importar el medio
-- (revisión final del pago al reservar, 2026-11-01). Rehace el índice de 032, que ya está en producción:
-- - sin payment_method: Carlos puede confirmar con un número sin elegir Yape o Plin;
-- - cuenta también las reservas canceladas que se pagaron (devolución pendiente, pagadas sin turno),
--   para que ese número no se reutilice; el código de una reserva cancelada sin pagar vuelve a servir.
-- Aplicar en Supabase → SQL Editor.

drop index if exists public.counseling_bookings_payment_reference_unique;
create unique index counseling_bookings_payment_reference_unique
  on public.counseling_bookings (payment_reference)
  where payment_reference is not null and (cancelled_at is null or paid);
