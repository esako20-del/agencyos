'use client'
import { useEffect, useState } from 'react'
import LeaderboardPanel from '@/components/dashboard/LeaderboardPanel'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

function fmt(val: number, type: 'alp' | 'ratio') {
  if (type === 'alp') {
    if (val === 0) return '$0'
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
    return `$${val}`
  }
  return val > 0 ? `${val}%` : '—'
}

function StatSection({ title, color, stats }: {
  title: string
  color: string
  stats: { label: string; value: string; sub?: string }[]
}) {
  return (
    <div style={{ background: '#0C1018', border: `1px solid ${color}22`, borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${color}22`, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
        <div style={{ fontSize: '10px', fontWeight: '700', color: color, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{title}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#1C2A3A' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#0C1018', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: color, fontFamily: 'system-ui' }}>{s.value}</div>
            <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
            {s.sub && <div style={{ fontSize: '10px', color: '#3D5068', marginTop: '2px' }}>{s.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/teamstats')
        const { data } = await res.json()
        setStats(data)
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [])

  const y = stats?.yesterday
  const w = stats?.thisWeek
  const m = stats?.thisMonth
  const ytd = stats?.ytd

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#ECF0F5' }}>

      {/* Team ALP */}
      <StatSection
        title="Team ALP Production"
        color="#00E5A0"
        stats={[
          { label: 'Yesterday', value: loading ? '...' : fmt(y?.alp || 0, 'alp'), sub: 'Prior day' },
          { label: 'This Week', value: loading ? '...' : fmt(w?.alp || 0, 'alp'), sub: 'Mon – today' },
          { label: 'This Month', value: loading ? '...' : fmt(m?.alp || 0, 'alp'), sub: 'MTD' },
          { label: 'YTD', value: loading ? '...' : fmt(ytd?.alp || 0, 'alp'), sub: 'Jan – today' },
        ]}
      />

      {/* Referral ALP */}
      <StatSection
        title="Team Referral ALP"
        color="#A78BFA"
        stats={[
          { label: 'Yesterday', value: loading ? '...' : fmt(y?.refAlp || 0, 'alp'), sub: 'Referral ALP' },
          { label: 'This Week', value: loading ? '...' : fmt(w?.refAlp || 0, 'alp'), sub: 'Mon – today' },
          { label: 'This Month', value: loading ? '...' : fmt(m?.refAlp || 0, 'alp'), sub: 'MTD' },
          { label: 'YTD', value: loading ? '...' : fmt(ytd?.refAlp || 0, 'alp'), sub: 'Jan – today' },
        ]}
      />

      {/* Show & Close Ratio */}
      <StatSection
        title="Show Ratio & Close Ratio"
        color="#3B82F6"
        stats={[
          { label: 'Yesterday', value: loading ? '...' : `${fmt(y?.showRatio || 0, 'ratio')} / ${fmt(y?.closeRatio || 0, 'ratio')}`, sub: 'Show / Close' },
          { label: 'This Week', value: loading ? '...' : `${fmt(w?.showRatio || 0, 'ratio')} / ${fmt(w?.closeRatio || 0, 'ratio')}`, sub: 'Show / Close' },
          { label: 'This Month', value: loading ? '...' : `${fmt(m?.showRatio || 0, 'ratio')} / ${fmt(m?.closeRatio || 0, 'ratio')}`, sub: 'Show / Close' },
          { label: 'YTD', value: loading ? '...' : `${fmt(ytd?.showRatio || 0, 'ratio')} / ${fmt(ytd?.closeRatio || 0, 'ratio')}`, sub: 'Show / Close' },
        ]}
      />

      {/* Referral Show & Close Ratio */}
      <StatSection
        title="Referral Show & Close Ratio"
        color="#F59E0B"
        stats={[
          { label: 'Yesterday', value: loading ? '...' : `${fmt(y?.refShowRatio || 0, 'ratio')} / ${fmt(y?.refCloseRatio || 0, 'ratio')}`, sub: 'Ref Show / Close' },
          { label: 'This Week', value: loading ? '...' : `${fmt(w?.refShowRatio || 0, 'ratio')} / ${fmt(w?.refCloseRatio || 0, 'ratio')}`, sub: 'Ref Show / Close' },
          { label: 'This Month', value: loading ? '...' : `${fmt(m?.refShowRatio || 0, 'ratio')} / ${fmt(m?.refCloseRatio || 0, 'ratio')}`, sub: 'Ref Show / Close' },
          { label: 'YTD', value: loading ? '...' : `${fmt(ytd?.refShowRatio || 0, 'ratio')} / ${fmt(ytd?.refCloseRatio || 0, 'ratio')}`, sub: 'Ref Show / Close' },
        ]}
      />

      {/* Live Alerts */}
      <AlertsPanel missingReports={[]} />

      <div style={{ height: '14px' }} />

      {/* Leaderboard + Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '14px' }}>
        <LeaderboardPanel entries={[]} />
        <ActivityFeed reports={[]} />
      </div>

    </div>
  )
}
