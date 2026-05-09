'use client'
import { useState } from 'react'

const AGENTS = [
  { id: '1', full_name: 'Marcus W.', role: 'Top Producer', tier: 'consistent', ytd: 182000, month: 13100, sits: 24, close: 58, refs: 9, leads: 'Union+Vet', streak: 22, health: 'green', initials: 'MW', color: '#F59E0B' },
  { id: '2', full_name: 'DeShawn T.', role: 'Consistent', tier: 'consistent', ytd: 72000, month: 8400, sits: 19, close: 47, refs: 6, leads: 'Union+POS', streak: 14, health: 'green', initials: 'DT', color: '#3B82F6' },
  { id: '3', full_name: 'Priya S.', role: 'Consistent', tier: 'consistent', ytd: 52000, month: 6500, sits: 17, close: 44, refs: 5, leads: 'Union', streak: 11, health: 'green', initials: 'PS', color: '#A78BFA' },
  { id: '4', full_name: 'Jordan R.', role: 'New Consistent', tier: 'consistent', ytd: 42000, month: 10200, sits: 21, close: 52, refs: 7, leads: 'Veteran', streak: 9, health: 'green', initials: 'JR', color: '#00E5A0' },
  { id: '5', full_name: 'Keisha M.', role: 'Developing', tier: 'training', ytd: 18000, month: 3600, sits: 11, close: 36, refs: 3, leads: 'New Pack', streak: 5, health: 'yellow', initials: 'KM', color: '#F59E0B' },
  { id: '6', full_name: 'Tyler B.', role: 'In Training', tier: 'training', ytd: 7200, month: 1400, sits: 6, close: 25, refs: 1, leads: 'New Pack', streak: 0, health: 'red', initials: 'TB', color: '#EF4444' },
  { id: '7', full_name: 'Aisha N.', role: 'In Training', tier: 'training', ytd: 5100, month: 900, sits: 4, close: 22, refs: 1, leads: 'New Pack', streak: 2, health: 'yellow', initials: 'AN', color: '#F59E0B' },
  { id: '8', full_name: 'Carlos V.', role: 'In Training', tier: 'training', ytd: 3200, month: 600, sits: 3, close: 20, refs: 0, leads: 'New Pack', streak: 0, health: 'red', initials: 'CV', color: '#EF4444' },
  { id: '9', full_name: 'Destiny H.', role: 'Part Time', tier: 'parttime', ytd: 9800, month: 1800, sits: 7, close: 30, refs: 2, leads: 'Union', streak: 4, health: 'yellow', initials: 'DH', color: '#60A5FA' },
  { id: '10', full_name: 'Omar F.', role: 'Part Time', tier: 'parttime', ytd: 6400, month: 1100, sits: 5, close: 28, refs: 1, leads: 'Veteran', streak: 3, health: 'yellow', initials: 'OF', color: '#60A5FA' },
  { id: '11', full_name: 'Grace L.', role: 'Part Time', tier: 'parttime', ytd: 4200, month: 800, sits: 4, close: 25, refs: 1, leads: 'Union', streak: 2, health: 'yellow', initials: 'GL', color: '#60A5FA' },
  { id: '12', full_name: 'Brandon K.', role: 'Just Released', tier: 'new', ytd: 2100, month: 2100, sits: 5, close: 30, refs: 1, leads: 'New Pack', streak: 1, health: 'yellow', initials: 'BK', color: '#3B82F6' },
  { id: '13', full_name: 'Tamara J.', role: 'Just Released', tier: 'new', ytd: 1800, month: 1800, sits: 4, close: 28, refs: 0, leads: 'New Pack', streak: 1, health: 'yellow', initials: 'TJ', color: '#A78BFA' },
]

const TABS = [
  { label: 'All (13)', value: 'all' },
  { label: 'Consistent (4)', value: 'consistent' },
  { label: 'Training (4)', value: 'training' },
  { label: 'Part Time (3)', value: 'parttime' },
  { label: 'New (2)', value: 'new' },
]

export default function TeamPage() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? AGENTS : AGENTS.filter(a => a.tier === filter)
  const topYtd = AGENTS[0].ytd

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#ECF0F5' }}>

      {/* Filter tabs + Add button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '2px', background: '#111820', border: '1px solid #1C2A3A', padding: '3px', borderRadius: '8px' }}>
          {TABS.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)} style={{
              padding: '6px 12px', borderRadius: '5px', fontSize: '11px', fontWeight: '600',
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
              const tierColors: Record<string, string> = {
                consistent: '#60A5FA', training: '#F59E0B', parttime: '#7A90A8', new: '#A78BFA'
              }
              const tierLabels: Record<string, string> = {
                consistent: 'Consistent', training: 'Training', parttime: 'Part Time', new: 'New'
              }

              return (
                <tr key={agent.id}
                  onClick={() => window.location.href = `/dashboard/team/${agent.id}`}
                  style={{ cursor: 'pointer', borderBottom: '1px solid rgba(28,42,58,0.5)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${agent.color}22`, color: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
                        {agent.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600' }}>{agent.full_name}</div>
                        <div style={{ fontSize: '10px', color: '#3D5068' }}>{agent.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: '4px', fontSize: '9px', fontWeight: '700', background: `${tierColors[agent.tier]}22`, color: tierColors[agent.tier], border: `1px solid ${tierColors[agent.tier]}44` }}>
                      {tierLabels[agent.tier]}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '12px', color: '#00E5A0', fontWeight: '600' }}>${(agent.ytd / 1000).toFixed(0)}K</div>
                    <div style={{ width: '80px', height: '3px', background: '#16202C', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#00E5A0', borderRadius: '2px' }} />
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#60A5FA', fontWeight: '500' }}>${(agent.month / 1000).toFixed(1)}K</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: closeColor, fontWeight: '500' }}>{agent.close}%</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#7A90A8' }}>{agent.sits}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#7A90A8' }}>{agent.refs}</td>
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
