import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PLAN_ADDON_PUBLIC_COLUMNS } from '@/lib/db-columns'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('plan_addons')
    .select(PLAN_ADDON_PUBLIC_COLUMNS)
    .eq('active', true)
  return NextResponse.json(data ?? [])
}
