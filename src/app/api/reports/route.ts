import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? ''
    let body: Record<string, string> = {}

    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const text = await req.text()
      const params = new URLSearchParams(text)
      params.forEach((value, key) => { body[key] = value })
    }

    console.log('JotForm raw keys:', Object.keys(body).join(', '))
    console.log('JotForm body:', JSON.stringify(body).substring(0, 500))

    // Find agent name
    let agentName = ''
    let reportDate = ''
    let appointments = 0
    let sits = 0
    let sales = 0
    let alp = 0
    let refAppts = 0
    let refSits = 0
    let refSales = 0
    let refAlp = 0
    let winOfDay = ''
    let struggles = ''

    Object.keys(body).forEach(key => {
      const val = String(body[key] || '')
      const k = key.toLowerCase().replace(/[^a-z0-9]/g, '')

      if (k.includes('agentname') || k.includes('agent')) agentName = val
      else if (k.includes('date') && !k.includes('submission')) reportDate = val
      else if (k.includes('totalappointment') || (k.includes('appointment') && !k.includes('referral'))) appointments = parseInt(val) || 0
      else if (k.includes('totalsit') || (k.includes('sit') && !k.includes('referral'))) sits = parseInt(val) || 0
      else if (k.includes('sale') && !k.includes('referral')) sales = parseInt(val) || 0
      else if (k === 'alp' || (k.includes('alp') && !k.includes('referral'))) alp = parseFloat(val) || 0
      else if (k.includes('referral') && k.includes('appointment')) refAppts = parseInt(val) || 0
      else if (k.includes('referral') && k.includes('sit')) refSits = parseInt(val) || 0
      else if (k.includes('referral') && k.includes('sale')) refSales = parseInt(val) || 0
      else if (k.includes('referral') && k.includes('alp')) refAlp = parseFloat(val) || 0
      else if (k.includes('win')) winOfDay = val
      else if (k.includes('note') || k.includes('struggle')) struggles = val
    })

    console.log('Parsed:', { agentName, appointments, sits, sales, alp })

    if (!agentName) {
      return NextResponse.json({ error: 'Agent name not found', keys: Object.keys(body) }, { status: 400 })
    }

    const firstName = agentName.split(' ')[0]
    const { data: agents } = await supabaseAdmin
      .from('agents')
      .select('id, full_name')
      .ilike('full_name', `%${firstName}%`)
      .limit(1)

    if (!agents || agents.length === 0) {
      return NextResponse.json({ error: 'Agent not found', agentName }, { status: 404 })
    }

    const agentId = agents[0].id

    let formattedDate = new Date().toISOString().split('T')[0]
    if (reportDate) {
      try {
        const d = new Date(reportDate)
        if (!isNaN(d.getTime())) formattedDate = d.toISOString().split('T')[0]
      } catch (e) {}
    }

    const { data, error } = await supabaseAdmin
      .from('daily_reports')
      .upsert({
        agent_id: agentId,
        report_date: formattedDate,
        dials: 0,
        appointments_set: appointments,
        sits,
        sales,
        alp_written: alp,
        referral_appointments: refAppts,
        referral_sits: refSits,
        referral_sales: refSales,
        referral_alp: refAlp,
        win_of_day: winOfDay,
        struggles,
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'agent_id,report_date' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  const { data, error } = await supabaseAdmin
    .from('daily_reports')
    .select('*, agent:agents(full_name, tier)')
    .eq('report_date', date)
    .order('submitted_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
