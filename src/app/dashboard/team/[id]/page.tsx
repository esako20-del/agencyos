'use client'
import { useState } from 'react'

const AGENTS: Record<string, any> = {
  '1': { name: 'Jonis H.', role: 'Top Producer', tier: 'S Tier', color: '#F59E0B', initials: 'JH', start: 'Jan 2022', manager: 'Enri S.', leads: 'Union + Veteran', ytd: 182000, month: 13100, sits: 24, close: 58, refs: 9, dials: 52, streak: 22, health: 'green', monthly: [10200,12400,14800,16200,18100,19200,21000,22400,24100,26000,28200,13100], coaching: [] },
  '2': { name: 'Caitlyn R.', role: 'A Tier Producer', tier: 'A Tier', color: '#00E5A0', initials: 'CR', start: 'Jan 2022', manager: 'Enri S.', leads: 'Union + POS', ytd: 115000, month: 9800, sits: 21, close: 52, refs: 7, dials: 40, streak: 14, health: 'green', monthly: [6200,7400,8800,9200,9800,9400,9800,10200,10400,9800,9400,9800], coaching: [] },
  '3': { name: 'Luis K.', role: 'A Tier Producer', tier: 'A Tier', color: '#00E5A0', initials: 'LK', start: 'Jan 2022', manager: 'Enri S.', leads: 'Union', ytd: 102000, month: 8700, sits: 19, close: 49, refs: 6, dials: 38, streak: 11, health: 'green', monthly: [5800,6400,7200,8100,8400,8200,8700,9000,9200,8800,8400,8700], coaching: [] },
  '4': { name: 'Rachel N.', role: 'B Tier Producer', tier: 'B Tier', color: '#3B82F6', initials: 'RN', start: 'Jan 2022', manager: 'Enri S.', leads: 'Union', ytd: 82000, month: 7200, sits: 17, close: 46, refs: 5, dials: 35, streak: 9, health: 'green', monthly: [4800,5400,6200,6800,7000,6800,7200,7400,7600,7200,6800,7200], coaching: [] },
  '5': { name: 'Ardit M.', role: 'B Tier Producer', tier: 'B Tier', color: '#3B82F6', initials: 'AM', start: 'Jan 2023', manager: 'Enri S.', leads: 'Veteran', ytd: 74000, month: 6400, sits: 16, close: 44, refs: 4, dials: 33, streak: 8, health: 'green', monthly: [4200,4800,5400,6000,6400,6200,6400,6600,6800,6400,6200,6400], coaching: [] },
  '6': { name: 'Adrian B.', role: 'B Tier Producer', tier: 'B Tier', color: '#3B82F6', initials: 'AB', start: 'Jan 2023', manager: 'Enri S.', leads: 'Union', ytd: 61000, month: 5200, sits: 14, close: 41, refs: 4, dials: 30, streak: 6, health: 'yellow', monthly: [3600,4000,4600,5000,5200,5000,5200,5400,5600,5200,4800,5200], coaching: [] },
  '7': { name: 'Dayell F.', role: 'B Tier Producer', tier: 'B Tier', color: '#3B82F6', initials: 'DF', start: 'Jan 2023', manager: 'Enri S.', leads: 'New Pack', ytd: 54000, month: 4800, sits: 13, close: 39, refs: 3, dials: 28, streak: 5, health: 'yellow', monthly: [3200,3600,4000,4400,4600,4400,4800,5000,5200,4800,4400,4800], coaching: [] },
  '8': { name: 'Enkela M.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'EM', start: 'Jan 2023', manager: 'Enri S.', leads: 'Union', ytd: 44000, month: 3900, sits: 11, close: 36, refs: 3, dials: 26, streak: 4, health: 'yellow', monthly: [2600,3000,3400,3600,3800,3600,3900,4000,4200,3900,3600,3900], coaching: [] },
  '9': { name: 'Kelsey S.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'KS', start: 'Jan 2023', manager: 'Enri S.', leads: 'New Pack', ytd: 41000, month: 3600, sits: 10, close: 34, refs: 2, dials: 24, streak: 3, health: 'yellow', monthly: [2400,2800,3200,3400,3600,3400,3600,3800,4000,3600,3200,3600], coaching: [] },
  '10': { name: 'Edlira S.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'ES', start: 'Jan 2023', manager: 'Enri S.', leads: 'Union', ytd: 38000, month: 3200, sits: 9, close: 33, refs: 2, dials: 22, streak: 2, health: 'yellow', monthly: [2200,2600,3000,3200,3400,3200,3200,3400,3600,3200,2800,3200], coaching: [] },
  '11': { name: 'Matthew H.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'MH', start: 'Jan 2023', manager: 'Enri S.', leads: 'New Pack', ytd: 36000, month: 3100, sits: 8, close: 31, refs: 2, dials: 21, streak: 2, health: 'yellow', monthly: [2000,2400,2800,3000,3200,3000,3100,3200,3400,3100,2800,3100], coaching: [] },
  '12': { name: 'Drew C.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'DC', start: 'Jan 2023', manager: 'Enri S.', leads: 'New Pack', ytd: 35500, month: 3000, sits: 8, close: 30, refs: 1, dials: 20, streak: 1, health: 'yellow', monthly: [2000,2200,2600,2800,3000,2800,3000,3200,3400,3000,2800,3000], coaching: [] },
  '13': { name: 'Nadirah M.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'NM', start: 'Jan 2023', manager: 'Enri S.', leads: 'New Pack', ytd: 35000, month: 2900, sits: 7, close: 29, refs: 1, dials: 19, streak: 1, health: 'yellow', monthly: [1800,2200,2600,2800,3000,2800,2900,3000,3200,2900,2600,2900], coaching: [] },
  '14': { name: 'Tiffany S.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'TS', start: 'Jan 2023', manager: 'Enri S.', leads: 'New Pack', ytd: 35000, month: 2800, sits: 7, close: 28, refs: 1, dials: 18, streak: 1, health: 'yellow', monthly: [1800,2000,2400,2600,2800,2600,2800,3000,3200,2800,2600,2800], coaching: [] },
  '15': { name: 'Jorge R.', role: 'In Training', tier: 'T Tier', color: '#F97316', initials: 'JR', start: 'Jan 2024', manager: 'Enri S.', leads: 'New Pack', ytd: 0, month: 0, sits: 0, close: 0, refs: 0, dials: 0, streak: 0, health: 'yellow', monthly: [0,0,0,0,0,0,0,0,0,0,0,0], coaching: [] },
  '16': { name: 'Alyssa H.', role: 'In Training', tier: 'T Tier', color: '#F97316', initials: 'AH', start: 'Jan 2024', manager: 'Enri S.', leads: 'New Pack', ytd: 0, month: 0, sits: 0, close: 0, refs: 0, dials: 0, streak: 0, health: 'yellow', monthly: [0,0,0,0,0,0,0,0,0,0,0,0], coaching: [] },
  '17': { name: 'Llambi T.', role: 'Inactive', tier: 'I Tier', color: '#EF4444', initials: 'LT', start: 'Jan 2023', manager: 'Enri S.', leads: 'N/A', ytd: 0, month: 0, sits: 0, close: 0, refs: 0, dials: 0, streak: 0, health: 'red', monthly: [0,0,0,0,0,0,0,0,0,0,0,0], coaching: [] },
  '18': { name: 'Endi A.', role: 'Inactive', tier: 'I Tier', color: '#EF4444', initials: 'EA', start: 'Jan 2023', manager: 'Enri S.', leads: 'N/A', ytd: 0, month: 0, sits: 0, close: 0, refs: 0, dials: 0, streak: 0, health: 'red', monthly: [0,0,0,0,0,0,0,0,0,0,0,0], coaching: [] },
  '19': { name: 'Klaudiana V.', role: 'Inactive', tier: 'I Tier', color: '#EF4444', initials: 'KV', start: 'Jan 2023', manager: 'Enri S.', leads: 'N/A', ytd: 0, month: 0, sits: 0, close: 0, refs: 0, dials: 0, streak: 0, health: 'red', monthly: [0,0,0,0,0,0,0,0,0,0,0,0], coaching: [] },
  '20': { name: 'Enri S.', role: 'Agency Owner · A Tier', tier: 'A Tier', color: '#00E5A0', initials: 'ES', start: 'Jan 2020', manager: 'AO Globe Life', leads: 'Union + Veteran', ytd: 74000, month: 14800, sits: 24, close: 48, refs: 6, dials: 38, streak: 18, health: 'green', monthly: [9800,10200,12400,11800,13600,14200,14800,0,0,0,0,0], coaching: [] },
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

      <a href="/dashboard/team" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#7A90A8', textDecoration: 'none', fontSize: '12px', marginBottom: '16px' }}>
        ← Back to Team
      </a>

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
            <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: `${agent.color}22`, color: agent.color, border: `1px solid ${agent.color}44` }}>
              {agent.tier}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: healthColor, boxShadow: `0 0 5px ${healthColor}` }} />
              <span style={{ fontSize: '11px', color: healthColor }}>{agent.health === 'green' ? 'Healthy' : agent.health === 'yellow' ? 'Watch' : 'Needs Help'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#1C2A3A' }}>
          {[
            { label: 'YTD ALP', value: agent.ytd > 0 ? `$${(agent.ytd/1000).toFixed(0)}K` : '—', color: '#00E5A0' },
            { label: 'This Month', value: agent.month > 0 ? `$${(agent.month/1000).toFixed(1)}K` : '—', color: '#60A5FA' },
            { label: 'Close Rate', value: agent.close > 0 ? `${agent.close}%` : '—', color: agent.close >= 45 ? '#00E5A0' : agent.close >= 30 ? '#F59E0B' : '#EF4444' },
            { label: 'Day Streak', value: agent.streak > 0 ? `🔥 ${agent.streak}d` : '—', color: agent.streak > 0 ? '#00E5A0' : '#EF4444' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0C1018', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

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

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Agent Info</div>
            {[
              { label: 'Manager', value: agent.manager },
              { label: 'Lead Types', value: agent.leads },
              { label: 'Start Date', value: agent.start },
              { label: 'Avg Daily Dials', value: agent.dials || '—' },
              { label: 'Avg Daily Sits', value: agent.sits || '—' },
              { label: 'Referrals / Sale', value: agent.refs || '—' },
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

      {activeTab === 'activity' && (
        <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Performance Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Avg Daily Dials', value: agent.dials > 0 ? String(agent.dials) : '—', color: '#60A5FA' },
              { label: 'Avg Daily Sits', value: agent.sits > 0 ? String(agent.sits) : '—', color: '#00E5A0' },
              { label: 'Close Rate', value: agent.close > 0 ? `${agent.close}%` : '—', color: agent.close >= 45 ? '#00E5A0' : '#F59E0B' },
              { label: 'Refs / Sale', value: agent.refs > 0 ? String(agent.refs) : '—', color: '#A78BFA' },
              { label: 'YTD ALP', value: agent.ytd > 0 ? `$${(agent.ytd/1000).toFixed(0)}K` : '—', color: '#00E5A0' },
              { label: 'Month ALP', value: agent.month > 0 ? `$${(agent.month/1000).toFixed(1)}K` : '—', color: '#60A5FA' },
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
