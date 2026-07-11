ALTER TABLE counseling_bookings
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS counseling_bookings_user_idx
  ON counseling_bookings (user_id);

-- El miembro ve SOLO sus propias reservas (lectura con el cliente autenticado).
DROP POLICY IF EXISTS "bookings_member_select" ON counseling_bookings;
CREATE POLICY "bookings_member_select" ON counseling_bookings
  FOR SELECT USING (user_id = auth.uid());
