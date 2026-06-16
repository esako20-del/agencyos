import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function getDateRanges() {
  // Use Eastern Time (UTC-4 in summer, UTC-5 in winter)
  const nowUTC = new Date()
const etOffset = -4 // EDT (Eastern Daylight Time, UTC-4). Change to -5 in winter.
const now = new Date(nowUTC.getTime() + etOffset * 60 * 60 * 1000)

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  // This week — Monday to today
  const weekStart = new Date(now)
  const day = weekStart.getDay()
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + diff)
  weekStart.setHours(0, 0, 0, 0)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // This month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartStr = monthStart.toISOString().split('T')[0]
  const currentMonth = now.getMonth() // 0-indexed

  // This year
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearStartStr = yearStart.toISOString().split('T')[0]

  const todayStr = now.toISOString().split('T')[0]

  return {
    yesterdayStr,
    weekStartStr,
    monthStartStr,
    yearStartStr,
    todayStr,
    currentMonth,
  }
}

// ─── Sum reports for a given filter ──────────────────────────────────────────

function sumReports(reports: any[]) {
  let alp = 0, refAlp = 0, appts = 0, sits = 0, sales = 0
  let refAppts = 0, refSits = 0, refSales = 0

  for (const r of reports) {
    alp      += Number(r.alp_written)           || 0
    refAlp   += Number(r.referral_alp)          || 0
    appts    += Number(r.appointments_set)      || 0
    sits     += Number(r.sits)                  || 0
    sales    += Number(r.sales)                 || 0
    refAppts += Number(r.referral_appointments) || 0
    refSits  += Number(r.referral_sits)         || 0
    refSales += Number(r.referral_sales)        || 0
  }

  return { alp, refAlp, appts, sits, sales, refAppts, refSits, refSales }
}

// ─── Calculate ratios from summed data ───────────────────────────────────────

function calcStats(data: ReturnType<typeof sumReports>, extraAlp = 0, extraRefAlp = 0) {
  return {
    alp:          data.alp + extraAlp,
    refAlp:       data.refAlp + extraRefAlp,
    showRatio:    data.appts    > 0 ? Math.round((data.sits     / data.appts)    * 100) : 0,
    closeRatio:   data.sits     > 0 ? Math.round((data.sales    / data.sits)     * 100) : 0,
    refShowRatio: data.refAppts > 0 ? Math.round((data.refSits  / data.refAppts) * 100) : 0,
    refCloseRatio:data.refSits  > 0 ? Math.round((data.refSales / data.refSits)  * 100) : 0,
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const {
    yesterdayStr,
    weekStartStr,
    monthStartStr,
    yearStartStr,
    todayStr,
    currentMonth,
  } = getDateRanges()

  // ── Fetch all JotForm daily reports for this year ─────────────────────────
  const { data: rawReports } = await supabaseAdmin
    .from('daily_reports')
    .select('report_date, alp_written, referral_alp, appointments_set, sits, sales, referral_appointments, referral_sits, referral_sales')
    .gte('report_date', yearStartStr)
    .lte('report_date', todayStr)
    .order('report_date', { ascending: true })

  // ── Fetch all active agents for historical monthly_alp ────────────────────
  const { data: rawAgents } = await supabaseAdmin
    .from('agents')
    .select('monthly_alp, is_active')

  const reports = rawReports || []
  const agents  = rawAgents  || []

  // ── Calculate historical ALP from agents.monthly_alp ─────────────────────
  // Sum all months BEFORE the current month (these are past months not in JotForm)
  // Index 0 = Jan, 1 = Feb, ... currentMonth = this month (excluded from historical)
  let historicalYTD    = 0  // Jan through last month
  let historicalMonth  = 0  // current month manual entry (Jun 1-11 data)

  for (const agent of agents) {
    const monthly = agent.monthly_alp || []
    for (let i = 0; i < 12; i++) {
      const val = Number(monthly[i]) || 0
      if (i < currentMonth) {
        // Past months — add to YTD historical
        historicalYTD += val
      } else if (i === currentMonth) {
        // Current month manual entry (pre-JotForm days like Jun 1-11)
        historicalMonth += val
      }
    }
  }

  // ── Filter JotForm reports by period ──────────────────────────────────────
  const yesterdayReports = reports.filter(r => r.report_date === yesterdayStr)
  const weekReports      = reports.filter(r => r.report_date >= weekStartStr)
  const monthReports     = reports.filter(r => r.report_date >= monthStartStr)
  const ytdReports       = reports

  // ── Build stats for each period ───────────────────────────────────────────
  // Yesterday: JotForm only (no historical applies to yesterday)
  const yesterday = calcStats(sumReports(yesterdayReports))

  // This Week: JotForm only
  const thisWeek = calcStats(sumReports(weekReports))

  // This Month: JotForm + manual current month entries (Jun 1-11)
  const thisMonth = calcStats(sumReports(monthReports), historicalMonth, 0)

  // YTD: JotForm + all historical past months + current month manual
  const ytd = calcStats(sumReports(ytdReports), historicalYTD + historicalMonth, 0)

  return NextResponse.json({
    data: {
      yesterday,
      thisWeek,
      thisMonth,
      ytd,
    }
  })
}
