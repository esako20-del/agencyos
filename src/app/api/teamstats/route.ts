import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getDateRanges() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  // Start of this week (Monday)
  const weekStart = new Date(now)
  const day = weekStart.getDay()
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + diff)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // Start of this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartStr = monthStart.toISOString().split('T')[0]

  // Start of this year
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearStartStr = yearStart.toISOString().split('T')[0]

  return { today, yesterdayStr, weekStartStr, monthStartStr, yearStartStr }
}

function calcRatios(reports: any[]) {
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

export async function GET() {
  const { yesterdayStr, weekStartStr, monthStartStr, yearStartStr } = getDateRanges()

  const { data: allReports } = await supabaseAdmin
    .from('daily_reports')
    .select('*')
    .gte('report_date', yearStartStr)

  if (!allReports) return NextResponse.json({ data: null })

  const yesterday = allReports.filter(r => r.report_date === yesterdayStr)
  const thisWeek = allReports.filter(r => r.report_date >= weekStartStr)
  const thisMonth = allReports.filter(r => r.report_date >= monthStartStr)
  const ytd = allReports

  return NextResponse.json({
    data: {
      yesterday: calcRatios(yesterday),
      thisWeek: calcRatios(thisWeek),
      thisMonth: calcRatios(thisMonth),
      ytd: calcRatios(ytd),
    }
  })
}
