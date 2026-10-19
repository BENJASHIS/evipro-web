-- Aplicar antes de desplegar el formulario que conserva datos no registrados.
-- Los ceros históricos se conservan: no se puede inferir si fueron explícitos.
ALTER TABLE public.habit_logs ALTER COLUMN alcohol_units DROP NOT NULL;
ALTER TABLE public.habit_logs ALTER COLUMN alcohol_units DROP DEFAULT;

-- Lecturas y escrituras pasan por la API: protege datos sensibles con la
-- membresía vigente, filtro de usuario, validación, límites y versión.
DROP POLICY IF EXISTS "habit_logs_select_own" ON public.habit_logs;
DROP POLICY IF EXISTS "habit_logs_insert_own" ON public.habit_logs;
DROP POLICY IF EXISTS "habit_logs_update_own" ON public.habit_logs;
REVOKE ALL PRIVILEGES ON TABLE public.habit_logs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.habit_logs TO service_role;
