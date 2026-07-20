-- ═══════════════════════════════════════════════════════════════
-- 020 — Membresía base (basica/evipro) + módulos de especialista
-- ═══════════════════════════════════════════════════════════════

-- 1) Ampliar el check de type para los dos tipos base nuevos.
alter table public.membership_plans
  drop constraint if exists membership_plans_type_check;
alter table public.membership_plans
  add constraint membership_plans_type_check
  check (type in ('express', 'esencial', 'cannabis', 'integral', 'especialistas',
                  'acceso', 'turista_inicio', 'turista_plus', 'basica', 'evipro'));

-- 2) Bandera: ¿este plan admite módulos de especialista? Solo EVIPro.
alter table public.membership_plans
  add column if not exists allows_addons boolean not null default false;

-- 3) Módulos de especialista (add-ons). Precio por (slug, period).
create table if not exists public.plan_addons (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null,
  label       text not null,
  doctor_slug text,
  period      text not null check (period in ('mensual', 'trimestral', 'semestral')),
  price_soles numeric not null,
  active      boolean not null default true,
  created_at  timestamptz default now(),
  unique (slug, period)
);
alter table public.plan_addons enable row level security;
-- Lectura pública (catálogo); escritura solo admin.
create policy "plan_addons_select_public" on public.plan_addons
  for select using (true);
create policy "plan_addons_admin_all" on public.plan_addons
  for all using (public.is_admin()) with check (public.is_admin());

-- 4) Módulos elegidos por suscripción.
create table if not exists public.subscription_addons (
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  addon_id        uuid not null references public.plan_addons(id),
  created_at      timestamptz default now(),
  primary key (subscription_id, addon_id)
);
alter table public.subscription_addons enable row level security;
-- El miembro ve solo los add-ons de sus propias suscripciones.
create policy "subscription_addons_select_own" on public.subscription_addons
  for select using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_addons.subscription_id
      and s.user_id = auth.uid()
    )
  );
create policy "subscription_addons_admin_all" on public.subscription_addons
  for all using (public.is_admin()) with check (public.is_admin());

-- 5) Seed de las dos membresías base. Precios = valores por defecto,
--    editables por Carlos en Supabase. (unique (type, period) evita duplicar.)
insert into public.membership_plans
  (type, period, price_soles, discount_virtual_pct, discount_presencial_pct,
   includes_prescription, includes_renpuc_support, includes_pharmacy_coord,
   tickets_qty, allows_addons)
values
  -- Básica / Apoyo: plana, sin módulos, beneficios chicos.
  ('basica', 'mensual',  9.90, 0, 0, false, false, false, 1, false),
  -- EVIPro completa: única con allows_addons = true.
  ('evipro', 'mensual',  49.00, 30, 20, true, true, true, 1, true),
  ('evipro', 'trimestral', 129.00, 30, 20, true, true, true, 1, true),
  ('evipro', 'semestral',  239.00, 30, 20, true, true, true, 1, true)
on conflict (type, period) do nothing;

-- 6) Seed de los dos módulos de especialista (precio por período).
insert into public.plan_addons (slug, label, doctor_slug, period, price_soles)
values
  ('especialista_jara', 'Cannabis medicinal (Dr. Jara)', 'dr-jara', 'mensual',    20.00),
  ('especialista_jara', 'Cannabis medicinal (Dr. Jara)', 'dr-jara', 'trimestral', 54.00),
  ('especialista_jara', 'Cannabis medicinal (Dr. Jara)', 'dr-jara', 'semestral',  99.00),
  ('especialista_vera', 'Geriatría / adulto mayor (Dr. Vera)', 'dr-vera', 'mensual',    20.00),
  ('especialista_vera', 'Geriatría / adulto mayor (Dr. Vera)', 'dr-vera', 'trimestral', 54.00),
  ('especialista_vera', 'Geriatría / adulto mayor (Dr. Vera)', 'dr-vera', 'semestral',  99.00)
on conflict (slug, period) do nothing;
