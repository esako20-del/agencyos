import { cn, formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPIProps {
  teamMonthlyAlp: number
  personalMonthlyAlp: number
  consistentAgents: number
  teamYtdAlp: number
  activeAgents: number
  totalAgents: number
  missingReports: number
  closeRate: number
  referralRate: number
  recruitsInPipeline: number
}

function KPICard({ label, value, sub, color = 'green', trend, trendUp }: {
  label: string; value: string; sub?: string; color?: string
  trend?: string; trendUp?: boolean
}) {
  const colorMap: Record<string, string> = {
    green: 'green', blue: 'blue', amber: 'amber', red: 'red', purple: 'purple'
  }
  const textMap: Record<string, string> = {
    green: 'text-accent-green', blue: 'text-accent-blue2',
    amber: 'text-accent-amber', red: 'text-accent-red', purple: 'text-accent-purple'
  }

  return (
    <div className={cn('kpi-card', colorMap[color])}>
      <div className="text-[9px] text-text-muted uppercase tracking-[1.5px] font-mono mb-2">{label}</div>
      <div className={cn('font-display text-2xl font-bold leading-none', textMap[color])}>{value}</div>
      {sub && <div className="text-[10px] text-text-muted mt-1.5">{sub}</div>}
      {trend && (
        <div className={cn(
          'absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono',
          trendUp ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
        )}>
          {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend}
        </div>
      )}
    </div>
  )
}

export default function KPIGrid(props: KPIProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard
          label="Team ALP — Month"
          value={formatCurrency(props.teamMonthlyAlp, true)}
          sub={`Goal: ${formatCurrency(50000, true)}/mo`}
          color="green"
          trend="↑ 12%"
          trendUp
        />
        <KPICard
          label="Personal ALP — Month"
          value={formatCurrency(props.personalMonthlyAlp, true)}
          sub="Pace: $177K/yr"
          color="blue"
          trend="↑ 6%"
          trendUp
        />
        <KPICard
          label="Consistent Agents"
          value={String(props.consistentAgents)}
          sub="Goal: 8 agents"
          color="amber"
        />
        <KPICard
          label="Team ALP — YTD"
          value={formatCurrency(props.teamYtdAlp, true)}
          sub="Pace: $437K/yr"
          color="green"
          trend="↑ 8%"
          trendUp
        />
        <KPICard
          label="Active / Total"
          value={`${props.activeAgents}/${props.totalAgents}`}
          sub="Goal: 26 agents"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label="Missing Reports"
          value={String(props.missingReports)}
          sub="Today · Alerts sent"
          color={props.missingReports > 0 ? 'red' : 'green'}
        />
        <KPICard
          label="Team Close Rate"
          value={`${props.closeRate}%`}
          sub="Avg across producers"
          color="green"
          trend="↑ 3pt"
          trendUp
        />
        <KPICard
          label="Referral Rate"
          value={String(props.referralRate)}
          sub="Refs per sale avg"
          color="amber"
        />
        <KPICard
          label="In Recruiting Pipeline"
          value={String(props.recruitsInPipeline)}
          sub="2 near release"
          color="blue"
        />
      </div>
    </div>
  )
}
