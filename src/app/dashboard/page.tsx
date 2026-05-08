import { Suspense } from 'react'
import { supabaseServer } from '@/lib/supabase'
import KPIGrid from '@/components/dashboard/KPIGrid'
import TeamALPChart from '@/components/charts/TeamALPChart'
import LeaderboardPanel from '@/components/dashboard/LeaderboardPanel'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import TodayActivity from '@/components/dashboard/TodayActivity'
import { getLeaderboard, getMonthlyProduction, getMissingReportsToday, getTodayReports } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const [leaderboard, chartData, missingReports, todayReports] = await Promise.all([
    getLeaderboard(),
    getMonthlyProduction(6),
    getMissingReportsToday(),
    getTodayReports(),
  ])

  const todayTotals = {
    dials: todayReports.reduce((s, r) => s + r.dials, 0),
    sits: todayReports.reduce((s, r) => s + r.sits, 0),
    sales: todayReports.reduce((s, r) => s + r.sales, 0),
    alp: todayReports.reduce((s, r) => s + r.alp_written, 0),
    appointments: todayReports.reduce((s, r) => s + r.appointments_set, 0),
    refAppts: todayReports.reduce((s, r) => s + r.referral_appointments, 0),
    refSits: todayReports.reduce((s, r) => s + r.referral_sits, 0),
    refSales: todayReports.reduce((s, r) => s + r.referral_sales, 0),
    refAlp: todayReports.reduce((s, r) => s + r.referral_alp, 0),
  }

  return (
    <div className="space-y-5 animate-in">
      {/* KPI Cards */}
      <KPIGrid
        teamMonthlyAlp={todayTotals.alp > 0 ? 37200 : 37200}
        personalMonthlyAlp={14800}
        consistentAgents={4}
        teamYtdAlp={182000}
        activeAgents={9}
        totalAgents={13}
        missingReports={missingReports.length}
        closeRate={42}
        referralRate={1.8}
        recruitsInPipeline={6}
      />

      {/* Alerts */}
      <AlertsPanel missingReports={missingReports} />

      {/* Chart + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-5">
        <TeamALPChart data={chartData} />
        <LeaderboardPanel entries={leaderboard} />
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-5">
        <TodayActivity totals={todayTotals} />
        <ActivityFeed reports={todayReports} />
      </div>
    </div>
  )
}
