-- 024_slot_unique.sql
-- Guard de doble-reserva a nivel de BD: no puede haber dos reservas ACTIVAS
-- para el mismo médico en el mismo horario. Índice único PARCIAL:
--   - solo aplica cuando hay slot fijo (slot_date y slot_time no nulos) —
--     WhatsApp y domicilio no tienen horario, no se restringen.
--   - excluye las canceladas (cancelled_at IS NULL) para que cancelar libere el slot.
-- Idempotente. La tabla puede estar vacía; si hubiera duplicados activos previos,
-- la creación fallaría y habría que limpiarlos antes.

CREATE UNIQUE INDEX IF NOT EXISTS counseling_bookings_slot_unique
  ON public.counseling_bookings (doctor_slug, slot_date, slot_time)
  WHERE slot_date IS NOT NULL
    AND slot_time IS NOT NULL
    AND cancelled_at IS NULL;
