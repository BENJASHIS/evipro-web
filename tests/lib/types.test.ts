import { describe, it, expect } from 'vitest'
import type { MembershipPlan, Subscription } from '../../lib/types'

describe('types', () => {
  it('MembershipPlan tiene los campos requeridos', () => {
    const plan: MembershipPlan = {
      id: 'uuid-1',
      type: 'cannabis',
      period: 'mensual',
      price_soles: 49,
      consultation_minutes: null,
      discount_virtual_pct: 79,
      discount_presencial_pct: 0,
      includes_prescription: true,
      includes_renpuc_support: true,
      includes_pharmacy_coord: true,
      tickets_qty: 3,
      culqi_plan_id: null,
      created_at: new Date().toISOString(),
    }
    expect(plan.type).toBe('cannabis')
    expect(plan.price_soles).toBe(49)
  })

  it('Subscription tiene status válidos', () => {
    const sub: Subscription = {
      id: 'uuid-2',
      user_id: 'uuid-user',
      plan_id: 'uuid-plan',
      status: 'active',
      started_at: new Date().toISOString(),
      period_start: new Date().toISOString(),
      period_end: new Date().toISOString(),
      culqi_subscription_id: 'sub_123',
      culqi_customer_id: 'cus_123',
      created_at: new Date().toISOString(),
    }
    expect(['pending', 'active', 'cancelled', 'past_due']).toContain(sub.status)
  })
})

describe('PlanType turista', () => {
  it('acepta turista_inicio como PlanType válido', () => {
    const tipo: import('../../lib/types').PlanType = 'turista_inicio'
    expect(tipo).toBe('turista_inicio')
  })

  it('acepta turista_plus como PlanType válido', () => {
    const tipo: import('../../lib/types').PlanType = 'turista_plus'
    expect(tipo).toBe('turista_plus')
  })

  it('acepta quincenal como PlanPeriod válido', () => {
    const periodo: import('../../lib/types').PlanPeriod = 'quincenal'
    expect(periodo).toBe('quincenal')
  })
})
