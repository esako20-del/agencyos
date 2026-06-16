import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ─── Eastern Time helpers ─────────────────────────────────────────────────────
// Using fixed offset: EDT = UTC-4 (summer), EST = UTC-5 (winter)
// Update etOffset to -5 in November when clocks fall back

function getETNow(): Date {
  const nowUTC = new Date()
  const etOffset = -4 // EDT (UTC-4). Change to -5 in winter.
  return new Date(nowUTC.getTime() + etOffset * 60 * 60 * 1000)
}

function toDateStr(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function getDateRanges() {
  const now = getETNow()

  // Today
  const todayStr = toDateStr(now)

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayStr = toDateStr(yesterday)

  // This week — Monday to today
  const weekStart = new Date(now)
  const day = weekStart.getUTCDay() // 0 = Sun, 1 = Mon
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setUTCDate(weekStart.getUTCDate() + diff)
  const weekStartStr = toDateStr(weekStart)

  // This month
  const monthStartStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
  const currentMonth  = now.getUTCMonth() // 0-indexed

  // This year
  const yearStartStr = `${now.getUTCFullYear()}-01-01`

  return { todayStr, yesterdayStr, weekStartStr, monthStartStr, yearStartStr, currentMonth }
}

export async function GET() {
  const { weekStartStr, monthStartStr, yearStartStr, todayStr, currentMonth } = getDateRanges()

  // Fetch all agents
  const { data: agents, error: agentsError } = await supabaseAdmin
    .from('agents')
    .select('id, full_name, tier, is_active, monthly_alp, health_status')
    .order('full_name')

  if (agentsError) return NextResponse.json({ error: agentsError.message }, { status: 400 })

  // Fetch all daily reports for this year
  const { data: allReports, error: reportsError } = await supabaseAdmin
    .from('daily_reports')
    .select('agent_id, report_date, alp_written, referral_alp, appointments_set, sits, sales, referral_appointments, referral_sits, referral_sales')
    .gte('report_date', yearStartStr)
    .lte('report_date', todayStr)

  if (reportsError) return NextResponse.json({ error: reportsError.message }, { status: 400 })

  const reports = allReports || []

  // Build per-agent stats
  const agentStats = (agents || []).map(agent => {
    const agentReports = reports.filter(r => r.agent_id === agent.id)

    const weekReports  = agentReports.filter(r => r.report_date >= weekStartStr)
    const monthReports = agentReports.filter(r => r.report_date >= monthStartStr)
    const ytdReports   = agentReports

    const sumAlp    = (rows: any[]) => rows.reduce((s, r) => s + (Number(r.alp_written)   || 0), 0)
    const sumRefAlp = (rows: any[]) => rows.reduce((s, r) => s + (Number(r.referral_alp)  || 0), 0)
    const sumField  = (rows: any[], field: string) => rows.reduce((s, r) => s + (Number(r[field]) || 0), 0)

    // Historical ALP from monthly_alp array
    const monthly = agent.monthly_alp || []
    let historicalYTD   = 0
    let historicalMonth = 0
    for (let i = 0; i < 12; i++) {
      const val = Number(monthly[i]) || 0
      if (i < currentMonth)      historicalYTD   += val
      else if (i === currentMonth) historicalMonth += val
    }

    const jotWeekAlp  = sumAlp(weekReports)
    const jotMonthAlp = sumAlp(monthReports)
    const jotYtdAlp   = sumAlp(ytdReports)

    const weekAlp  = jotWeekAlp
    const monthAlp = jotMonthAlp + historicalMonth
    const ytdAlp   = jotYtdAlp  + historicalYTD + historicalMonth

    const weekRefAlp  = sumRefAlp(weekReports)
    const monthRefAlp = sumRefAlp(monthReports)
    const ytdRefAlp   = sumRefAlp(ytdReports)

    const totalAppts = sumField(ytdReports, 'appointments_set')
    const totalSits  = sumField(ytdReports, 'sits')
    const totalSales = sumField(ytdReports, 'sales')
    const closeRatio = totalSits  > 0 ? Math.round((totalSales / totalSits)  * 100) : 0
    const showRatio  = totalAppts > 0 ? Math.round((totalSits  / totalAppts) * 100) : 0

    // Day streak — consecutive days with sales > 0 going back from today
    const saleDates = new Set(agentReports.filter(r => (r.sales || 0) > 0).map(r => r.report_date))
    let streak    = 0
    const check   = getETNow()
    for (let i = 0; i < 365; i++) {
      const ds = toDateStr(check)
      if (saleDates.has(ds)) { streak++; check.setUTCDate(check.getUTCDate() - 1) }
      else break
    }

    return {
      id:            agent.id,
      full_name:     agent.full_name,
      tier:          agent.tier,
      is_active:     agent.is_active,
      health_status: agent.health_status || 'yellow',
      ytdAlp,
      monthAlp,
      weekAlp,
      ytdRefAlp,
      monthRefAlp,
      weekRefAlp,
      closeRatio,
      showRatio,
      streak,
      totalSales,
      totalSits,
    }
  })

  agentStats.sort((a, b) => b.ytdAlp - a.ytdAlp)

  return NextResponse.json({ data: agentStats })
}
