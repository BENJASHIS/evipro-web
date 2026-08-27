-- Bitácora de hábitos para miembros.
-- Registro discreto y estructurado; no guarda texto libre ni nombres de fármacos.
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  version text NOT NULL,
  sleep_hours numeric(4,2),
  sleep_quality smallint CHECK (sleep_quality IS NULL OR sleep_quality BETWEEN 1 AND 5),
  sleepiness smallint CHECK (sleepiness IS NULL OR sleepiness BETWEEN 0 AND 3),
  water_ml integer CHECK (water_ml IS NULL OR water_ml BETWEEN 0 AND 10000),
  alcohol_units numeric(4,1) NOT NULL DEFAULT 0 CHECK (alcohol_units BETWEEN 0 AND 30),
  medication_status text NOT NULL DEFAULT 'not_applicable'
    CHECK (medication_status IN ('not_applicable', 'taken', 'missed', 'changed')),
  meals_regular boolean,
  symptoms jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date),
  CHECK (sleep_hours IS NULL OR sleep_hours BETWEEN 0 AND 24)
);

CREATE INDEX IF NOT EXISTS habit_logs_user_date_idx
  ON public.habit_logs (user_id, log_date DESC);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "habit_logs_select_own" ON public.habit_logs;
CREATE POLICY "habit_logs_select_own" ON public.habit_logs
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "habit_logs_insert_own" ON public.habit_logs;
CREATE POLICY "habit_logs_insert_own" ON public.habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "habit_logs_update_own" ON public.habit_logs;
CREATE POLICY "habit_logs_update_own" ON public.habit_logs
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());
