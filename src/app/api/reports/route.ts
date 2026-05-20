import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ─── POST: JotForm webhook ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const text = await req.text()

    // Parse rawRequest JSON from JotForm multipart data
    const rawMatch = text.match(/"rawRequest"\r\n\r\n(\{[\s\S]*?\})\r\n-+/)
    if (!rawMatch) {
      return NextResponse.json({ error: 'Could not parse rawRequest' }, { status: 400 })
    }

    const raw = JSON.parse(rawMatch[1])

    // ── Extract fields using confirmed JotForm field IDs ─────────────────────
    const agentName    = raw['q3_agentName']    || ''
    const dateObj      = raw['q4_date']         || {}
    const appointments = parseInt(raw['q6_totalAppointments'] || '0') || 0
    const sits         = parseInt(raw['q7_totalSits']         || '0') || 0
    const sales        = parseInt(raw['q8_number8']           || '0') || 0
    const alp          = parseFloat(raw['q9_number9']         || '0') || 0
    const refAppts     = parseInt(raw['q10_number10']         || '0') || 0
    const refSits      = parseInt(raw['q11_number11']         || '0') || 0
    const refSales     = parseInt(raw['q12_number12']         || '0') || 0
    const refAlp       = parseFloat(raw['q13_number13']       || '0') || 0
    const winOfDay     = raw['q14_winOf']  || raw['q15_winOf']  || ''
    const struggles    = raw['q15_notes']  || raw['q16_notes']  || ''

    // ── Format date ──────────────────────────────────────────────────────────
    let formattedDate = new Date().toISOString().split('T')[0]
    if (dateObj.year && dateObj.month && dateObj.day) {
      formattedDate = `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`
    }

    if (!agentName) {
      return NextResponse.json({ error: 'Agent name empty' }, { status: 400 })
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
    const totalAppointments = allReports?.reduce((s, r) => s + (r.appointments_set      || 0), 0) || 0
    const totalSits         = allReports?.reduce((s, r) => s + (r.sits                  || 0), 0) || 0
    const totalSales        = allReports?.reduce((s, r) => s + (r.sales                 || 0), 0) || 0
    const totalALP          = allReports?.reduce((s, r) => s + (r.alp_written           || 0), 0) || 0
    const totalRefAppts     = allReports?.reduce((s, r) => s + (r.referral_appointments || 0), 0) || 0
    const totalRefSits      = allReports?.reduce((s, r) => s + (r.referral_sits         || 0), 0) || 0
    const totalRefSales     = allReports?.reduce((s, r) => s + (r.referral_sales        || 0), 0) || 0
    const totalRefALP       = allReports?.reduce((s, r) => s + (r.referral_alp          || 0), 0) || 0

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
