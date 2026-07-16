-- Arreglos de seguridad (auditoría 2026-07-15). Tres correcciones:

-- 1) is_admin(): NO confiar en raw_user_meta_data (lo edita el propio usuario →
--    escalada a admin). Basar la autorización en la allowlist de emails, que debe
--    coincidir con ADMIN_EMAILS en lib/auth.ts.
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
      and lower(email) = any (array['drecs2003@gmail.com', 'consulta@evipro.pe'])
  );
$$;

-- 2) complaints: la policy "select_by_code" era USING (true) → cualquiera con la
--    anon key leía DNI/nombre/email/teléfono de TODOS los reclamantes. Se elimina.
--    La app nunca lee complaints con el cliente anónimo (solo inserta); el admin
--    sigue viendo todo por "complaints_admin_all". Una futura consulta por
--    código+email debe ir por una API route con service-role que valide ambos.
drop policy if exists "complaints_select_by_code" on public.complaints;

-- 3) counseling_bookings: el CHECK de payment_method seguía en ('culqi','yape',
--    'free') desde la migración 006; la 008 (Culqi→MP) no lo actualizó, así que
--    toda reserva con 'mercadopago' era rechazada por Postgres. Se corrige.
alter table public.counseling_bookings
  drop constraint if exists counseling_bookings_payment_method_check;
alter table public.counseling_bookings
  add constraint counseling_bookings_payment_method_check
  check (payment_method in ('mercadopago', 'yape', 'free'));
