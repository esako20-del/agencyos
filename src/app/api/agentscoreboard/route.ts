import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getETDateString(): string {
  const now = new Date()
  const etDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const y = etDate.getFullYear()
  const m = String(etDate.getMonth() + 1).padStart(2, '0')
  const d = String(etDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDateRanges() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  // This week — Monday to today
  const weekStart = new Date(now)
  const day = weekStart.getDay()
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + diff)
  const weekStartStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`

  // This month
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const currentMonth = now.getMonth() // 0-indexed

  // This year
  const yearStartStr = `${now.getFullYear()}-01-01`

  const todayStr = getETDateString()

  return { yesterdayStr, weekStartStr, monthStartStr, yearStartStr, todayStr, currentMonth }
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

    // JotForm stats by period
    const weekReports  = agentReports.filter(r => r.report_date >= weekStartStr)
    const monthReports = agentReports.filter(r => r.report_date >= monthStartStr)
    const ytdReports   = agentReports

    const sumAlp = (rows: any[]) => rows.reduce((s, r) => s + (Number(r.alp_written) || 0), 0)
    const sumRefAlp = (rows: any[]) => rows.reduce((s, r) => s + (Number(r.referral_alp) || 0), 0)
    const sumField = (rows: any[], field: string) => rows.reduce((s, r) => s + (Number(r[field]) || 0), 0)

    // Historical ALP from monthly_alp array (past months only)
    const monthly = agent.monthly_alp || []
    let historicalYTD   = 0
    let historicalMonth = 0
    for (let i = 0; i < 12; i++) {
      const val = Number(monthly[i]) || 0
      if (i < currentMonth) {
        historicalYTD += val
      } else if (i === currentMonth) {
        historicalMonth += val
      }
    }

    // JotForm ALP totals
    const jotWeekAlp  = sumAlp(weekReports)
    const jotMonthAlp = sumAlp(monthReports)
    const jotYtdAlp   = sumAlp(ytdReports)

    // Combined ALP (historical + JotForm)
    const weekAlp  = jotWeekAlp
    const monthAlp = jotMonthAlp + historicalMonth
    const ytdAlp   = jotYtdAlp  + historicalYTD + historicalMonth

    // Referral ALP
    const weekRefAlp  = sumRefAlp(weekReports)
    const monthRefAlp = sumRefAlp(monthReports)
    const ytdRefAlp   = sumRefAlp(ytdReports)

    // Ratios from all JotForm data
    const totalAppts  = sumField(ytdReports, 'appointments_set')
    const totalSits   = sumField(ytdReports, 'sits')
    const totalSales  = sumField(ytdReports, 'sales')
    const closeRatio  = totalSits  > 0 ? Math.round((totalSales / totalSits)  * 100) : 0
    const showRatio   = totalAppts > 0 ? Math.round((totalSits  / totalAppts) * 100) : 0

    // Day streak — consecutive days with sales > 0
    const saleDates = new Set(agentReports.filter(r => (r.sales || 0) > 0).map(r => r.report_date))
    let streak = 0
    const check = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))
    check.setHours(0, 0, 0, 0)
    for (let i = 0; i < 365; i++) {
      const ds = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, '0')}-${String(check.getDate()).padStart(2, '0')}`
      if (saleDates.has(ds)) { streak++; check.setDate(check.getDate() - 1) }
      else break
    }

    return {
      id:           agent.id,
      full_name:    agent.full_name,
      tier:         agent.tier,
      is_active:    agent.is_active,
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

  // Sort by YTD ALP descending by default
  agentStats.sort((a, b) => b.ytdAlp - a.ytdAlp)

  return NextResponse.json({ data: agentStats })
}
