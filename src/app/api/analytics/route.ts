import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'weekly'

  const { data, error } = await supabaseAdmin
    .from('analytics_data')
    .select('*')
    .eq('period_type', period)
    .order('period_id', { ascending: false })

  if (error) return NextResponse.json({ data: [] })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('analytics_data')
    .upsert({
      period_type: body.period_type,
      period_id: body.period_id,
      alp: body.alp,
      ref_alp: body.ref_alp,
      appointments: body.appointments,
      sits: body.sits,
      sales: body.sales,
      ref_appointments: body.ref_appointments,
      ref_sits: body.ref_sits,
      ref_sales: body.ref_sales,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'period_type,period_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
