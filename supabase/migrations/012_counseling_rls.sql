-- 012_counseling_rls.sql
-- Cierra el hueco crítico: counseling_bookings estaba sin RLS, accesible con la
-- anon key pública (datos de pacientes: nombre, teléfono, notas).
--
-- Todo el acceso server-side (rutas de reserva, portal médico, panel admin,
-- webhook de pago) usa el service-role, que ignora RLS. Con RLS activado y sin
-- policies para anon/authenticated, la tabla queda inaccesible vía API pública.
-- Se agrega solo una policy de admin por si en el futuro se lee con sesión.

alter table public.counseling_bookings enable row level security;

-- Admins (is_admin) pueden todo; el resto queda denegado por defecto.
drop policy if exists "counseling_admin_all" on public.counseling_bookings;
create policy "counseling_admin_all" on public.counseling_bookings
  for all using (public.is_admin());
