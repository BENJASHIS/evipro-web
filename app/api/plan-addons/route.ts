import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('plan_addons')
    .select('*')
    .eq('active', true)
  return NextResponse.json(data ?? [])
}
