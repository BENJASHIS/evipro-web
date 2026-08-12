export const MEMBERSHIP_PLAN_PUBLIC_COLUMNS =
  'id, type, period, price_soles, consultation_minutes, consultation_tiers, discount_virtual_pct, discount_presencial_pct, includes_prescription, includes_renpuc_support, includes_pharmacy_coord, tickets_qty, mp_plan_id, created_at, allows_addons'

export const PLAN_ADDON_PUBLIC_COLUMNS =
  'id, slug, label, doctor_slug, period, price_soles, active'

export const RAFFLE_TICKET_MEMBER_COLUMNS =
  'id, ticket_code, is_winner'

export const RAFFLE_PUBLIC_COLUMNS =
  'id, title, prize, draw_date, status, winner_alias'

export const COUNSELING_BOOKING_ADMIN_COLUMNS =
  'id, patient_name, patient_phone, patient_note, doctor_slug, modality, slot_date, slot_time, price_soles, paid, payment_method, confirmed_at, created_at'

export const COUNSELING_BOOKING_PORTAL_COLUMNS =
  'id, user_id, modality, slot_date, slot_time, patient_name, patient_phone, patient_note, is_first_session, price_soles, paid, payment_method, confirmed_at, cancelled_at, cancel_reason, created_at'
