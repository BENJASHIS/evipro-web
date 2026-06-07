-- Habilitar extensión para UUID
create extension if not exists "uuid-ossp";

-- PERFILES (extiende auth.users de Supabase)
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text not null,
  phone               text,
  dni_encrypted       text,
  dni_exp_encrypted   text,
  city                text,
  shalom_address      text,
  member_since        timestamptz default now()
);

-- PLANES DE MEMBRESÍA
create table public.membership_plans (
  id                      uuid primary key default uuid_generate_v4(),
  type                    text not null check (type in ('express', 'cannabis', 'integral')),
  period                  text not null check (period in ('mensual', 'trimestral', 'semestral', 'anual')),
  price_soles             numeric not null,
  consultation_minutes    int,
  discount_virtual_pct    int not null default 0,
  discount_presencial_pct int not null default 0,
  includes_prescription   boolean not null default false,
  includes_renpuc_support boolean not null default false,
  includes_pharmacy_coord boolean not null default false,
  tickets_qty             int not null default 0,
  culqi_plan_id           text,
  created_at              timestamptz default now()
);

-- SUSCRIPCIONES
create table public.subscriptions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  plan_id               uuid not null references public.membership_plans(id),
  status                text not null default 'pending' check (status in ('pending', 'active', 'cancelled', 'past_due')),
  started_at            timestamptz,
  period_start          timestamptz,
  period_end            timestamptz,
  culqi_subscription_id text,
  culqi_customer_id     text,
  created_at            timestamptz default now()
);

-- PAGOS
create table public.payments (
  id              uuid primary key default uuid_generate_v4(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  amount_soles    numeric not null,
  status          text not null check (status in ('paid', 'failed', 'refunded')),
  culqi_charge_id text,
  paid_at         timestamptz,
  created_at      timestamptz default now()
);

-- SORTEOS
create table public.raffles (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  prize            text not null,
  prize_category   text check (prize_category in ('consulta', 'dispositivo_medico', 'otro')),
  draw_date        timestamptz not null,
  status           text not null default 'upcoming' check (status in ('upcoming', 'completed')),
  winner_ticket_id uuid,
  winner_alias     text,
  created_at       timestamptz default now()
);

-- TICKETS DE SORTEO
create table public.raffle_tickets (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  ticket_code     text not null unique,
  raffle_id       uuid references public.raffles(id),
  is_winner       boolean not null default false,
  issued_at       timestamptz default now()
);

-- FK circular de raffles → raffle_tickets
alter table public.raffles
  add constraint raffles_winner_ticket_id_fkey
  foreign key (winner_ticket_id) references public.raffle_tickets(id);

-- CONTENIDO EXCLUSIVO
create table public.content (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  body         text not null,
  content_type text not null check (content_type in ('article', 'video', 'guide')),
  min_plan     text check (min_plan in ('express', 'cannabis', 'integral')),
  published_at timestamptz,
  created_at   timestamptz default now()
);

-- SOLICITUDES DE FARMACIA
create table public.pharmacy_requests (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  product_notes   text not null,
  shalom_address  text not null,
  status          text not null default 'pending' check (status in ('pending', 'coordinated', 'shipped', 'delivered')),
  tracking_info   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.raffle_tickets enable row level security;
alter table public.raffles enable row level security;
alter table public.content enable row level security;
alter table public.pharmacy_requests enable row level security;
alter table public.membership_plans enable row level security;

-- Función: verificar si el usuario es admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
    and raw_user_meta_data->>'role' = 'admin'
  );
$$;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- membership_plans: lectura pública
create policy "plans_select_public" on public.membership_plans
  for select using (true);
create policy "plans_admin_all" on public.membership_plans
  for all using (public.is_admin());

-- subscriptions
create policy "subs_select_own" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin());
create policy "subs_service_insert" on public.subscriptions
  for insert with check (public.is_admin());
create policy "subs_service_update" on public.subscriptions
  for update using (public.is_admin());

-- payments
create policy "payments_select_own" on public.payments
  for select using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and s.user_id = auth.uid()
    ) or public.is_admin()
  );
create policy "payments_service_insert" on public.payments
  for insert with check (public.is_admin());

-- raffle_tickets
create policy "tickets_select_own" on public.raffle_tickets
  for select using (auth.uid() = user_id or is_winner = true or public.is_admin());
create policy "tickets_service_insert" on public.raffle_tickets
  for insert with check (public.is_admin());

-- raffles: lectura pública
create policy "raffles_select_public" on public.raffles
  for select using (true);
create policy "raffles_admin_all" on public.raffles
  for all using (public.is_admin());

-- content con filtro por plan
create policy "content_select" on public.content
  for select using (
    min_plan is null
    or public.is_admin()
    or exists (
      select 1 from public.subscriptions s
      join public.membership_plans mp on s.plan_id = mp.id
      where s.user_id = auth.uid()
      and s.status = 'active'
      and (
        min_plan = 'express'
        or (min_plan = 'cannabis' and mp.type in ('cannabis', 'integral'))
        or (min_plan = 'integral' and mp.type = 'integral')
      )
    )
  );
create policy "content_admin_all" on public.content
  for all using (public.is_admin());

-- pharmacy_requests
create policy "pharmacy_select_own" on public.pharmacy_requests
  for select using (auth.uid() = user_id or public.is_admin());
create policy "pharmacy_insert_own" on public.pharmacy_requests
  for insert with check (auth.uid() = user_id);
create policy "pharmacy_admin_update" on public.pharmacy_requests
  for update using (public.is_admin());
