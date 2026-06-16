import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  // Get last 20 submissions across all agents ordered by submitted_at
  const { data, error } = await supabaseAdmin
    .from('daily_reports')
    .select('*, agent:agents(full_name, tier)')
    .order('submitted_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
