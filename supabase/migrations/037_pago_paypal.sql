-- PayPal como medio de pago al reservar, para pacientes del extranjero (2026-11-07).
alter table public.counseling_bookings drop constraint if exists counseling_bookings_payment_method_check;
alter table public.counseling_bookings add constraint counseling_bookings_payment_method_check
  check (payment_method in ('mercadopago','yape','plin','paypal','free','manual'));
