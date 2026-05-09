import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const AGENT_MAP: Record<string, string> = {
  'Marcus W.': '1',
  'DeShawn T.': '2',
  'Priya S.': '3',
  'Jordan R.': '4',
  'Keisha M.': '5',
  'Tyler B.': '6',
  'Aisha N.': '7',
  'Carlos V.': '8',
  'Destiny H.': '9',
  'Omar F.': '10',
  'Grace L.': '11',
  'Brandon K.': '12',
  'Tamara J.': '13',
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? ''
    let body: any = {}

    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const text = await req.text()
      const params = new URLSearchParams(text)
      params.forEach((value, key) => { body[key] = value })
    }

    // Extract fields from JotForm submission
    const agentName = body['q1_agentName'] || body['agent_name'] || body['Agent Name'] || ''
    const reportDate = body['q10_reportDate'] || body['report_date'] || body['Report Date'] || new Date().toISOString().split('T')[0]
    const appointments = parseInt(body['q2_totalAppointments'] || body['Total Appointments'] || '0')
    const sits = parseInt(body['q3_totalSits'] || body['Total Sits'] || '0')
    const sales = parseInt(body['q4_sales'] || body['Sales'] || '0')
    const alp = parseFloat(body['q5_alp'] || body['ALP'] || '0')
    const refAppts = parseInt(body['q6_referralAppointments'] || body['Referral Appointments'] || '0')
    const refSits = parseInt(body['q7_referralSits'] || body['Referral Sits'] || '0')
    const refSales = parseInt(body['q8_referralSales'] || body['Referral Sales'] || '0')
    const refAlp = parseFloat(body['q9_referralAlp'] || body['Referral ALP'] || '0')
    const winOfDay = body['q11_winOf'] || body['Win of the Day'] || ''
    const struggles = body['q12_notes'] || body['Notes / Struggles'] || ''

    // Find agent in database by name
    const { data: agents } = await supabaseAdmin
      .from('agents')
      .select('id, full_name')
      .ilike('full_name', `%${agentName.split(' ')[0]}%`)
      .limit(1)

    if (!agents || agents.length === 0) {
      return NextResponse.json({ error: 'Agent not found', agentName }, { status: 404 })
    }

    const agentId = agents[0].id

    // Format date
    let formattedDate = new Date().toISOString().split('T')[0]
    if (reportDate) {
      try {
        const d = new Date(reportDate)
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0]
        }
      } catch (e) {}
    }

    // Save to database
    const { data, error } = await supabaseAdmin
      .from('daily_reports')
      .upsert({
        agent_id: agentId,
        report_date: formattedDate,
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
        dials: 0,
      }, { onConflict: 'agent_id,report_date' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

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
