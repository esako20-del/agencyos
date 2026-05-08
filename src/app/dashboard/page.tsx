import { Suspense } from 'react'
import KPIGrid from '@/components/dashboard/KPIGrid'
import TeamALPChart from '@/components/charts/TeamALPChart'
import LeaderboardPanel from '@/components/dashboard/LeaderboardPanel'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import { TodayActivity, ActivityFeed } from '@/components/dashboard/ActivityFeed'

export default async function DashboardPage() {
  const todayTotals = {
    dials: 284, appointments: 31, sits: 22, sales: 9, alp: 8400,
    refAppts: 8, refSits: 5, refSales: 3, refAlp: 2800,
  }

  return (
    <div className="space-y-5 animate-in">
      <KPIGrid
        teamMonthlyAlp={37200}
        personalMonthlyAlp={14800}
        consistentAgents={4}
        teamYtdAlp={182000}
        activeAgents={9}
        totalAgents={13}
        missingReports={4}
        closeRate={42}
        referralRate={1.8}
        recruitsInPipeline={6}
      />
      <AlertsPanel missingReports={[]} />
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-5">
        <TeamALPChart data={[]} />
        <LeaderboardPanel entries={[]} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-5">
        <TodayActivity totals={todayTotals} />
        <ActivityFeed reports={[]} />
      </div>
    </div>
  )
}
