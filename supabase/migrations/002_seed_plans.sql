-- Plan Express (solo mensual)
insert into public.membership_plans
  (type, period, price_soles, consultation_minutes, discount_virtual_pct, discount_presencial_pct,
   includes_prescription, includes_renpuc_support, includes_pharmacy_coord, tickets_qty)
values
  ('express', 'mensual', 10, 15, 0, 0, true, false, false, 0);

-- Plan Cannabis — 4 periodos
insert into public.membership_plans
  (type, period, price_soles, consultation_minutes, discount_virtual_pct, discount_presencial_pct,
   includes_prescription, includes_renpuc_support, includes_pharmacy_coord, tickets_qty)
values
  ('cannabis', 'mensual',    49,  null, 79, 0,  true, true, true, 3),
  ('cannabis', 'trimestral', 132, null, 79, 0,  true, true, true, 10),
  ('cannabis', 'semestral',  235, null, 79, 0,  true, true, true, 20),
  ('cannabis', 'anual',      411, null, 79, 0,  true, true, true, 42);

-- Plan Integral — 4 periodos
insert into public.membership_plans
  (type, period, price_soles, consultation_minutes, discount_virtual_pct, discount_presencial_pct,
   includes_prescription, includes_renpuc_support, includes_pharmacy_coord, tickets_qty)
values
  ('integral', 'mensual',    79,  null, 86, 60, true, true, true, 8),
  ('integral', 'trimestral', 213, null, 86, 60, true, true, true, 26),
  ('integral', 'semestral',  379, null, 86, 60, true, true, true, 52),
  ('integral', 'anual',      662, null, 86, 60, true, true, true, 108);
