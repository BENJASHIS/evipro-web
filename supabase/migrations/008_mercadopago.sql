-- Migración: Culqi → Mercado Pago
-- Reemplaza culqi_* con mp_* en subscriptions
-- Agrega mp_payment_id a counseling_bookings

-- subscriptions
ALTER TABLE subscriptions
  DROP COLUMN IF EXISTS culqi_subscription_id,
  DROP COLUMN IF EXISTS culqi_customer_id;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS mp_preference_id TEXT,
  ADD COLUMN IF NOT EXISTS mp_payment_id TEXT;

-- membership_plans
ALTER TABLE membership_plans
  DROP COLUMN IF EXISTS culqi_plan_id;

ALTER TABLE membership_plans
  ADD COLUMN IF NOT EXISTS mp_plan_id TEXT;

-- counseling_bookings
ALTER TABLE counseling_bookings
  DROP COLUMN IF EXISTS culqi_order_id;

ALTER TABLE counseling_bookings
  ADD COLUMN IF NOT EXISTS mp_preference_id TEXT,
  ADD COLUMN IF NOT EXISTS mp_payment_id TEXT;
