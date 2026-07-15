-- Créditos de consulta gratis (perk de fidelidad EVIPro).
-- Los acuña el médico a mano desde el portal para un miembro logueado.
-- El miembro los ve/comparte en /miembros; el canje y el envío a sorteo son
-- acciones manuales del médico en v1.
CREATE TABLE IF NOT EXISTS consultation_credits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text NOT NULL UNIQUE,
  user_id       uuid NOT NULL REFERENCES auth.users(id),
  member_name   text NOT NULL,
  minted_by_slug text NOT NULL,           -- médico que lo acuñó (portal por slug)
  status        text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'redeemed', 'donated')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  redeemed_at   timestamptz
);

CREATE INDEX IF NOT EXISTS consultation_credits_user_idx
  ON consultation_credits (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS consultation_credits_slug_idx
  ON consultation_credits (minted_by_slug, created_at DESC);

ALTER TABLE consultation_credits ENABLE ROW LEVEL SECURITY;

-- El miembro ve SOLO sus propios créditos (lectura con el cliente autenticado).
-- La escritura (acuñar / canjear / donar) va por el service-role del portal
-- médico, que salta RLS y verifica el token HMAC del médico.
DROP POLICY IF EXISTS "credits_member_select" ON consultation_credits;
CREATE POLICY "credits_member_select" ON consultation_credits
  FOR SELECT USING (user_id = auth.uid());
