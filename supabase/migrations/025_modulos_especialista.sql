-- ═══════════════════════════════════════════════════════════════
-- 025 — El módulo de cannabis (Dr. Jara) sale del configurador
--
-- Decisión de Carlos (2026-07-31): la membresía EVIPro ya incluye su
-- atención, así que cobrarla otra vez como módulo aparte era cobrar dos
-- veces lo mismo. Queda un solo módulo, el de Dr. Vera, al doble (100).
--
-- No se borran filas: `active = false` mantiene intactas las suscripciones
-- que ya compraron el módulo (subscription_addons apunta a estos ids) y
-- deja el camino de vuelta si algún día se reactiva.
-- ═══════════════════════════════════════════════════════════════

-- 1) Fuera del catálogo público (app/planes filtra por active = true).
update public.plan_addons set active = false
  where slug = 'especialista_jara';

-- 2) Dr. Vera al doble, manteniendo el descuento por volumen
--    (mensual ×3 −10% = trimestral; mensual ×6 −~17% = semestral).
update public.plan_addons set price_soles = 100
  where slug = 'especialista_vera' and period = 'mensual';

update public.plan_addons set price_soles = 270
  where slug = 'especialista_vera' and period = 'trimestral';

update public.plan_addons set price_soles = 496
  where slug = 'especialista_vera' and period = 'semestral';

-- 3) El contenido de cannabis ya no puede depender de un módulo que nadie
--    puede comprar: pasa a pedir la membresía EVIPro completa, que es
--    justamente lo que ahora incluye la atención de cannabis.
drop policy if exists "content_select" on public.content;

create policy "content_select" on public.content
  for select using (
    min_plan is null
    or public.is_admin()
    -- General: cualquier suscripción activa (Básica o EVIPro).
    or (min_plan = 'express' and exists (
      select 1 from public.subscriptions s
      where s.user_id = auth.uid() and s.status = 'active'
    ))
    -- EVIPro y cannabis: requieren la membresía completa activa.
    or (min_plan in ('integral', 'cannabis') and exists (
      select 1 from public.subscriptions s
      join public.membership_plans mp on s.plan_id = mp.id
      where s.user_id = auth.uid() and s.status = 'active' and mp.type = 'evipro'
    ))
  );
