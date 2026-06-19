export type PlanType = 'express' | 'esencial' | 'cannabis' | 'integral' | 'especialistas' | 'turista_inicio' | 'turista_plus'
export type PlanPeriod = 'mensual' | 'trimestral' | 'semestral' | 'anual' | 'quincenal'
export type SubscriptionStatus = 'pending' | 'active' | 'cancelled' | 'past_due'
export type ContentMinPlan = 'express' | 'cannabis' | 'integral'
export type PharmacyStatus = 'pending' | 'coordinated' | 'shipped' | 'delivered'

export type DocType = 'dni' | 'pasaporte' | 'carnet_extranjeria' | 'cedula_identidad'

export interface MembershipPlan {
  id: string
  type: PlanType
  period: PlanPeriod
  price_soles: number
  consultation_minutes: number | null
  discount_virtual_pct: number
  discount_presencial_pct: number
  includes_prescription: boolean
  includes_renpuc_support: boolean
  includes_pharmacy_coord: boolean
  tickets_qty: number
  mp_plan_id: string | null
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  dni_encrypted: string | null
  dni_exp_encrypted: string | null
  city: string | null
  shalom_address: string | null
  member_since: string
  doc_type: DocType | null
  country_origin: string | null
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  started_at: string | null
  period_start: string | null
  period_end: string | null
  mp_preference_id: string | null
  mp_payment_id: string | null
  created_at: string
}

export interface RaffleTicket {
  id: string
  user_id: string
  subscription_id: string
  ticket_code: string
  raffle_id: string | null
  is_winner: boolean
  issued_at: string
}

export interface Raffle {
  id: string
  title: string
  prize: string
  prize_category: 'consulta' | 'dispositivo_medico' | 'otro' | null
  draw_date: string
  status: 'upcoming' | 'completed'
  winner_ticket_id: string | null
  winner_alias: string | null
  created_at: string
}

export interface ContentItem {
  id: string
  title: string
  body: string
  content_type: 'article' | 'video' | 'guide'
  min_plan: ContentMinPlan | null
  published_at: string | null
  created_at: string
}

export interface PharmacyRequest {
  id: string
  user_id: string
  subscription_id: string
  product_notes: string
  shalom_address: string
  status: PharmacyStatus
  tracking_info: string | null
  created_at: string
  updated_at: string
}
