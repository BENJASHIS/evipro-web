-- supabase/migrations/015_booking_cancel.sql
ALTER TABLE counseling_bookings
  ADD COLUMN IF NOT EXISTS cancelled_at  timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text;
