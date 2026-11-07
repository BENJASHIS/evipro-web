-- 036: cuándo autorizó el paciente el uso de sus datos personales y de salud al reservar (2026-11-06).
-- Vacío = reserva anterior a esta casilla. La fecha la pone el servidor.
-- Aplicar en Supabase → SQL Editor ANTES de subir el código que la usa: sin la columna, reservar falla.

alter table public.counseling_bookings add column if not exists consent_at timestamptz;
