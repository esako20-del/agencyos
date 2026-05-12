import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getDateRanges() {
  const now = new Date()

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const weekStart = new Date(now)
  const day = weekStart.getDay()
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + diff)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartStr = monthStart.toISOString().split('T')[0]

  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearStartStr = yearStart.toISOString().split('T')[0]

  const weekId = weekStartStr
  const monthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentYear = now.getFullYear()

  return { yesterdayStr, weekStartStr, monthStartStr, yearStartStr, weekId, monthId, currentYear }
}

function sumAnalytics(entries: any[]) {
  return entries.reduce((acc, e) => ({
    alp: acc.alp + (e.alp || 0),
    refAlp: acc.refAlp + (e.ref_alp || 0),
    appointments: acc.appointments + (e.appointments || 0),
    sits: acc.sits + (e.sits || 0),
    sales: acc.sales + (e.sales || 0),
    refAppointments: acc.refAppointments + (e.ref_appointments || 0),
    refSits: acc.refSits + (e.ref_sits || 0),
    refSales: acc.refSales + (e.ref_sales || 0),
  }), { alp: 0, refAlp: 0, appointments: 0, sits: 0, sales: 0, refAppointments: 0, refSits: 0, refSales: 0 })
}

function calcRatios(data: any) {
  const { alp, refAlp, appointments, sits, sales, refAppointments, refSits, refSales } = data
  return {
    alp,
    refAlp,
    showRatio: appointments > 0 ? Math.round((sits / appointments) * 100) : 0,
    closeRatio: sits > 0 ? Math.round((sales / sits) * 100) : 0,
    refShowRatio: refAppointments > 0 ? Math.round((refSits / refAppointments) * 100) : 0,
    refCloseRatio: refSits > 0 ? Math.round((refSales / refSits) * 100) : 0,
  }
}

function calcFromReports(reports: any[]) {
  const appts = reports.reduce((s, r) => s + (r.appointments_set || 0), 0)
  const sits = reports.reduce((s, r) => s + (r.sits || 0), 0)
  const sales = reports.reduce((s, r) => s + (r.sales || 0), 0)
  const refAppts = reports.reduce((s, r) => s + (r.referral_appointments || 0), 0)
  const refSits = reports.reduce((s, r) => s + (r.referral_sits || 0), 0)
  const refSales = reports.reduce((s, r) => s + (r.referral_sales || 0), 0)
  return {
    alp: reports.reduce((s, r) => s + (r.alp_written || 0), 0),
    refAlp: reports.reduce((s, r) => s + (r.referral_alp || 0), 0),
    showRatio: appts > 0 ? Math.round((sits / appts) * 100) : 0,
    closeRatio: sits > 0 ? Math.round((sales / sits) * 100) : 0,
    refShowRatio: refAppts > 0 ? Math.round((refSits / refAppts) * 100) : 0,
    refCloseRatio: refSits > 0 ? Math.round((refSales / refSits) * 100) : 0,
  }
}

function mergeStats(fromReports: any, fromAnalytics: any) {
  const totalAlp = (fromReports.alp || 0) + (fromAnalytics?.alp || 0)
  const totalRefAlp = (fromReports.refAlp || 0) + (fromAnalytics?.refAlp || 0)
  return {
    alp: totalAlp,
    refAlp: totalRefAlp,
    showRatio: fromReports.showRatio || fromAnalytics?.showRatio || 0,
    closeRatio: fromReports.closeRatio || fromAnalytics?.closeRatio || 0,
    refShowRatio: fromReports.refShowRatio || fromAnalytics?.refShowRatio || 0,
    refCloseRatio: fromReports.refCloseRatio || fromAnalytics?.refCloseRatio || 0,
  }
}

export async function GET() {
  const { yesterdayStr, weekStartStr, monthStartStr, yearStartStr, weekId, monthId, currentYear } = getDateRanges()

  // Get all daily reports for the year
  const { data: allReports } = await supabaseAdmin
    .from('daily_reports')
    .select('*')
    .gte('report_date', yearStartStr)

  // Get all analytics data
  const { data: analyticsData } = await supabaseAdmin
    .from('analytics_data')
    .select('*')

  const reports = allReports || []
  const analytics = analyticsData || []

  // Split reports by period
  const yesterdayReports = reports.filter(r => r.report_date === yesterdayStr)
  const weekReports = reports.filter(r => r.report_date >= weekStartStr)
  const monthReports = reports.filter(r => r.report_date >= monthStartStr)
  const ytdReports = reports

  // Yesterday analytics
  const yesterdayAnalytics = analytics.find(a =>
    a.period_type === 'daily' && a.period_id === yesterdayStr
  )

  // This week analytics
  const weekAnalytics = analytics.find(a =>
    a.period_type === 'weekly' && a.period_id === weekId
  )

  // This month analytics — weekly entries in this month + monthly entry
  const monthWeeklyAnalytics = analytics.filter(a =>
    a.period_type === 'weekly' && a.period_id >= monthStartStr
  )
  const monthAnalyticsEntry = analytics.find(a =>
    a.period_type === 'monthly' && a.period_id === monthId
  )
  const monthAnalyticsCombined = calcRatios(sumAnalytics([
    ...monthWeeklyAnalytics,
    ...(monthAnalyticsEntry ? [monthAnalyticsEntry] : [])
  ]))

  // YTD analytics — ALL monthly entries for current year + ALL weekly entries + ALL daily entries
  const ytdMonthlyAnalytics = analytics.filter(a =>
    a.period_type === 'monthly' && a.period_id.startsWith(`${currentYear}-`)
  )
  const ytdWeeklyAnalytics = analytics.filter(a =>
    a.period_type === 'weekly' && a.period_id >= `${currentYear}-01-01`
  )
  const ytdDailyAnalytics = analytics.filter(a =>
    a.period_type === 'daily' && a.period_id >= `${currentYear}-01-01`
  )

  // For YTD we need to avoid double counting — prefer monthly over weekly over daily
  // Use monthly entries for past months, weekly for current month, daily for current week
  const pastMonths = ytdMonthlyAnalytics.filter(a => a.period_id !== monthId)
  const currentMonthWeekly = ytdWeeklyAnalytics.filter(a => a.period_id >= monthStartStr)

  const ytdAnalyticsCombined = calcRatios(sumAnalytics([
    ...pastMonths,
    ...currentMonthWeekly,
    ...(weekAnalytics && !currentMonthWeekly.find((a: any) => a.period_id === weekId) ? [weekAnalytics] : []),
  ]))

  return NextResponse.json({
    data: {
      yesterday: mergeStats(
        calcFromReports(yesterdayReports),
        yesterdayAnalytics ? calcRatios(sumAnalytics([yesterdayAnalytics])) : null
      ),
      thisWeek: mergeStats(
        calcFromReports(weekReports),
        weekAnalytics ? calcRatios(sumAnalytics([weekAnalytics])) : null
      ),
      thisMonth: mergeStats(
        calcFromReports(monthReports),
        monthAnalyticsCombined
      ),
      ytd: mergeStats(
        calcFromReports(ytdReports),
        ytdAnalyticsCombined
      ),
    }
  })
}
