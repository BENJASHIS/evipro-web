-- Ampliar check constraint de type en membership_plans
alter table public.membership_plans
  drop constraint if exists membership_plans_type_check;

alter table public.membership_plans
  add constraint membership_plans_type_check
  check (type in ('express', 'cannabis', 'integral', 'turista_inicio', 'turista_plus'));

-- Ampliar check constraint de period en membership_plans
alter table public.membership_plans
  drop constraint if exists membership_plans_period_check;

alter table public.membership_plans
  add constraint membership_plans_period_check
  check (period in ('quincenal', 'mensual', 'trimestral', 'semestral', 'anual'));

-- Garantizar constraint UNIQUE en (type, period) para idempotencia
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'membership_plans'
      AND constraint_name = 'membership_plans_type_period_key'
  ) THEN
    ALTER TABLE public.membership_plans
      ADD CONSTRAINT membership_plans_type_period_key UNIQUE (type, period);
  END IF;
END $$;

-- Seed planes turista
insert into public.membership_plans
  (type, period, price_soles, consultation_minutes,
   discount_virtual_pct, discount_presencial_pct,
   includes_prescription, includes_renpuc_support,
   includes_pharmacy_coord, tickets_qty)
values
  ('turista_inicio', 'quincenal', 69,  45, 0, 0, true, true, true, 0),
  ('turista_inicio', 'mensual',  119,  45, 0, 0, true, true, true, 0),
  ('turista_plus',   'quincenal', 49,  20, 0, 0, true, true, true, 0),
  ('turista_plus',   'mensual',   89,  20, 0, 0, true, true, true, 0)
on conflict (type, period) do nothing;
