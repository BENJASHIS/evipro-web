-- ═══════════════════════════════════════════════════════════════
-- 021 — Gating de contenido por módulo (nuevo modelo base + addons)
-- ═══════════════════════════════════════════════════════════════
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
    -- EVIPro: requiere la membresía completa activa.
    or (min_plan = 'integral' and exists (
      select 1 from public.subscriptions s
      join public.membership_plans mp on s.plan_id = mp.id
      where s.user_id = auth.uid() and s.status = 'active' and mp.type = 'evipro'
    ))
    -- Cannabis: requiere el módulo de especialista de cannabis activo.
    or (min_plan = 'cannabis' and exists (
      select 1 from public.subscriptions s
      join public.subscription_addons sa on sa.subscription_id = s.id
      join public.plan_addons pa on pa.id = sa.addon_id
      where s.user_id = auth.uid() and s.status = 'active'
      and pa.slug = 'especialista_jara'
    ))
  );
