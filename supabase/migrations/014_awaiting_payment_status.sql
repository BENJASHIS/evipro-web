-- Nuevo estado 'awaiting_payment': checkout iniciado pero pago no confirmado.
-- Separa los checkouts abandonados de un 'pending' real, para que no inflen
-- el panel admin como si fueran suscriptores por activar.

alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions add constraint subscriptions_status_check
  check (status in ('awaiting_payment', 'pending', 'active', 'cancelled', 'past_due'));

-- Reclasifica los checkouts abandonados ya existentes (pending sin pago en MP).
update public.subscriptions
  set status = 'awaiting_payment'
  where status = 'pending' and mp_payment_id is null;
