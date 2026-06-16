import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
export const dynamic = 'force-dynamic'

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }

function getETNow(): Date {
  const nowUTC = new Date()
  const etOffset = -4
  return new Date(nowUTC.getTime() + etOffset * 60 * 60 * 1000)
}

function toDateStr(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function getMonthIndex(dateStr: string): number {
  return parseInt(dateStr.substring(5, 7)) - 1
}

function getDateRanges() {
  const now = getETNow()
  const todayStr = toDateStr(now)

  const yesterday = new Date(now)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayStr = toDateStr(yesterday)

  const weekStart = new Date(now)
  const day = weekStart.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setUTCDate(weekStart.getUTCDate() + diff)
  const weekStartStr = toDateStr(weekStart)

  const currentMonth  = now.getUTCMonth()
  const currentYear   = now.getUTCFullYear()
  const monthStartStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
  const yearStartStr  = `${currentYear}-01-01`

  return { todayStr, yesterdayStr, weekStartStr, monthStartStr, yearStartStr, currentMonth, currentYear }
}

export async function GET() {
  const { weekStartStr, monthStartStr, yearStartStr, todayStr, currentMonth } = getDateRanges()

  const { data: agents, error: agentsError } = await supabaseAdmin
    .from('agents')
    .select('id, full_name, tier, is_active, monthly_alp, health_status')
    .order('full_name')

  if (agentsError) return NextResponse.json({ error: agentsError.message }, { status: 400 })

  const { data: allReports, error: reportsError } = await supabaseAdmin
    .from('daily_reports')
    .select('agent_id, report_date, alp_written, referral_alp, appointments_set, sits, sales, referral_appointments, referral_sits, referral_sales')
    .gte('report_date', yearStartStr)
    .lte('report_date', todayStr)

  if (reportsError) return NextResponse.json({ error: reportsError.message }, { status: 400 })

  const reports = allReports || []

  const agentStats = (agents || []).map(agent => {
    const agentReports = reports.filter(r => r.agent_id === agent.id)
    const monthly      = agent.monthly_alp || []

    // Group JotForm ALP by month
    const jotAlpByMonth: number[] = Array(12).fill(0)
    for (const r of agentReports) {
      const mi = getMonthIndex(r.report_date)
      jotAlpByMonth[mi] += Number(r.alp_written) || 0
    }

    // Manual overrides JotForm per month for ALP only
    const finalAlpByMonth: number[] = Array(12).fill(0)
    for (let i = 0; i <= currentMonth; i++) {
      const manualVal = Number(monthly[i]) || 0
      finalAlpByMonth[i] = manualVal > 0 ? manualVal : jotAlpByMonth[i]
    }

    const ytdAlp   = finalAlpByMonth.reduce((s, v) => s + v, 0)
    const monthAlp = finalAlpByMonth[currentMonth]
    const weekAlp  = agentReports
      .filter(r => r.report_date >= weekStartStr)
      .reduce((s, r) => s + (Number(r.alp_written) || 0), 0)

    const ytdRefAlp   = agentReports.reduce((s, r) => s + (Number(r.referral_alp) || 0), 0)
    const monthRefAlp = agentReports.filter(r => r.report_date >= monthStartStr).reduce((s, r) => s + (Number(r.referral_alp) || 0), 0)
    const weekRefAlp  = agentReports.filter(r => r.report_date >= weekStartStr).reduce((s, r) => s + (Number(r.referral_alp) || 0), 0)

    const totalAppts = agentReports.reduce((s, r) => s + (Number(r.appointments_set) || 0), 0)
    const totalSits  = agentReports.reduce((s, r) => s + (Number(r.sits)             || 0), 0)
    const totalSales = agentReports.reduce((s, r) => s + (Number(r.sales)            || 0), 0)
    const closeRatio = totalSits  > 0 ? Math.round((totalSales / totalSits)  * 100) : 0
    const showRatio  = totalAppts > 0 ? Math.round((totalSits  / totalAppts) * 100) : 0

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
      ytdAlp:        Math.round(ytdAlp * 100) / 100,
      monthAlp:      Math.round(monthAlp * 100) / 100,
      weekAlp:       Math.round(weekAlp * 100) / 100,
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

  return NextResponse.json({ data: agentStats }, { headers: NO_CACHE })
}
