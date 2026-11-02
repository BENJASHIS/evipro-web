-- 032: pago al reservar con Yape y Plin (docs/superpowers/specs/2026-11-01-pago-reserva-yape-plin-design.md)
-- Turno apartado 1 hora (pago_hasta), número de operación, confirmación con monto recibido,
-- cambios de fecha y devoluciones pendientes. Aplicar en Supabase → SQL Editor.

alter table public.counseling_bookings
  add column if not exists pago_hasta timestamptz,
  add column if not exists payment_reference text,
  add column if not exists payment_reported_at timestamptz,
  add column if not exists amount_received numeric(8,2),
  add column if not exists visit_number smallint check (visit_number between 1 and 3),
  add column if not exists policy_version text,
  add column if not exists reschedule_count smallint not null default 0,
  add column if not exists refund_pending boolean not null default false,
  add column if not exists refunded_at timestamptz;

alter table public.counseling_bookings drop constraint if exists counseling_bookings_payment_method_check;
alter table public.counseling_bookings add constraint counseling_bookings_payment_method_check
  check (payment_method in ('mercadopago','yape','plin','free','manual'));

-- Un número de operación (o código de crédito) no sirve para dos reservas.
create unique index if not exists counseling_bookings_payment_reference_unique
  on public.counseling_bookings (payment_method, payment_reference)
  where payment_reference is not null;

-- QR de Yape y Plin: bucket privado; la web los sirve solo con una reserva vigente.
insert into storage.buckets (id, name, public) values ('pagos-qr', 'pagos-qr', false)
  on conflict (id) do nothing;
