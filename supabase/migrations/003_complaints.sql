-- Libro de Reclamaciones Virtual (INDECOPI - Ley 29571)
create table public.complaints (
  id              uuid primary key default uuid_generate_v4(),
  code            text not null unique,   -- formato LR-YYYY-NNNNN
  tipo            text not null check (tipo in ('reclamo', 'queja')),
  full_name       text not null,
  dni             text not null,
  email           text not null,
  phone           text,
  servicio        text not null,          -- descripción del bien/servicio
  descripcion     text not null,          -- detalle del reclamo/queja
  pretension      text not null,          -- qué solicita el consumidor
  status          text not null default 'pendiente' check (status in ('pendiente', 'en_proceso', 'resuelto', 'cerrado')),
  respuesta       text,                   -- respuesta del proveedor
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.complaints enable row level security;

-- Cualquiera puede insertar (público, sin login)
create policy "complaints_insert_public" on public.complaints
  for insert with check (true);

-- Solo el admin puede ver y gestionar
create policy "complaints_admin_all" on public.complaints
  for all using (public.is_admin());

-- El que reclama puede ver su propia queja por código + email
create policy "complaints_select_by_code" on public.complaints
  for select using (true);
