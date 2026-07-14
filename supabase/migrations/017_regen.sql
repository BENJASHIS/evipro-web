-- Regen — Regulador de Entorno. Evaluaciones de entorno social del miembro.
-- NO guarda texto libre ni datos de terceros: solo scores, banderas y metadatos.
CREATE TABLE IF NOT EXISTS regen_evaluaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  version text NOT NULL,
  scores jsonb NOT NULL,
  flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  safety_triggered boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS regen_evaluaciones_user_idx
  ON regen_evaluaciones (user_id, created_at DESC);

ALTER TABLE regen_evaluaciones ENABLE ROW LEVEL SECURITY;

-- El miembro ve SOLO sus propias evaluaciones (lectura con el cliente autenticado).
-- La escritura va por el service-role (server action), que salta RLS.
DROP POLICY IF EXISTS "regen_member_select" ON regen_evaluaciones;
CREATE POLICY "regen_member_select" ON regen_evaluaciones
  FOR SELECT USING (user_id = auth.uid());
