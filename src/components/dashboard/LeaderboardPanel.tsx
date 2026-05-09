import Link from 'next/link'

const AGENTS = [
  { id: '1', full_name: 'Jonis H.', tier: 's_tier', ytd: 182000, monthly_alp: 13100, avg_close_rate: 58, rank: 1 },
  { id: '2', full_name: 'Caitlyn R.', tier: 'a_tier', ytd: 115000, monthly_alp: 9800, avg_close_rate: 52, rank: 2 },
  { id: '3', full_name: 'Luis K.', tier: 'a_tier', ytd: 102000, monthly_alp: 8700, avg_close_rate: 49, rank: 3 },
  { id: '20', full_name: 'Enri S.', tier: 'a_tier', ytd: 74000, monthly_alp: 14800, avg_close_rate: 48, rank: 4 },
  { id: '4', full_name: 'Rachel N.', tier: 'b_tier', ytd: 82000, monthly_alp: 7200, avg_close_rate: 46, rank: 5 },
  { id: '5', full_name: 'Ardit M.', tier: 'b_tier', ytd: 74000, monthly_alp: 6400, avg_close_rate: 44, rank: 6 },
  { id: '6', full_name: 'Adrian B.', tier: 'b_tier', ytd: 61000, monthly_alp: 5200, avg_close_rate: 41, rank: 7 },
  { id: '7', full_name: 'Dayell F.', tier: 'b_tier', ytd: 54000, monthly_alp: 4800, avg_close_rate: 39, rank: 8 },
  { id: '8', full_name: 'Enkela M.', tier: 'c_tier', ytd: 44000, monthly_alp: 3900, avg_close_rate: 36, rank: 9 },
  { id: '9', full_name: 'Kelsey S.', tier: 'c_tier', ytd: 41000, monthly_alp: 3600, avg_close_rate: 34, rank: 10 },
]

const TIER_COLORS: Record<string, string> = {
  s_tier: '#F59E0B',
  a_tier: '#00E5A0',
  b_tier: '#3B82F6',
  c_tier: '#A78BFA',
  t_tier: '#F97316',
  i_tier: '#EF4444',
}

const COLORS = ['#F59E0B', '#94A3B8', '#B45309']

export default function LeaderboardPanel({ entries }: { entries: any[] }) {
  const data = AGENTS
  const topAlp = data[0]?.ytd ?? 1

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
          const pct = Math.round((agent.ytd / topAlp) * 100)
          const rankColor = i < 3 ? COLORS[i] : '#3D5068'
          const tierColor = TIER_COLORS[agent.tier] || '#7A90A8'
          const initials = agent.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)

          return (
            <div key={agent.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.015] transition-colors cursor-pointer"
              onClick={() => window.location.href = `/dashboard/team/${agent.id}`}>
              <div className="font-display text-base font-bold w-5 flex-shrink-0" style={{ color: rankColor }}>
                {i + 1}
              </div>
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: `${tierColor}22`, color: tierColor }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{agent.full_name}</div>
                <div className="h-1 bg-surface-3 rounded-full mt-1 overflow-hidden w-full max-w-[80px]">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tierColor }} />
                </div>
              </div>
              <div className="text-xs font-mono font-medium flex-shrink-0" style={{ color: tierColor }}>
                ${(agent.ytd / 1000).toFixed(0)}K
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
