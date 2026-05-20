import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ─── Helper: extract a numeric field from raw, trying multiple possible keys ──
function extractNumber(raw: Record<string, any>, ...keys: string[]): number {
  for (const key of keys) {
    const val = raw[key]
    if (val !== undefined && val !== '' && val !== null) {
      const num = parseFloat(String(val))
      if (!isNaN(num)) return num
    }
  }
  return 0
}

// ─── Helper: extract a string field from raw, trying multiple possible keys ──
function extractString(raw: Record<string, any>, ...keys: string[]): string {
  for (const key of keys) {
    const val = raw[key]
    if (val !== undefined && val !== '' && val !== null) return String(val)
  }
  return ''
}

// ─── POST: JotForm webhook ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const text = await req.text()

    // Log full raw text so we can see all field keys
    console.log('=== FULL RAW BODY (first 3000 chars) ===')
    console.log(text.substring(0, 3000))

    // Parse rawRequest JSON from JotForm multipart data
    const rawMatch = text.match(/"rawRequest"\r\n\r\n(\{[\s\S]*?\})\r\n-+/)
    if (!rawMatch) {
      console.log('rawRequest not found, trying alternate parse')
      console.log('Text length:', text.length)
      return NextResponse.json({ error: 'Could not parse rawRequest', sample: text.substring(0, 500) }, { status: 400 })
    }

    const raw = JSON.parse(rawMatch[1])

    // Log ALL keys and their values so we can map them
    console.log('=== ALL FIELD KEYS AND VALUES ===')
    Object.entries(raw).forEach(([key, val]) => {
      console.log(`  ${key}: ${JSON.stringify(val)}`)
    })

    // ── Agent Name ──────────────────────────────────────────────────────────
    const agentName = extractString(raw,
      'q3_agentName', 'q1_agentName', 'q2_agentName',
      'q3_agent', 'q1_agent', 'q2_agent',
      'q3_name', 'q1_name'
    )

    // ── Date ────────────────────────────────────────────────────────────────
    const dateObj = raw['q14_date'] || raw['q2_date'] || raw['q4_date'] || raw['q3_date'] || {}
    let formattedDate = new Date().toISOString().split('T')[0]
    if (dateObj && dateObj.year && dateObj.month && dateObj.day) {
      formattedDate = `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`
    }

    // ── Core Stats — try every plausible key ────────────────────────────────
    const appointments = extractNumber(raw,
      'q5_totalAppointments', 'q3_totalAppointments', 'q4_totalAppointments',
      'q6_totalAppointments', 'q7_totalAppointments',
      'q3_total', 'q4_total', 'q5_total',
      'q3_appointments', 'q4_appointments', 'q5_appointments'
    )

    const sits = extractNumber(raw,
      'q6_totalSits', 'q4_totalSits', 'q5_totalSits',
      'q7_totalSits', 'q8_totalSits',
      'q4_sits', 'q5_sits', 'q6_sits',
      'q4_total2', 'q5_total2'
    )

    const sales = extractNumber(raw,
      'q8_number8', 'q5_sales', 'q6_sales', 'q7_sales',
      'q8_sales', 'q5_totalSales', 'q6_totalSales', 'q7_totalSales',
      'q5_number', 'q6_number', 'q7_number'
    )

    const alp = extractNumber(raw,
      'q9_number9', 'q6_alp', 'q7_alp', 'q8_alp',
      'q6_totalAlp', 'q7_totalAlp', 'q8_totalAlp',
      'q6_number', 'q7_number', 'q8_number'
    )

    const refAppts = extractNumber(raw,
      'q10_number10', 'q7_referralAppointments', 'q8_referralAppointments',
      'q9_referralAppointments', 'q7_refAppts', 'q8_refAppts',
      'q7_number', 'q8_number', 'q9_number'
    )

    const refSits = extractNumber(raw,
      'q11_number11', 'q8_referralSits', 'q9_referralSits',
      'q10_referralSits', 'q8_refSits', 'q9_refSits',
      'q8_number2', 'q9_number2', 'q10_number'
    )

    const refSales = extractNumber(raw,
      'q12_number12', 'q9_referralSales', 'q10_referralSales',
      'q11_referralSales', 'q9_refSales', 'q10_refSales',
      'q9_number', 'q10_number', 'q11_number'
    )

    const refAlp = extractNumber(raw,
      'q13_number13', 'q10_referralAlp', 'q11_referralAlp',
      'q12_referralAlp', 'q10_refAlp', 'q11_refAlp',
      'q10_number2', 'q11_number2', 'q12_number'
    )

    const winOfDay  = extractString(raw, 'q14_winOf', 'q15_winOf', 'q11_winOf', 'q12_winOf')
    const struggles = extractString(raw, 'q15_notes', 'q16_notes', 'q12_notes', 'q13_notes')

    console.log('=== EXTRACTED VALUES ===')
    console.log({ agentName, formattedDate, appointments, sits, sales, alp, refAppts, refSits, refSales, refAlp })

    if (!agentName) {
      return NextResponse.json({ error: 'Agent name empty', allKeys: Object.keys(raw) }, { status: 400 })
    }

    // ── Find agent in database ───────────────────────────────────────────────
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

    // ── Save to database ─────────────────────────────────────────────────────
    const { data, error } = await supabaseAdmin
      .from('daily_reports')
      .upsert({
        agent_id:              agentId,
        report_date:           formattedDate,
        dials:                 0,
        appointments_set:      appointments,
        sits,
        sales,
        alp_written:           alp,
        referral_appointments: refAppts,
        referral_sits:         refSits,
        referral_sales:        refSales,
        referral_alp:          refAlp,
        win_of_day:            winOfDay,
        struggles,
        submitted_at:          new Date().toISOString(),
      }, { onConflict: 'agent_id,report_date' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data })

  } catch (e: any) {
    console.error('Webhook error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ─── GET: fetch by date (team view) OR by agent_id (agent profile) ───────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agent_id')
  const date    = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const limit   = parseInt(searchParams.get('limit') || '30')
  const offset  = parseInt(searchParams.get('offset') || '0')

  // ── Agent profile mode ────────────────────────────────────────────────────
  if (agentId) {
    const { data: reports, error: reportsError, count } = await supabaseAdmin
      .from('daily_reports')
      .select('*', { count: 'exact' })
      .eq('agent_id', agentId)
      .order('report_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (reportsError) return NextResponse.json({ error: reportsError.message }, { status: 400 })

    const { data: allReports, error: statsError } = await supabaseAdmin
      .from('daily_reports')
      .select('appointments_set, sits, sales, alp_written, referral_appointments, referral_sits, referral_sales, referral_alp')
      .eq('agent_id', agentId)

    if (statsError) return NextResponse.json({ error: statsError.message }, { status: 400 })

    const totalReports      = allReports?.length || 0
    const totalAppointments = allReports?.reduce((s, r) => s + (r.appointments_set       || 0), 0) || 0
    const totalSits         = allReports?.reduce((s, r) => s + (r.sits                   || 0), 0) || 0
    const totalSales        = allReports?.reduce((s, r) => s + (r.sales                  || 0), 0) || 0
    const totalALP          = allReports?.reduce((s, r) => s + (r.alp_written            || 0), 0) || 0
    const totalRefAppts     = allReports?.reduce((s, r) => s + (r.referral_appointments  || 0), 0) || 0
    const totalRefSits      = allReports?.reduce((s, r) => s + (r.referral_sits          || 0), 0) || 0
    const totalRefSales     = allReports?.reduce((s, r) => s + (r.referral_sales         || 0), 0) || 0
    const totalRefALP       = allReports?.reduce((s, r) => s + (r.referral_alp           || 0), 0) || 0

    return NextResponse.json({
      reports,
      stats: {
        totalReports,
        totalAppointments,
        totalSits,
        totalSales,
        totalALP,
        totalRefAppts,
        totalRefSits,
        totalRefSales,
        totalRefALP,
        showRatio:     totalAppointments > 0 ? parseFloat(((totalSits    / totalAppointments) * 100).toFixed(1)) : 0,
        closeRatio:    totalSits         > 0 ? parseFloat(((totalSales   / totalSits)         * 100).toFixed(1)) : 0,
        avgALPPerSale: totalSales        > 0 ? parseFloat((totalALP      / totalSales).toFixed(0))               : 0,
        refShowRatio:  totalRefAppts     > 0 ? parseFloat(((totalRefSits / totalRefAppts)     * 100).toFixed(1)) : 0,
        refCloseRatio: totalRefSits      > 0 ? parseFloat(((totalRefSales/ totalRefSits)      * 100).toFixed(1)) : 0,
      },
      total: count,
      limit,
      offset,
    })
  }

  // ── Team view mode ────────────────────────────────────────────────────────
  const { data, error } = await supabaseAdmin
    .from('daily_reports')
    .select('*, agent:agents(full_name, tier)')
    .eq('report_date', date)
    .order('submitted_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
