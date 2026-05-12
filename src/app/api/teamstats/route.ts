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
  const yearId = `${now.getFullYear()}`

  return { yesterdayStr, weekStartStr, monthStartStr, yearStartStr, weekId, monthId, yearId }
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
  // Combine both sources — add them together
  return {
    alp: (fromReports.alp || 0) + (fromAnalytics?.alp || 0),
    refAlp: (fromReports.refAlp || 0) + (fromAnalytics?.refAlp || 0),
    showRatio: fromReports.showRatio || fromAnalytics?.showRatio || 0,
    closeRatio: fromReports.closeRatio || fromAnalytics?.closeRatio || 0,
    refShowRatio: fromReports.refShowRatio || fromAnalytics?.refShowRatio || 0,
    refCloseRatio: fromReports.refCloseRatio || fromAnalytics?.refCloseRatio || 0,
  }
}

export async function GET() {
  const { yesterdayStr, weekStartStr, monthStartStr, yearStartStr, weekId, monthId } = getDateRanges()

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

  // Reports by period
  const yesterdayReports = reports.filter(r => r.report_date === yesterdayStr)
  const weekReports = reports.filter(r => r.report_date >= weekStartStr)
  const monthReports = reports.filter(r => r.report_date >= monthStartStr)
  const ytdReports = reports

  // Analytics by period — sum up all weekly entries that fall in the month
  const yesterdayAnalytics = analytics.find(a => a.period_type === 'daily' && a.period_id === yesterdayStr)
  const weekAnalytics = analytics.find(a => a.period_type === 'weekly' && a.period_id === weekId)

  // For month — sum all weekly entries that start in this month + monthly entry
  const monthWeeklyAnalytics = analytics.filter(a =>
    a.period_type === 'weekly' && a.period_id >= monthStartStr
  )
  const monthAnalyticsEntry = analytics.find(a => a.period_type === 'monthly' && a.period_id === monthId)
  const monthAnalyticsCombined = calcRatios(sumAnalytics([
    ...monthWeeklyAnalytics,
    ...(monthAnalyticsEntry ? [{ ...monthAnalyticsEntry, ref_alp: monthAnalyticsEntry.ref_alp }] : [])
  ]))

  // For YTD — sum all analytics entries
  const ytdAnalytics = calcRatios(sumAnalytics(analytics))

  return NextResponse.json({
    data: {
      yesterday: mergeStats(calcFromReports(yesterdayReports), yesterdayAnalytics ? calcRatios(sumAnalytics([yesterdayAnalytics])) : null),
      thisWeek: mergeStats(calcFromReports(weekReports), weekAnalytics ? calcRatios(sumAnalytics([weekAnalytics])) : null),
      thisMonth: mergeStats(calcFromReports(monthReports), monthAnalyticsCombined),
      ytd: mergeStats(calcFromReports(ytdReports), ytdAnalytics),
    }
  })
}
