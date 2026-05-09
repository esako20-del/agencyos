'use client'
import { useState } from 'react'

const AGENTS = [
  { id: '1', full_name: 'Jonis H.', role: 'Top Producer', tier: 's_tier', ytd: 182000, month: 13100, sits: 24, close: 58, refs: 9, leads: 'Union+Vet', streak: 22, health: 'green', initials: 'JH', color: '#F59E0B' },
  { id: '2', full_name: 'Caitlyn R.', role: 'A Tier Producer', tier: 'a_tier', ytd: 115000, month: 9800, sits: 21, close: 52, refs: 7, leads: 'Union+POS', streak: 14, health: 'green', initials: 'CR', color: '#00E5A0' },
  { id: '3', full_name: 'Luis K.', role: 'A Tier Producer', tier: 'a_tier', ytd: 102000, month: 8700, sits: 19, close: 49, refs: 6, leads: 'Union', streak: 11, health: 'green', initials: 'LK', color: '#00E5A0' },
  { id: '4', full_name: 'Rachel N.', role: 'B Tier Producer', tier: 'b_tier', ytd: 82000, month: 7200, sits: 17, close: 46, refs: 5, leads: 'Union', streak: 9, health: 'green', initials: 'RN', color: '#3B82F6' },
  { id: '5', full_name: 'Ardit M.', role: 'B Tier Producer', tier: 'b_tier', ytd: 74000, month: 6400, sits: 16, close: 44, refs: 4, leads: 'Veteran', streak: 8, health: 'green', initials: 'AM', color: '#3B82F6' },
  { id: '6', full_name: 'Adrian B.', role: 'B Tier Producer', tier: 'b_tier', ytd: 61000, month: 5200, sits: 14, close: 41, refs: 4, leads: 'Union', streak: 6, health: 'yellow', initials: 'AB', color: '#3B82F6' },
  { id: '7', full_name: 'Dayell F.', role: 'B Tier Producer', tier: 'b_tier', ytd: 54000, month: 4800, sits: 13, close: 39, refs: 3, leads: 'New Pack', streak: 5, health: 'yellow', initials: 'DF', color: '#3B82F6' },
  { id: '8', full_name: 'Enkela M.', role: 'C Tier Producer', tier: 'c_tier', ytd: 44000, month: 3900, sits: 11, close: 36, refs: 3, leads: 'Union', streak: 4, health: 'yellow', initials: 'EM', color: '#A78BFA' },
  { id: '9', full_name: 'Kelsey S.', role: 'C Tier Producer', tier: 'c_tier', ytd: 41000, month: 3600, sits: 10, close: 34, refs: 2, leads: 'New Pack', streak: 3, health: 'yellow', initials: 'KS', color: '#A78BFA' },
  { id: '10', full_name: 'Edlira S.', role: 'C Tier Producer', tier: 'c_tier', ytd: 38000, month: 3200, sits: 9, close: 33, refs: 2, leads: 'Union', streak: 2, health: 'yellow', initials: 'ES', color: '#A78BFA' },
  { id: '11', full_name: 'Matthew H.', role: 'C Tier Producer', tier: 'c_tier', ytd: 36000, month: 3100, sits: 8, close: 31, refs: 2, leads: 'New Pack', streak: 2, health: 'yellow', initials: 'MH', color: '#A78BFA' },
  { id: '12', full_name: 'Drew C.', role: 'C Tier Producer', tier: 'c_tier', ytd: 35500, month: 3000, sits: 8, close: 30, refs: 1, leads: 'New Pack', streak: 1, health: 'yellow', initials: 'DC', color: '#A78BFA' },
  { id: '13', full_name: 'Nadirah M.', role: 'C Tier Producer', tier: 'c_tier', ytd: 35000, month: 2900, sits: 7, close: 29, refs: 1, leads: 'New Pack', streak: 1, health: 'yellow', initials: 'NM', color: '#A78BFA' },
  { id: '14', full_name: 'Tiffany S.', role: 'C Tier Producer', tier: 'c_tier', ytd: 35000, month: 2800, sits: 7, close: 28, refs: 1, leads: 'New Pack', streak: 1, health: 'yellow', initials: 'TS', color: '#A78BFA' },
  { id: '15', full_name: 'Jorge R.', role: 'In Training', tier: 't_tier', ytd: 0, month: 0, sits: 0, close: 0, refs: 0, leads: 'New Pack', streak: 0, health: 'yellow', initials: 'JR', color: '#F59E0B' },
  { id: '16', full_name: 'Alyssa H.', role: 'In Training', tier: 't_tier', ytd: 0, month: 0, sits: 0, close: 0, refs: 0, leads: 'New Pack', streak: 0, health: 'yellow', initials: 'AH', color: '#F59E0B' },
  { id: '17', full_name: 'Llambi T.', role: 'Inactive', tier: 'i_tier', ytd: 0, month: 0, sits: 0, close: 0, refs: 0, leads: 'N/A', streak: 0, health: 'red', initials: 'LT', color: '#EF4444' },
  { id: '18', full_name: 'Endi A.', role: 'Inactive', tier: 'i_tier', ytd: 0, month: 0, sits: 0, close: 0, refs: 0, leads: 'N/A', streak: 0, health: 'red', initials: 'EA', color: '#EF4444' },
  { id: '19', full_name: 'Klaudiana V.', role: 'Inactive', tier: 'i_tier', ytd: 0, month: 0, sits: 0, close: 0, refs: 0, leads: 'N/A', streak: 0, health: 'red', initials: 'KV', color: '#EF4444' },
]

const TABS = [
  { label: 'All (19)', value: 'all' },
  { label: 'S Tier (1)', value: 's_tier' },
  { label: 'A Tier (2)', value: 'a_tier' },
  { label: 'B Tier (4)', value: 'b_tier' },
  { label: 'C Tier (7)', value: 'c_tier' },
  { label: 'T Tier (2)', value: 't_tier' },
  { label: 'I Tier (3)', value: 'i_tier' },
]

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

export default function TeamPage() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? AGENTS : AGENTS.filter(a => a.tier === filter)
  const topYtd = Math.max(...AGENTS.map(a => a.ytd), 1)

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
              {t.label}
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
              const pct = Math.round((agent.ytd / topYtd) * 100)
              const healthColor = agent.health === 'green' ? '#00E5A0' : agent.health === 'yellow' ? '#F59E0B' : '#EF4444'
              const closeColor = agent.close >= 45 ? '#00E5A0' : agent.close >= 30 ? '#F59E0B' : '#EF4444'
              const tierColor = TIER_COLORS[agent.tier] || '#7A90A8'
              const tierLabel = TIER_LABELS[agent.tier] || agent.tier

              return (
                <tr key={agent.id}
                  onClick={() => window.location.href = `/dashboard/team/${agent.id}`}
                  style={{ cursor: 'pointer', borderBottom: '1px solid rgba(28,42,58,0.5)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${tierColor}22`, color: tierColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
                        {agent.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600' }}>{agent.full_name}</div>
                        <div style={{ fontSize: '10px', color: '#3D5068' }}>{agent.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: `${tierColor}22`, color: tierColor, border: `1px solid ${tierColor}44` }}>
                      {tierLabel}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '12px', color: '#00E5A0', fontWeight: '600' }}>{agent.ytd > 0 ? `$${(agent.ytd / 1000).toFixed(0)}K` : '—'}</div>
                    <div style={{ width: '80px', height: '3px', background: '#16202C', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: tierColor, borderRadius: '2px' }} />
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#60A5FA', fontWeight: '500' }}>{agent.month > 0 ? `$${(agent.month / 1000).toFixed(1)}K` : '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: agent.close > 0 ? closeColor : '#3D5068' }}>{agent.close > 0 ? `${agent.close}%` : '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#7A90A8' }}>{agent.sits > 0 ? agent.sits : '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#7A90A8' }}>{agent.refs > 0 ? agent.refs : '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: agent.streak > 0 ? '#00E5A0' : '#EF4444' }}>
                    {agent.streak > 0 ? `🔥 ${agent.streak}d` : '—'}
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
