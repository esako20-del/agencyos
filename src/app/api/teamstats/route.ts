import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function getDateRanges() {
  const now = new Date()

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  // This week — Monday to today
  const weekStart = new Date(now)
  const day = weekStart.getDay() // 0 = Sun, 1 = Mon, ...
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + diff)
  weekStart.setHours(0, 0, 0, 0)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // This month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartStr = monthStart.toISOString().split('T')[0]
  const monthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // This year
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearStartStr = yearStart.toISOString().split('T')[0]
  const currentYear = now.getFullYear()

  const todayStr = now.toISOString().split('T')[0]

  return { yesterdayStr, weekStartStr, monthStartStr, yearStartStr, monthId, currentYear, todayStr }
}

// ─── Sum JotForm Reports ───────────────────────────────────────────────────────

function sumReports(reports: any[]) {
  let alp = 0, refAlp = 0, appts = 0, sits = 0, sales = 0
  let refAppts = 0, refSits = 0, refSales = 0

  for (const r of reports) {
    alp      += Number(r.alp_written)            || 0
    refAlp   += Number(r.referral_alp)           || 0
    appts    += Number(r.appointments_set)       || 0
    sits     += Number(r.sits)                   || 0
    sales    += Number(r.sales)                  || 0
    refAppts += Number(r.referral_appointments)  || 0
    refSits  += Number(r.referral_sits)          || 0
    refSales += Number(r.referral_sales)         || 0
  }

  return { alp, refAlp, appts, sits, sales, refAppts, refSits, refSales }
}

// ─── Sum Analytics Entries ────────────────────────────────────────────────────

function sumAnalytics(entries: any[]) {
  let alp = 0, refAlp = 0, appts = 0, sits = 0, sales = 0
  let refAppts = 0, refSits = 0, refSales = 0

  for (const e of entries) {
    alp      += Number(e.alp)              || 0
    refAlp   += Number(e.ref_alp)         || 0
    appts    += Number(e.appointments)    || 0
    sits     += Number(e.sits)            || 0
    sales    += Number(e.sales)           || 0
    refAppts += Number(e.ref_appointments)|| 0
    refSits  += Number(e.ref_sits)        || 0
    refSales += Number(e.ref_sales)       || 0
  }

  return { alp, refAlp, appts, sits, sales, refAppts, refSits, refSales }
}

// ─── Combine Reports + Analytics and Calculate Ratios ─────────────────────────

function buildStats(reportData: any, analyticsData: any) {
  const alp      = (reportData.alp      || 0) + (analyticsData.alp      || 0)
  const refAlp   = (reportData.refAlp   || 0) + (analyticsData.refAlp   || 0)
  const appts    = (reportData.appts    || 0) + (analyticsData.appts    || 0)
  const sits     = (reportData.sits     || 0) + (analyticsData.sits     || 0)
  const sales    = (reportData.sales    || 0) + (analyticsData.sales    || 0)
  const refAppts = (reportData.refAppts || 0) + (analyticsData.refAppts || 0)
  const refSits  = (reportData.refSits  || 0) + (analyticsData.refSits  || 0)
  const refSales = (reportData.refSales || 0) + (analyticsData.refSales || 0)

  return {
    alp,
    refAlp,
    showRatio:    appts    > 0 ? Math.round((sits     / appts)    * 100) : 0,
    closeRatio:   sits     > 0 ? Math.round((sales    / sits)     * 100) : 0,
    refShowRatio: refAppts > 0 ? Math.round((refSits  / refAppts) * 100) : 0,
    refCloseRatio:refSits  > 0 ? Math.round((refSales / refSits)  * 100) : 0,
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const {
    yesterdayStr, weekStartStr, monthStartStr, yearStartStr,
    monthId, currentYear, todayStr
  } = getDateRanges()

  // Fetch all JotForm daily reports for this year
  const { data: rawReports, error: reportsError } = await supabaseAdmin
    .from('daily_reports')
    .select('report_date, alp_written, referral_alp, appointments_set, sits, sales, referral_appointments, referral_sits, referral_sales')
    .gte('report_date', yearStartStr)
    .lte('report_date', todayStr)
    .order('report_date', { ascending: true })

  // Fetch all manually entered analytics data
  const { data: rawAnalytics, error: analyticsError } = await supabaseAdmin
    .from('analytics_data')
    .select('*')

  const reports   = rawReports   || []
  const analytics = rawAnalytics || []

  // ── Filter JotForm reports by period ──────────────────────────────────────
  const yesterdayReports = reports.filter(r => r.report_date === yesterdayStr)
  const weekReports      = reports.filter(r => r.report_date >= weekStartStr)
  const monthReports     = reports.filter(r => r.report_date >= monthStartStr)
  const ytdReports       = reports

  // ── Filter analytics entries by period ────────────────────────────────────
  // Yesterday: daily entry for yesterday
  const yesterdayAnalytics = analytics.filter(a =>
    a.period_type === 'daily' && a.period_id === yesterdayStr
  )

  // This week: any weekly entry whose Monday falls within this week
  const weekAnalytics = analytics.filter(a =>
    a.period_type === 'weekly' && a.period_id >= weekStartStr && a.period_id <= todayStr
  )

  // This month: 
  //   - monthly entry for this month
  //   - any weekly entry whose start date falls within this month
  //   - any daily entry within this month
  const monthAnalytics = analytics.filter(a => {
    if (a.period_type === 'monthly') return a.period_id === monthId
    if (a.period_type === 'weekly')  return a.period_id >= monthStartStr && a.period_id <= todayStr
    if (a.period_type === 'daily')   return a.period_id >= monthStartStr && a.period_id <= todayStr
    return false
  })

  // YTD:
  //   - all monthly entries for this year
  //   - any weekly entries NOT already covered by a monthly entry
  //   - any daily entries NOT already covered by a weekly or monthly entry
  const ytdMonthlyAnalytics = analytics.filter(a =>
    a.period_type === 'monthly' && a.period_id.startsWith(`${currentYear}-`)
  )
  // Months that have a monthly entry — don't double count their weeks
  const coveredMonths = new Set(ytdMonthlyAnalytics.map(a => a.period_id))

  const ytdWeeklyAnalytics = analytics.filter(a => {
    if (a.period_type !== 'weekly') return false
    if (a.period_id < yearStartStr) return false
    // Skip weeks that fall entirely within a covered month
    const weekMonth = a.period_id.substring(0, 7)
    if (coveredMonths.has(weekMonth)) return false
    return true
  })

  const ytdAnalytics = [...ytdMonthlyAnalytics, ...ytdWeeklyAnalytics]

  // ── Build final stats ─────────────────────────────────────────────────────
  return NextResponse.json({
    data: {
      yesterday: buildStats(
        sumReports(yesterdayReports),
        sumAnalytics(yesterdayAnalytics)
      ),
      thisWeek: buildStats(
        sumReports(weekReports),
        sumAnalytics(weekAnalytics)
      ),
      thisMonth: buildStats(
        sumReports(monthReports),
        sumAnalytics(monthAnalytics)
      ),
      ytd: buildStats(
        sumReports(ytdReports),
        sumAnalytics(ytdAnalytics)
      ),
    }
  })
}
