'use client'
import { useState } from 'react'

const AGENTS: Record<string, any> = {
  '1': { name: 'Marcus W.', role: 'Top Producer', tier: 'Consistent', color: '#F59E0B', initials: 'MW', start: 'Jan 2022', manager: 'Owner', leads: 'Union + Veteran', ytd: 182000, month: 13100, sits: 24, close: 58, refs: 9, dials: 52, streak: 22, health: 'green', monthly: [10200,12400,14800,16200,18100,19200,21000,22400,24100,26000,28200,13100], coaching: ['March 15 — Reviewed referral scripting. Action: implement 3-ref ask after every close.','Jan 10 — Goal setting session for 2026. Target: $250K.'] },
  '2': { name: 'DeShawn T.', role: 'Consistent', tier: 'Consistent', color: '#3B82F6', initials: 'DT', start: 'Jun 2022', manager: 'Owner', leads: 'Union + POS', ytd: 72000, month: 8400, sits: 19, close: 47, refs: 6, dials: 38, streak: 14, health: 'green', monthly: [4200,5100,6800,7200,8400,7900,8100,8800,9200,8100,7400,8400], coaching: ['April 2 — Discussed POS lead strategy. Action: prioritize POS over union this month.'] },
  '3': { name: 'Priya S.', role: 'Consistent', tier: 'Consistent', color: '#A78BFA', initials: 'PS', start: 'Sep 2022', manager: 'Owner', leads: 'Union', ytd: 52000, month: 6500, sits: 17, close: 44, refs: 5, dials: 35, streak: 11, health: 'green', monthly: [3100,3800,4200,4900,5100,5400,5800,6100,6400,6200,5900,6500], coaching: ['March 20 — Worked on objection handling. Strong improvement noted.'] },
  '4': { name: 'Jordan R.', role: 'New Consistent', tier: 'Consistent', color: '#00E5A0', initials: 'JR', start: 'Mar 2023', manager: 'Owner', leads: 'Veteran', ytd: 42000, month: 10200, sits: 21, close: 52, refs: 7, dials: 40, streak: 9, health: 'green', monthly: [2100,3400,4800,6200,7800,8900,9400,10200,0,0,0,0], coaching: ['April 10 — Ready for tier promotion. Recommend unlocking Union leads.'] },
  '5': { name: 'Keisha M.', role: 'Developing', tier: 'Training', color: '#F59E0B', initials: 'KM', start: 'Jan 2024', manager: 'Manager 1', leads: 'New Pack', ytd: 18000, month: 3600, sits: 11, close: 36, refs: 3, dials: 30, streak: 5, health: 'yellow', monthly: [800,1200,1800,2400,2800,3100,3600,0,0,0,0,0], coaching: ['April 5 — Needs to improve sit rate. Goal: 3 sits/day minimum.'] },
  '6': { name: 'Tyler B.', role: 'In Training', tier: 'Training', color: '#EF4444', initials: 'TB', start: 'Feb 2024', manager: 'Manager 1', leads: 'New Pack', ytd: 7200, month: 1400, sits: 6, close: 25, refs: 1, dials: 28, streak: 0, health: 'red', monthly: [400,800,1100,1400,1800,1700,1400,0,0,0,0,0], coaching: ['May 1 — URGENT: 0 sales in 9 days. Schedule immediate 1:1.','April 15 — Struggling with objections. Assigned role play sessions 3x/week.'] },
  '7': { name: 'Aisha N.', role: 'In Training', tier: 'Training', color: '#F59E0B', initials: 'AN', start: 'Feb 2024', manager: 'Manager 2', leads: 'New Pack', ytd: 5100, month: 900, sits: 4, close: 22, refs: 1, dials: 32, streak: 2, health: 'yellow', monthly: [200,600,900,1100,1400,900,900,0,0,0,0,0], coaching: ['April 20 — Good attitude, needs more dials. Target: 40/day.'] },
  '8': { name: 'Carlos V.', role: 'In Training', tier: 'Training', color: '#EF4444', initials: 'CV', start: 'Mar 2024', manager: 'Manager 2', leads: 'New Pack', ytd: 3200, month: 600, sits: 3, close: 20, refs: 0, dials: 22, streak: 0, health: 'red', monthly: [400,800,1100,900,600,600,0,0,0,0,0,0], coaching: ['May 1 — Behind schedule. Week 3 training not completed. Intervention needed.'] },
  '9': { name: 'Destiny H.', role: 'Part Time', tier: 'Part Time', color: '#60A5FA', initials: 'DH', start: 'Jun 2023', manager: 'Owner', leads: 'Union', ytd: 9800, month: 1800, sits: 7, close: 30, refs: 2, dials: 20, streak: 4, health: 'yellow', monthly: [600,800,1000,1200,1400,1600,1800,0,0,0,0,0], coaching: [] },
  '10': { name: 'Omar F.', role: 'Part Time', tier: 'Part Time', color: '#60A5FA', initials: 'OF', start: 'Aug 2023', manager: 'Owner', leads: 'Veteran', ytd: 6400, month: 1100, sits: 5, close: 28, refs: 1, dials: 18, streak: 3, health: 'yellow', monthly: [400,600,800,900,1000,1100,1100,0,0,0,0,0], coaching: [] },
  '11': { name: 'Grace L.', role: 'Part Time', tier: 'Part Time', color: '#60A5FA', initials: 'GL', start: 'Oct 2023', manager: 'Owner', leads: 'Union', ytd: 4200, month: 800, sits: 4, close: 25, refs: 1, dials: 16, streak: 2, health: 'yellow', monthly: [200,400,600,700,800,800,800,0,0,0,0,0], coaching: [] },
  '12': { name: 'Brandon K.', role: 'Just Released', tier: 'New', color: '#3B82F6', initials: 'BK', start: 'Apr 2024', manager: 'Manager 1', leads: 'New Pack', ytd: 2100, month: 2100, sits: 5, close: 30, refs: 1, dials: 25, streak: 1, health: 'yellow', monthly: [0,0,0,2100,0,0,0,0,0,0,0,0], coaching: ['April 28 — First week released. Good energy. Monitor closely.'] },
  '13': { name: 'Tamara J.', role: 'Just Released', tier: 'New', color: '#A78BFA', initials: 'TJ', start: 'Apr 2024', manager: 'Manager 2', leads: 'New Pack', ytd: 1800, month: 1800, sits: 4, close: 28, refs: 0, dials: 22, streak: 1, health: 'yellow', monthly: [0,0,0,1800,0,0,0,0,0,0,0,0], coaching: ['April 28 — Released. Needs referral scripting coaching in week 2.'] },
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AgentProfilePage({ params }: { params: { id: string } }) {
  const agent = AGENTS[params.id]
  const [activeTab, setActiveTab] = useState('overview')

  if (!agent) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#7A90A8', fontFamily: 'system-ui' }}>
      Agent not found. <a href="/dashboard/team" style={{ color: '#00E5A0' }}>Back to Team</a>
    </div>
  )

  const healthColor = agent.health === 'green' ? '#00E5A0' : agent.health === 'yellow' ? '#F59E0B' : '#EF4444'
  const maxMonthly = Math.max(...agent.monthly.filter((v: number) => v > 0), 1)

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#ECF0F5' }}>

      {/* Back */}
      <a href="/dashboard/team" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#7A90A8', textDecoration: 'none', fontSize: '12px', marginBottom: '16px' }}>
        ← Back to Team
      </a>

      {/* Hero card */}
      <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #1C2A3A' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: `${agent.color}22`, color: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>
            {agent.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{agent.name}</div>
            <div style={{ fontSize: '12px', color: '#7A90A8', marginTop: '2px' }}>{agent.role} · Started {agent.start}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: `${agent.color}22`, color: agent.color, border: `1px solid ${agent.color}44` }}>
              {agent.tier}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: healthColor, boxShadow: `0 0 5px ${healthColor}` }} />
              <span style={{ fontSize: '11px', color: healthColor }}>{agent.health === 'green' ? 'Healthy' : agent.health === 'yellow' ? 'Watch' : 'Needs Help'}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#1C2A3A' }}>
          {[
            { label: 'YTD ALP', value: `$${(agent.ytd/1000).toFixed(0)}K`, color: '#00E5A0' },
            { label: 'This Month', value: `$${(agent.month/1000).toFixed(1)}K`, color: '#60A5FA' },
            { label: 'Close Rate', value: `${agent.close}%`, color: agent.close >= 45 ? '#00E5A0' : agent.close >= 30 ? '#F59E0B' : '#EF4444' },
            { label: 'Day Streak', value: agent.streak > 0 ? `🔥 ${agent.streak}d` : '—', color: agent.streak > 0 ? '#00E5A0' : '#EF4444' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0C1018', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', background: '#111820', border: '1px solid #1C2A3A', borderRadius: '8px', padding: '3px', width: 'fit-content', marginBottom: '16px' }}>
        {['overview', 'activity', 'coaching'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '6px 14px', borderRadius: '5px', fontSize: '11px', fontWeight: '600',
            cursor: 'pointer', border: 'none', textTransform: 'capitalize',
            background: activeTab === tab ? '#0C1018' : 'transparent',
            color: activeTab === tab ? '#ECF0F5' : '#7A90A8',
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Agent Info</div>
            {[
              { label: 'Manager', value: agent.manager },
              { label: 'Lead Types', value: agent.leads },
              { label: 'Start Date', value: agent.start },
              { label: 'Avg Daily Dials', value: agent.dials },
              { label: 'Avg Daily Sits', value: agent.sits },
              { label: 'Referrals / Sale', value: agent.refs },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(28,42,58,0.5)', fontSize: '12px' }}>
                <span style={{ color: '#7A90A8' }}>{row.label}</span>
                <span style={{ color: '#ECF0F5', fontWeight: '500' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Monthly ALP History</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
              {agent.monthly.map((v: number, i: number) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <div style={{
                    width: '100%', borderRadius: '2px 2px 0 0',
                    height: v > 0 ? `${Math.round((v / maxMonthly) * 80) + 8}px` : '4px',
                    background: i === new Date().getMonth() ? agent.color : `${agent.color}44`,
                    minHeight: '4px',
                  }} />
                  <div style={{ fontSize: '8px', color: '#3D5068' }}>{MONTHS[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Performance Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Avg Daily Dials', value: String(agent.dials), color: '#60A5FA' },
              { label: 'Avg Daily Sits', value: String(agent.sits), color: '#00E5A0' },
              { label: 'Close Rate', value: `${agent.close}%`, color: agent.close >= 45 ? '#00E5A0' : '#F59E0B' },
              { label: 'Refs / Sale', value: String(agent.refs), color: '#A78BFA' },
              { label: 'YTD ALP', value: `$${(agent.ytd/1000).toFixed(0)}K`, color: '#00E5A0' },
              { label: 'Month ALP', value: `$${(agent.month/1000).toFixed(1)}K`, color: '#60A5FA' },
            ].map(s => (
              <div key={s.label} style={{ background: '#111820', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#111820', borderRadius: '8px', padding: '12px', textAlign: 'center', color: '#3D5068', fontSize: '12px' }}>
            Daily report history will appear here once agents start submitting reports.
          </div>
        </div>
      )}

      {/* Coaching Tab */}
      {activeTab === 'coaching' && (
        <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Coaching History</div>
          {agent.coaching.length > 0 ? agent.coaching.map((note: string, i: number) => (
            <div key={i} style={{ padding: '12px', background: '#111820', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', color: '#7A90A8', lineHeight: '1.6' }}>
              {note}
            </div>
          )) : (
            <div style={{ textAlign: 'center', color: '#3D5068', fontSize: '12px', padding: '20px' }}>No coaching sessions recorded yet.</div>
          )}
          <div style={{ marginTop: '12px', padding: '12px', background: '#111820', borderRadius: '8px', border: '1px solid #1C2A3A' }}>
            <div style={{ fontSize: '10px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Add Coaching Note</div>
            <textarea rows={3} placeholder="Enter coaching notes, action items, follow-ups..." style={{ width: '100%', background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '6px', padding: '8px', color: '#ECF0F5', fontSize: '12px', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            <button style={{ marginTop: '8px', background: '#00E5A0', color: '#000', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
              Save Note
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
