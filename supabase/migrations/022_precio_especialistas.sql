-- ═══════════════════════════════════════════════════════════════
-- 022 — Subir precio de los módulos de especialista (base 20 → 50)
-- Reescala los tres períodos manteniendo el descuento por volumen
-- (mensual ×3 −10% = trimestral; mensual ×6 −~17% = semestral).
-- Aplica a ambos: Dr. Jara (cannabis) y Dr. Vera (geriatría).
-- ═══════════════════════════════════════════════════════════════

update public.plan_addons set price_soles = 50
  where slug in ('especialista_jara', 'especialista_vera') and period = 'mensual';

update public.plan_addons set price_soles = 135
  where slug in ('especialista_jara', 'especialista_vera') and period = 'trimestral';

update public.plan_addons set price_soles = 248
  where slug in ('especialista_jara', 'especialista_vera') and period = 'semestral';
