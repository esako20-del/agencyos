import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name       = searchParams.get('name')
  const id         = searchParams.get('id')
  const includeAll = searchParams.get('all') === 'true'

  if (name) {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .ilike('full_name', `%${name.split(' ')[0]}%`)
      .limit(1)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  }

  if (id) {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  }

  // includeAll=true returns all agents including inactive (for scoreboard)
  const query = supabaseAdmin.from('agents').select('*').order('full_name')
  if (!includeAll) query.eq('is_active', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { name, id, ...updates } = body

  // Support update by id or by name
  if (id) {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  }

  if (!name) return NextResponse.json({ error: 'Name or id required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('agents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .ilike('full_name', `%${name.split(' ')[0]}%`)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('agents')
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Agent id required' }, { status: 400 })

  // Delete all daily reports for this agent first
  await supabaseAdmin
    .from('daily_reports')
    .delete()
    .eq('agent_id', id)

  // Then delete the agent
  const { error } = await supabaseAdmin
    .from('agents')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
