import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_reports')
      .upsert(
        { ...body, report_date: body.report_date ?? today, submitted_at: new Date().toISOString() },
        { onConflict: 'agent_id,report_date' }
      )
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // TODO: Send manager notification here (Resend/Twilio)
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = supabaseServer()
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const agentId = searchParams.get('agent_id')

  let query = supabase
    .from('daily_reports')
    .select('*, agent:agents(full_name, tier)')
    .eq('report_date', date)

  if (agentId) query = query.eq('agent_id', agentId)

  const { data, error } = await query.order('submitted_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
