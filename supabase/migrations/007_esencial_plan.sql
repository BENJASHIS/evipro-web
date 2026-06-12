-- Ampliar constraint de type para incluir 'esencial'
alter table public.membership_plans
  drop constraint if exists membership_plans_type_check;

alter table public.membership_plans
  add constraint membership_plans_type_check
  check (type in ('express', 'esencial', 'cannabis', 'integral', 'turista_inicio', 'turista_plus'));

-- Seed Plan Esencial
insert into public.membership_plans
  (type, period, price_soles, consultation_minutes,
   discount_virtual_pct, discount_presencial_pct,
   includes_prescription, includes_renpuc_support,
   includes_pharmacy_coord, tickets_qty)
values
  ('esencial', 'mensual', 29, 15, 57, 0, true, false, false, 1)
on conflict (type, period) do nothing;
