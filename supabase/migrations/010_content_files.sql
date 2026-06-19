-- 010_content_files.sql
-- Soporte de archivos (infografías/PDF) en contenido exclusivo de miembros.

alter table public.content
  add column if not exists file_path text,
  add column if not exists file_kind text check (file_kind in ('image', 'pdf')),
  add column if not exists category text;

-- body ahora es opcional (sirve como descripción cuando el ítem es un archivo)
alter table public.content alter column body drop not null;

-- content_type admite 'infographic'
alter table public.content drop constraint if exists content_content_type_check;
alter table public.content add constraint content_content_type_check
  check (content_type in ('article', 'video', 'guide', 'infographic'));

-- Bucket privado para los archivos
insert into storage.buckets (id, name, public)
values ('member-content', 'member-content', false)
on conflict (id) do nothing;

-- Storage: solo admin escribe/actualiza/borra en este bucket.
-- La lectura se hace con el service role (URLs firmadas), por eso no hay policy de select.
create policy "member_content_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'member-content' and public.is_admin());
create policy "member_content_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'member-content' and public.is_admin());
create policy "member_content_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'member-content' and public.is_admin());
