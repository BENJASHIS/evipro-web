create table counseling_bookings (
  id              uuid primary key default gen_random_uuid(),
  doctor_slug     text not null,
  modality        text not null check (modality in ('video','messaging','whatsapp')),
  slot_date       date,
  slot_time       time,
  patient_name    text not null,
  patient_phone   text not null,
  patient_note    text,
  is_first_session boolean default true,
  price_soles     integer not null,
  paid            boolean default false,
  payment_method  text check (payment_method in ('culqi','yape','free')),
  culqi_order_id  text,
  confirmed_at    timestamptz,
  created_at      timestamptz default now()
);

create index on counseling_bookings (doctor_slug, patient_phone);
create index on counseling_bookings (doctor_slug, slot_date, slot_time);
