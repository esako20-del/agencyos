import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()

    // Extract rawRequest from multipart form data
    const rawRequestMatch = text.match(/"rawRequest"\r\n\r\n({.*?})\r\n/s)
    if (!rawRequestMatch) {
      return NextResponse.json({ error: 'No rawRequest found' }, { status: 400 })
    }

    const raw = JSON.parse(rawRequestMatch[1])
    console.log('Parsed raw:', JSON.stringify(raw))

    // Extract fields using exact JotForm field names
    const agentName = raw['q3_agentName'] ?? ''
    const dateObj = raw['q14_date'] ?? {}
    const appointments = parseInt(raw['q5_totalAppointments'] ?? '0')
    const sits = parseInt(raw['q6_totalSits'] ?? '0')
    const sales = parseInt(raw['q8_number8'] ?? '0')
    const alp = parseFloat(raw['q9_number9'] ?? '0')
    const refAppts = parseInt(raw['q10_number10'] ?? '0')
    const refSits = parseInt(raw['q11_number11'] ?? '0')
    const refSales = parseInt(raw['q12_number12'] ?? '0')
    const refAlp = parseFloat(raw['q13_number13'] ?? '0')

    // Format date from JotForm date object {month, day, year}
    let formattedDate = new Date().toISOString().split('T')[0]
    if (dateObj.year && dateObj.month && dateObj.day) {
      formattedDate = `${dateObj.year}-${dateObj.month.padStart(2,'0')}-${dateObj.day.padStart(2,'0')}`
    }

    if (!agentName) {
      return NextResponse.json({ error: 'Agent name missing' }, { status: 400 })
    }

    // Find agent in database
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

    // Save to database
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
        submitted_at: new Date().toISOString(),
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
