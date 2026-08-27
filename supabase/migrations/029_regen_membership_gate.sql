-- 029 — Regen solo para membresía activa.
--
-- La pantalla y la server action ya comprueban membresía activa. Esta política
-- evita que un usuario sin membresía vigente lea evaluaciones de Regen por la
-- API directa de Supabase aunque conserve sesión.

DROP POLICY IF EXISTS "regen_member_select" ON public.regen_evaluaciones;
DROP POLICY IF EXISTS "regen_member_select_active" ON public.regen_evaluaciones;

CREATE POLICY "regen_member_select_active" ON public.regen_evaluaciones
  FOR SELECT USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.user_id = auth.uid()
        AND s.status = 'active'
    )
  );
