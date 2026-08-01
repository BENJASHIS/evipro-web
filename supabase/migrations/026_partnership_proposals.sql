-- ═══════════════════════════════════════════════════════════════
-- 026 — Puerta de propuestas: quien quiere trabajar con EVIPro
--
-- Contiene datos de contacto de terceros, así que RLS va cerrada: solo
-- admin lee y actualiza. La inserción entra por /api/propuestas con el
-- service client, que salta RLS — el navegador nunca escribe aquí.
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.partnership_proposals (
  id           uuid primary key default uuid_generate_v4(),
  full_name    text not null,
  phone        text not null,
  email        text not null,
  occupation   text not null,
  license      text,
  city         text not null,
  proposal     text not null,
  contribution text not null,
  needs        text not null,
  status       text not null default 'nueva'
                 check (status in ('nueva', 'contestada', 'archivada')),
  created_at   timestamptz default now()
);

alter table public.partnership_proposals enable row level security;

-- Sin política de insert público: nadie escribe desde el navegador.
-- El `drop` va delante porque `create policy` no admite `if not exists`: sin
-- esto, re-ejecutar la migración aborta con 42710 y deja dudando si se aplicó.
drop policy if exists "partnership_proposals_admin_all" on public.partnership_proposals;
create policy "partnership_proposals_admin_all" on public.partnership_proposals
  for all using (public.is_admin());

create index if not exists partnership_proposals_status_idx
  on public.partnership_proposals (status, created_at desc);
