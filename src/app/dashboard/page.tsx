import LeaderboardPanel from '@/components/dashboard/LeaderboardPanel'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

async function getTeamStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://agencyos-silk-pi.vercel.app'}/api/teamstats`, { cache: 'no-store' })
    const { data } = await res.json()
    return data
  } catch (e) {
    return null
  }
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
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#ECF0F5' }}>

      {/* Live Alerts */}
      <AlertsPanel missingReports={[]} />

      <div style={{ height: '14px' }} />

      {/* ALP Sections */}
      <StatSection
        title="Team ALP Production"
        color="#00E5A0"
        stats={[
          { label: 'Yesterday', value: '$0', sub: 'Submit reports to track' },
          { label: 'This Week', value: '$0', sub: 'Mon – today' },
          { label: 'This Month', value: '$0', sub: 'MTD' },
          { label: 'YTD', value: '$0', sub: 'Jan – today' },
        ]}
      />

      <StatSection
        title="Team Referral ALP"
        color="#A78BFA"
        stats={[
          { label: 'Yesterday', value: '$0', sub: 'Referral ALP' },
          { label: 'This Week', value: '$0', sub: 'Mon – today' },
          { label: 'This Month', value: '$0', sub: 'MTD' },
          { label: 'YTD', value: '$0', sub: 'Jan – today' },
        ]}
      />

      <StatSection
        title="Show Ratio & Close Ratio"
        color="#3B82F6"
        stats={[
          { label: 'Yesterday', value: '—', sub: 'Show / Close' },
          { label: 'This Week', value: '—', sub: 'Show / Close' },
          { label: 'This Month', value: '—', sub: 'Show / Close' },
          { label: 'YTD', value: '—', sub: 'Show / Close' },
        ]}
      />

      <StatSection
        title="Referral Show & Close Ratio"
        color="#F59E0B"
        stats={[
          { label: 'Yesterday', value: '—', sub: 'Ref Show / Close' },
          { label: 'This Week', value: '—', sub: 'Ref Show / Close' },
          { label: 'This Month', value: '—', sub: 'Ref Show / Close' },
          { label: 'YTD', value: '—', sub: 'Ref Show / Close' },
        ]}
      />

      {/* Leaderboard + Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '14px' }}>
        <LeaderboardPanel entries={[]} />
        <ActivityFeed reports={[]} />
      </div>

    </div>
  )
}
