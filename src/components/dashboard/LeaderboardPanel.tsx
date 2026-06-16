'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const TIER_COLORS: Record<string, string> = {
  s_tier: '#F59E0B',
  a_tier: '#00E5A0',
  b_tier: '#3B82F6',
  c_tier: '#A78BFA',
  t_tier: '#F97316',
  i_tier: '#EF4444',
}

const AGENT_IDS: Record<string, string> = {
  'Jonis H.': '1', 'Caitlyn R.': '2', 'Luis K.': '3',
  'Ardit M.': '5', 'Adrian B.': '6', 'Dayell F.': '7',
  'Kelsey S.': '9', 'Edlira S.': '10', 'Matthew H.': '11', 'Drew C.': '12',
  'Nadirah M.': '13', 'Tiffany S.': '14', 'Jorge R.': '15', 'Alyssa H.': '16',
  'Llambi T.': '17', 'Endi A.': '18', 'Enri S.': '20', 'Bruno N.': '21',
}

const RANK_COLORS = ['#F59E0B', '#94A3B8', '#B45309']

export default function LeaderboardPanel({ entries }: { entries: any[] }) {
  const [agents, setAgents] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/agentscoreboard', { cache: 'no-store' })
        const { data } = await res.json()
        if (data) {
          setAgents(
            [...data]
              .filter(a => a.ytdAlp > 0)
              .sort((a, b) => b.ytdAlp - a.ytdAlp)
              .slice(0, 10)
          )
        }
      } catch (e) {}
    }
    load()
  }, [])

  const topAlp = agents[0]?.ytdAlp || 1

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">YTD Leaderboard</div>
        <Link href="/dashboard/team" className="text-[10px] text-accent-green font-mono hover:underline">
          All Agents →
        </Link>
      </div>
      {agents.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#3D5068', fontSize: '12px' }}>
          No production data yet.
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {agents.map((agent, i) => {
            const ytd       = agent.ytdAlp || 0
            const pct       = Math.round((ytd / topAlp) * 100)
            const rankColor = i < 3 ? RANK_COLORS[i] : '#3D5068'
            const tierColor = TIER_COLORS[agent.tier] || '#7A90A8'
            const initials  = agent.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
            const agentId   = AGENT_IDS[agent.full_name] || '1'

            return (
              <div
                key={agent.id}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.015] transition-colors cursor-pointer"
                onClick={() => window.location.href = `/dashboard/team/${agentId}`}
              >
                <div className="font-display text-base font-bold w-5 flex-shrink-0" style={{ color: rankColor }}>
                  {i + 1}
                </div>
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: `${tierColor}22`, color: tierColor }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{agent.full_name}</div>
                  <div className="h-1 bg-surface-3 rounded-full mt-1 overflow-hidden w-full max-w-[80px]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tierColor }} />
                  </div>
                </div>
                <div className="text-xs font-mono font-medium flex-shrink-0" style={{ color: tierColor }}>
                  ${(ytd / 1000).toFixed(0)}K
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
