import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('recruits')
    .select('*, recruiter:profiles!recruiter_id(full_name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('recruits').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const supabase = supabaseServer()
  const body = await req.json()
  const { id, stage, notes, ...rest } = body

  // Record stage history
  if (stage) {
    const { data: current } = await supabase.from('recruits').select('stage').eq('id', id).single()
    await supabase.from('recruit_stage_history').insert({
      recruit_id: id,
      from_stage: current?.stage,
      to_stage: stage,
      notes,
    })
  }

  const { data, error } = await supabase
    .from('recruits')
    .update({ ...(stage ? { stage } : {}), ...rest, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
