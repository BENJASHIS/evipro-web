-- Agregar tipo de documento y país de origen a profiles
alter table public.profiles
  add column if not exists doc_type text
    constraint profiles_doc_type_check
      check (doc_type in ('dni', 'pasaporte', 'carnet_extranjeria', 'cedula_identidad')),
  add column if not exists country_origin text;
