import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = supabaseServer()
  const { searchParams } = new URL(req.url)
  const tier = searchParams.get('tier')

  let query = supabase
    .from('agents')
    .select('*, manager:profiles!manager_id(full_name)')
    .eq('is_active', true)
    .order('full_name')

  if (tier) query = query.eq('tier', tier)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('agents').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Auto-create training milestones from template
  const { data: template } = await supabase
    .from('onboarding_checklist_template')
    .select('*')
    .order('order_index')

  if (template && data?.id) {
    await supabase.from('training_milestones').insert(
      template.map((t: any) => ({
        agent_id: data.id,
        milestone: t.milestone,
        order_index: t.order_index,
        completed: false,
      }))
    )
  }

  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const supabase = supabaseServer()
  const body = await req.json()
  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('agents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
