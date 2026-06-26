-- Ampliar constraint de type: re-añadir 'especialistas' (lo quitó 007) y añadir 'acceso' (Axs)
alter table public.membership_plans
  drop constraint if exists membership_plans_type_check;

alter table public.membership_plans
  add constraint membership_plans_type_check
  check (type in ('express', 'esencial', 'cannabis', 'integral', 'especialistas',
                  'acceso', 'turista_inicio', 'turista_plus'));

-- Lista de precios de consulta por duración (config de catálogo: solo se renderiza, nunca se filtra)
alter table public.membership_plans
  add column if not exists consultation_tiers jsonb;

-- Plan Axs (pago por uso) — precios por duración: virtual / presencial
insert into public.membership_plans
  (type, period, price_soles, consultation_minutes,
   discount_virtual_pct, discount_presencial_pct,
   includes_prescription, includes_renpuc_support, includes_pharmacy_coord, tickets_qty,
   consultation_tiers)
values
  ('acceso', 'mensual', 9.90, null, 0, 0, false, false, false, 0,
   '[
     {"label": "Consulta 15 min",  "minutes": 15, "modality": "virtual",    "price_soles": 15},
     {"label": "Consulta 15 min",  "minutes": 15, "modality": "presencial", "price_soles": 30},
     {"label": "Consulta 30 min",  "minutes": 30, "modality": "virtual",    "price_soles": 25},
     {"label": "Consulta 30 min",  "minutes": 30, "modality": "presencial", "price_soles": 40},
     {"label": "Consulta 60+ min", "minutes": 60, "modality": "virtual",    "price_soles": 35},
     {"label": "Consulta 60+ min", "minutes": 60, "modality": "presencial", "price_soles": 50}
   ]'::jsonb)
on conflict (type, period) do nothing;

-- Plan Especialistas (Jara + Vera) — 3 periodos con descuento progresivo; mismos tiers de consulta
insert into public.membership_plans
  (type, period, price_soles, consultation_minutes,
   discount_virtual_pct, discount_presencial_pct,
   includes_prescription, includes_renpuc_support, includes_pharmacy_coord, tickets_qty,
   consultation_tiers)
values
  ('especialistas', 'mensual',    100, null, 0, 0, false, false, false, 0,
   '[
     {"label": "Consejería 15 min",  "minutes": 15, "price_soles": 10},
     {"label": "Consulta 15 min",    "minutes": 15, "price_soles": 20},
     {"label": "Consulta 30–60 min", "minutes": 30, "price_soles": 40},
     {"label": "Consulta +1 h",      "minutes": 60, "price_soles": 60}
   ]'::jsonb),
  ('especialistas', 'trimestral', 270, null, 0, 0, false, false, false, 0,
   '[
     {"label": "Consejería 15 min",  "minutes": 15, "price_soles": 10},
     {"label": "Consulta 15 min",    "minutes": 15, "price_soles": 20},
     {"label": "Consulta 30–60 min", "minutes": 30, "price_soles": 40},
     {"label": "Consulta +1 h",      "minutes": 60, "price_soles": 60}
   ]'::jsonb),
  ('especialistas', 'semestral',  480, null, 0, 0, false, false, false, 0,
   '[
     {"label": "Consejería 15 min",  "minutes": 15, "price_soles": 10},
     {"label": "Consulta 15 min",    "minutes": 15, "price_soles": 20},
     {"label": "Consulta 30–60 min", "minutes": 30, "price_soles": 40},
     {"label": "Consulta +1 h",      "minutes": 60, "price_soles": 60}
   ]'::jsonb)
on conflict (type, period) do nothing;
