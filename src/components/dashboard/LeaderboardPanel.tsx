import { LeaderboardEntry } from '@/types'
import { formatCurrency, tierColor } from '@/lib/utils'
import Link from 'next/link'

const COLORS = ['#F59E0B', '#94A3B8', '#B45309']
const MOCK: LeaderboardEntry[] = [
  { id: '1', full_name: 'Marcus W.', tier: 'consistent', ytd_alp: 182000, monthly_alp: 13100, avg_close_rate: 58, rank: 1 },
  { id: '2', full_name: 'DeShawn T.', tier: 'consistent', ytd_alp: 72000, monthly_alp: 8400, avg_close_rate: 47, rank: 2 },
  { id: '3', full_name: 'Jordan R.', tier: 'consistent', ytd_alp: 42000, monthly_alp: 10200, avg_close_rate: 52, rank: 3 },
  { id: '4', full_name: 'Priya S.', tier: 'consistent', ytd_alp: 52000, monthly_alp: 6500, avg_close_rate: 44, rank: 4 },
  { id: '5', full_name: 'Keisha M.', tier: 'training', ytd_alp: 18000, monthly_alp: 3600, avg_close_rate: 36, rank: 5 },
  { id: '6', full_name: 'Destiny H.', tier: 'parttime', ytd_alp: 9800, monthly_alp: 1800, avg_close_rate: 30, rank: 6 },
]

export default function LeaderboardPanel({ entries }: { entries: LeaderboardEntry[] }) {
  const data = entries.length > 0 ? entries : MOCK
  const topAlp = data[0]?.ytd_alp ?? 1

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">YTD Leaderboard</div>
        <Link href="/dashboard/team" className="text-[10px] text-accent-green font-mono hover:underline">
          All Agents →
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {data.map((agent, i) => {
          const pct = Math.round((agent.ytd_alp / topAlp) * 100)
          const rankColor = i < 3 ? COLORS[i] : '#3D5068'
          const initials = agent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)

          return (
            <div key={agent.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.015] transition-colors">
              <div className="font-display text-base font-bold w-5 flex-shrink-0" style={{ color: rankColor }}>
                {i + 1}
              </div>
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: `${rankColor}22`, color: rankColor }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{agent.full_name}</div>
                <div className="h-1 bg-surface-3 rounded-full mt-1 overflow-hidden w-full max-w-[80px]">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: rankColor }} />
                </div>
              </div>
              <div className="text-xs text-accent-green font-mono font-medium flex-shrink-0">
                {formatCurrency(agent.ytd_alp, true)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
