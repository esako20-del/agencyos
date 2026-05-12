import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getDateRanges() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

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

  return { today, yesterdayStr, weekStartStr, monthStartStr, yearStartStr, weekId, monthId }
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

function calcFromAnalytics(entry: any) {
  if (!entry) return null
  const appts = entry.appointments || 0
  const sits = entry.sits || 0
  const sales = entry.sales || 0
  const refAppts = entry.ref_appointments || 0
  const refSits = entry.ref_sits || 0
  const refSales = entry.ref_sales || 0
  return {
    alp: entry.alp || 0,
    refAlp: entry.ref_alp || 0,
    showRatio: appts > 0 ? Math.round((sits / appts) * 100) : 0,
    closeRatio: sits > 0 ? Math.round((sales / sits) * 100) : 0,
    refShowRatio: refAppts > 0 ? Math.round((refSits / refAppts) * 100) : 0,
    refCloseRatio: refSits > 0 ? Math.round((refSales / refSits) * 100) : 0,
  }
}

function merge(fromReports: any, fromAnalytics: any) {
  // If we have real report data use it, otherwise fall back to manually entered analytics
  if (fromReports.alp > 0 || fromReports.showRatio > 0) return fromReports
  if (fromAnalytics) return fromAnalytics
  return fromReports
}

export async function GET() {
  const { yesterdayStr, weekStartStr, monthStartStr, yearStartStr, weekId, monthId } = getDateRanges()

  // Get all daily reports for the year
  const { data: allReports } = await supabaseAdmin
    .from('daily_reports')
    .select('*')
    .gte('report_date', yearStartStr)

  // Get manually entered analytics data
  const { data: analyticsData } = await supabaseAdmin
    .from('analytics_data')
    .select('*')

  const reports = allReports || []
  const analytics = analyticsData || []

  const yesterdayReports = reports.filter(r => r.report_date === yesterdayStr)
  const weekReports = reports.filter(r => r.report_date >= weekStartStr)
  const monthReports = reports.filter(r => r.report_date >= monthStartStr)
  const ytdReports = reports

  const yesterdayAnalytics = analytics.find(a => a.period_type === 'daily' && a.period_id === yesterdayStr)
  const weekAnalytics = analytics.find(a => a.period_type === 'weekly' && a.period_id === weekId)
  const monthAnalytics = analytics.find(a => a.period_type === 'monthly' && a.period_id === monthId)

  return NextResponse.json({
    data: {
      yesterday: merge(calcFromReports(yesterdayReports), calcFromAnalytics(yesterdayAnalytics)),
      thisWeek: merge(calcFromReports(weekReports), calcFromAnalytics(weekAnalytics)),
      thisMonth: merge(calcFromReports(monthReports), calcFromAnalytics(monthAnalytics)),
      ytd: calcFromReports(ytdReports),
    }
  })
}
