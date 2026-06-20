-- Mensajería 1:1 miembro↔clínica (canal operativo)
create table public.conversations (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  last_message_at      timestamptz,
  last_message_preview text,
  last_sender_role     text check (last_sender_role in ('member','admin')),
  member_last_read_at  timestamptz,
  admin_last_read_at   timestamptz,
  created_at           timestamptz default now(),
  unique (user_id)
);

create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_role     text not null check (sender_role in ('member','admin')),
  body            text not null,
  created_at      timestamptz default now()
);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "conversations_member_select" on public.conversations
  for select using (user_id = auth.uid());
create policy "conversations_admin_all" on public.conversations
  for all using (public.is_admin());

create policy "messages_member_select" on public.messages
  for select using (
    conversation_id in (select id from public.conversations where user_id = auth.uid())
  );
create policy "messages_admin_all" on public.messages
  for all using (public.is_admin());
