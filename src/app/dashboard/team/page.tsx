'use client'
import { useState, useEffect } from 'react'

const TIER_COLORS: Record<string, string> = {
  s_tier: '#F59E0B',
  a_tier: '#00E5A0',
  b_tier: '#3B82F6',
  c_tier: '#A78BFA',
  t_tier: '#F97316',
  i_tier: '#EF4444',
}

const TIER_LABELS: Record<string, string> = {
  s_tier: 'S Tier',
  a_tier: 'A Tier',
  b_tier: 'B Tier',
  c_tier: 'C Tier',
  t_tier: 'T Tier',
  i_tier: 'I Tier',
}

const TIER_DESC: Record<string, string> = {
  s_tier: '$150K+ ALP',
  a_tier: '$100K–$150K ALP',
  b_tier: '$50K–$100K ALP',
  c_tier: '$35K–$50K ALP',
  t_tier: 'In Training',
  i_tier: 'Inactive',
}

const AGENT_IDS: Record<string, string> = {
  'Jonis H.': '1', 'Caitlyn R.': '2', 'Luis K.': '3', 'Rachel N.': '4',
  'Ardit M.': '5', 'Adrian B.': '6', 'Dayell F.': '7', 'Enkela M.': '8',
  'Kelsey S.': '9', 'Edlira S.': '10', 'Matthew H.': '11', 'Drew C.': '12',
  'Nadirah M.': '13', 'Tiffany S.': '14', 'Jorge R.': '15', 'Alyssa H.': '16',
  'Llambi T.': '17', 'Endi A.': '18', 'Klaudiana V.': '19', 'Enri S.': '20',
}

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'S Tier', value: 's_tier' },
  { label: 'A Tier', value: 'a_tier' },
  { label: 'B Tier', value: 'b_tier' },
  { label: 'C Tier', value: 'c_tier' },
  { label: 'T Tier', value: 't_tier' },
  { label: 'I Tier', value: 'i_tier' },
]

export default function TeamPage() {
  const [filter, setFilter] = useState('all')
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch('/api/agents')
        const { data } = await res.json()
        if (data) setAgents(data)
      } catch (e) {}
      setLoading(false)
    }
    loadAgents()
  }, [])

  const filtered = filter === 'all' ? agents : agents.filter(a => a.tier === filter)
  const topYtd = Math.max(...agents.map(a => a.ytd_alp || 0), 1)

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#7A90A8', fontFamily: 'system-ui' }}>
      Loading team data...
    </div>
  )

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#ECF0F5' }}>

      {/* Tier legend */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {Object.keys(TIER_LABELS).map(tier => (
          <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0C1018', border: `1px solid ${TIER_COLORS[tier]}44`, borderRadius: '6px', padding: '5px 10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: TIER_COLORS[tier] }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: TIER_COLORS[tier] }}>{TIER_LABELS[tier]}</span>
            <span style={{ fontSize: '10px', color: '#3D5068' }}>{TIER_DESC[tier]}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs + Add button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '2px', background: '#111820', border: '1px solid #1C2A3A', padding: '3px', borderRadius: '8px', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)} style={{
              padding: '6px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '600',
              cursor: 'pointer', border: 'none',
              background: filter === t.value ? '#0C1018' : 'transparent',
              color: filter === t.value ? '#ECF0F5' : '#7A90A8',
            }}>
              {t.label} {t.value === 'all' ? `(${agents.length})` : `(${agents.filter(a => a.tier === t.value).length})`}
            </button>
          ))}
        </div>
        <button style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
          + Add Agent
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#111820' }}>
              {['Agent', 'Tier', 'YTD ALP', 'This Month', 'Close %', 'Sits', 'Refs', 'Streak', 'Health'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1.2px', borderBottom: '1px solid #1C2A3A', fontWeight: '500' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(agent => {
              const ytd = agent.ytd_alp || 0
              const month = agent.month_alp || 0
              const close = agent.close_rate || 0
              const sits = agent.avg_daily_sits || 0
              const refs = agent.refs_per_sale || 0
              const streak = agent.streak_days || 0
              const health = agent.health_status || 'yellow'
              const pct = Math.round((ytd / topYtd) * 100)
              const tierColor = TIER_COLORS[agent.tier] || '#7A90A8'
              const tierLabel = TIER_LABELS[agent.tier] || agent.tier
              const healthColor = health === 'green' ? '#00E5A0' : health === 'yellow' ? '#F59E0B' : '#EF4444'
              const closeColor = close >= 45 ? '#00E5A0' : close >= 30 ? '#F59E0B' : '#EF4444'
              const initials = agent.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
              const agentId = AGENT_IDS[agent.full_name] || '1'

              return (
                <tr key={agent.id}
                  onClick={() => window.location.href = `/dashboard/team/${agentId}`}
                  style={{ cursor: 'pointer', borderBottom: '1px solid rgba(28,42,58,0.5)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${tierColor}22`, color: tierColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600' }}>{agent.full_name}</div>
                        <div style={{ fontSize: '10px', color: '#3D5068' }}>{tierLabel}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: `${tierColor}22`, color: tierColor, border: `1px solid ${tierColor}44` }}>
                      {tierLabel}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '12px', color: '#00E5A0', fontWeight: '600' }}>{ytd > 0 ? `$${(ytd/1000).toFixed(0)}K` : '—'}</div>
                    <div style={{ width: '80px', height: '3px', background: '#16202C', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: tierColor, borderRadius: '2px' }} />
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#60A5FA', fontWeight: '500' }}>{month > 0 ? `$${(month/1000).toFixed(1)}K` : '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: close > 0 ? closeColor : '#3D5068' }}>{close > 0 ? `${close}%` : '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#7A90A8' }}>{sits > 0 ? sits : '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#7A90A8' }}>{refs > 0 ? refs : '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: streak > 0 ? '#00E5A0' : '#EF4444' }}>
                    {streak > 0 ? `🔥 ${streak}d` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: healthColor, boxShadow: `0 0 5px ${healthColor}` }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
