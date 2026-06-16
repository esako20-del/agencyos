import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }

function getETNow(): Date {
  const nowUTC = new Date()
  const etOffset = -4
  return new Date(nowUTC.getTime() + etOffset * 60 * 60 * 1000)
}

function toDateStr(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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

  return { todayStr, yesterdayStr, weekStartStr, monthStartStr, yearStartStr, currentMonth }
}

function sumActivityFields(reports: any[]) {
  let refAlp = 0, appts = 0, sits = 0, sales = 0
  let refAppts = 0, refSits = 0, refSales = 0
  for (const r of reports) {
    refAlp   += Number(r.referral_alp)         || 0
    appts    += Number(r.appointments_set)      || 0
    sits     += Number(r.sits)                  || 0
    sales    += Number(r.sales)                 || 0
    refAppts += Number(r.referral_appointments) || 0
    refSits  += Number(r.referral_sits)         || 0
    refSales += Number(r.referral_sales)        || 0
  }
  return { refAlp, appts, sits, sales, refAppts, refSits, refSales }
}

function calcRatios(data: any, alp: number) {
  return {
    alp:           Math.round(alp * 100) / 100,
    refAlp:        data.refAlp,
    showRatio:     data.appts    > 0 ? Math.round((data.sits     / data.appts)    * 100) : 0,
    closeRatio:    data.sits     > 0 ? Math.round((data.sales    / data.sits)     * 100) : 0,
    refShowRatio:  data.refAppts > 0 ? Math.round((data.refSits  / data.refAppts) * 100) : 0,
    refCloseRatio: data.refSits  > 0 ? Math.round((data.refSales / data.refSits)  * 100) : 0,
  }
}

export async function GET() {
  const { todayStr, yesterdayStr, weekStartStr, monthStartStr, yearStartStr, currentMonth } = getDateRanges()

  const { data: rawAgents } = await supabaseAdmin
    .from('agents')
    .select('id, monthly_alp')

  const { data: rawReports } = await supabaseAdmin
    .from('daily_reports')
    .select('agent_id, report_date, alp_written, referral_alp, appointments_set, sits, sales, referral_appointments, referral_sits, referral_sales')
    .gte('report_date', yearStartStr)
    .lte('report_date', todayStr)
    .order('report_date', { ascending: true })

  const agents  = rawAgents  || []
  const reports = rawReports || []

  const agentMonthlyMap: Record<string, number[]> = {}
  for (const agent of agents) {
    agentMonthlyMap[agent.id] = agent.monthly_alp || []
  }

  const jotAlpByAgentMonth: Record<string, number[]> = {}
  for (const r of reports) {
    if (!jotAlpByAgentMonth[r.agent_id]) jotAlpByAgentMonth[r.agent_id] = Array(12).fill(0)
    const mi = getMonthIndex(r.report_date)
    jotAlpByAgentMonth[r.agent_id][mi] += Number(r.alp_written) || 0
  }

  let teamYTDAlp   = 0
  let teamMonthAlp = 0

  for (const agent of agents) {
    const manual = agentMonthlyMap[agent.id] || []
    const jot    = jotAlpByAgentMonth[agent.id] || Array(12).fill(0)
    for (let i = 0; i <= currentMonth; i++) {
      const manualVal = Number(manual[i]) || 0
      const finalAlp  = manualVal > 0 ? manualVal : jot[i]
      teamYTDAlp += finalAlp
      if (i === currentMonth) teamMonthAlp += finalAlp
    }
  }

  const yesterdayReports = reports.filter(r => r.report_date === yesterdayStr)
  const weekReports      = reports.filter(r => r.report_date >= weekStartStr)
  const monthReports     = reports.filter(r => r.report_date >= monthStartStr)

  const teamWeekAlp      = weekReports.reduce((s, r) => s + (Number(r.alp_written) || 0), 0)
  const teamYesterdayAlp = yesterdayReports.reduce((s, r) => s + (Number(r.alp_written) || 0), 0)

  return NextResponse.json({
    data: {
      yesterday: calcRatios(sumActivityFields(yesterdayReports), teamYesterdayAlp),
      thisWeek:  calcRatios(sumActivityFields(weekReports),      teamWeekAlp),
      thisMonth: calcRatios(sumActivityFields(monthReports),     teamMonthAlp),
      ytd:       calcRatios(sumActivityFields(reports),          teamYTDAlp),
    }
  }, { headers: NO_CACHE })
}
