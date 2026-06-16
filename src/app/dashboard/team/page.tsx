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
  s_tier: 'S',
  a_tier: 'A',
  b_tier: 'B',
  c_tier: 'C',
  t_tier: 'T',
  i_tier: 'I',
}

const AGENT_IDS: Record<string, string> = {
  'Jonis H.': '1', 'Caitlyn R.': '2', 'Luis K.': '3',
  'Ardit M.': '5', 'Adrian B.': '6', 'Dayell F.': '7',
  'Kelsey S.': '9', 'Edlira S.': '10', 'Matthew H.': '11', 'Drew C.': '12',
  'Nadirah M.': '13', 'Tiffany S.': '14', 'Jorge R.': '15', 'Alyssa H.': '16',
  'Llambi T.': '17', 'Endi A.': '18', 'Enri S.': '20', 'Bruno N.': '21',
}

const RANK_COLORS = ['#F59E0B', '#94A3B8', '#B45309']

type SortKey = 'ytd' | 'month' | 'week'

function fmt(val: number) {
  if (val === 0) return '—'
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val}`
}

export default function TeamPage() {
  const [agents, setAgents]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [sortKey, setSortKey]   = useState<SortKey>('ytd')
  const [showAdd, setShowAdd]   = useState(false)
  const [newAgent, setNewAgent] = useState({ full_name: '', tier: 'c_tier' })
  const [adding, setAdding]     = useState(false)
  const [addMsg, setAddMsg]     = useState('')

  useEffect(() => { loadAgents() }, [])

  async function loadAgents() {
    setLoading(true)
    try {
      const res = await fetch('/api/agentscoreboard')
      const { data } = await res.json()
      if (data) setAgents(data)
    } catch (e) {}
    setLoading(false)
  }

  // Sort agents by selected key
  const sorted = [...agents].sort((a, b) => {
    if (sortKey === 'ytd')   return b.ytdAlp   - a.ytdAlp
    if (sortKey === 'month') return b.monthAlp - a.monthAlp
    if (sortKey === 'week')  return b.weekAlp  - a.weekAlp
    return 0
  })

  const topValue = sorted[0]?.[sortKey === 'ytd' ? 'ytdAlp' : sortKey === 'month' ? 'monthAlp' : 'weekAlp'] || 1

  async function handleAddAgent() {
    if (!newAgent.full_name.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name:   newAgent.full_name.trim(),
          tier:        newAgent.tier,
          is_active:   true,
          monthly_alp: [0,0,0,0,0,0,0,0,0,0,0,0],
          health_status: 'yellow',
        }),
      })
      const { error } = await res.json()
      if (error) throw new Error(error)
      setAddMsg('✓ Agent added!')
      setNewAgent({ full_name: '', tier: 'c_tier' })
      setShowAdd(false)
      setTimeout(() => setAddMsg(''), 3000)
      loadAgents()
    } catch (e: any) {
      setAddMsg('Error: ' + e.message)
    }
    setAdding(false)
  }

  const inputStyle = {
    background: '#07090D', border: '1px solid #1C2A3A', borderRadius: '6px',
    padding: '7px 10px', color: '#ECF0F5', fontSize: '12px', outline: 'none',
    width: '100%', boxSizing: 'border-box' as const,
  }

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#7A90A8', fontFamily: 'system-ui' }}>
      Loading scoreboard...
    </div>
  )

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#ECF0F5' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>Team Scoreboard</div>
          <div style={{ fontSize: '12px', color: '#7A90A8', marginTop: '2px' }}>{agents.length} agents · Ranked by ALP production</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {addMsg && (
            <span style={{ fontSize: '12px', color: addMsg.startsWith('Error') ? '#EF4444' : '#00E5A0' }}>{addMsg}</span>
          )}
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
          >
            + Add Agent
          </button>
        </div>
      </div>

      {/* Add Agent Form */}
      {showAdd && (
        <div style={{ background: '#0C1018', border: '1px solid #00E5A044', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#00E5A0', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', fontWeight: '700' }}>
            New Agent
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Full Name</div>
              <input
                style={inputStyle}
                placeholder="First Last"
                value={newAgent.full_name}
                onChange={e => setNewAgent(n => ({ ...n, full_name: e.target.value }))}
              />
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Tier</div>
              <select
                style={inputStyle}
                value={newAgent.tier}
                onChange={e => setNewAgent(n => ({ ...n, tier: e.target.value }))}
              >
                <option value="s_tier">S Tier</option>
                <option value="a_tier">A Tier</option>
                <option value="b_tier">B Tier</option>
                <option value="c_tier">C Tier</option>
                <option value="t_tier">T Tier (Training)</option>
                <option value="i_tier">I Tier (Inactive)</option>
              </select>
            </div>
            <button
              onClick={handleAddAgent}
              disabled={adding}
              style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {adding ? 'Adding...' : 'Save Agent'}
            </button>
          </div>
        </div>
      )}

      {/* Sort Toggle */}
      <div style={{ display: 'flex', gap: '2px', background: '#111820', border: '1px solid #1C2A3A', padding: '3px', borderRadius: '8px', width: 'fit-content', marginBottom: '16px' }}>
        {([
          { key: 'ytd',   label: 'YTD Ranking' },
          { key: 'month', label: 'This Month' },
          { key: 'week',  label: 'This Week' },
        ] as { key: SortKey; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setSortKey(t.key)} style={{
            padding: '6px 14px', borderRadius: '5px', fontSize: '11px', fontWeight: '600',
            cursor: 'pointer', border: 'none',
            background: sortKey === t.key ? '#0C1018' : 'transparent',
            color: sortKey === t.key ? '#ECF0F5' : '#7A90A8',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Scoreboard Table */}
      <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 100px 100px 100px 100px 80px', gap: '0', padding: '10px 16px', background: '#111820', borderBottom: '1px solid #1C2A3A' }}>
          {['#', 'Agent', 'YTD ALP', 'Month ALP', 'Week ALP', 'Ref YTD', 'Ref Month', 'Ref Week', 'Close %'].map(h => (
            <div key={h} style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {sorted.map((agent, i) => {
          const tierColor  = TIER_COLORS[agent.tier] || '#7A90A8'
          const tierLabel  = TIER_LABELS[agent.tier] || '?'
          const rankColor  = i < 3 ? RANK_COLORS[i] : '#3D5068'
          const agentId    = AGENT_IDS[agent.full_name] || '1'
          const initials   = agent.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
          const sortValue  = sortKey === 'ytd' ? agent.ytdAlp : sortKey === 'month' ? agent.monthAlp : agent.weekAlp
          const barPct     = Math.round((sortValue / topValue) * 100)
          const closeColor = agent.closeRatio >= 45 ? '#00E5A0' : agent.closeRatio >= 30 ? '#F59E0B' : agent.closeRatio > 0 ? '#EF4444' : '#3D5068'

          return (
            <div
              key={agent.id}
              onClick={() => window.location.href = `/dashboard/team/${agentId}`}
              style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 100px 100px 100px 100px 80px', gap: '0', padding: '12px 16px', borderBottom: '1px solid rgba(28,42,58,0.5)', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Rank */}
              <div style={{ fontSize: '14px', fontWeight: '700', color: rankColor, display: 'flex', alignItems: 'center' }}>
                {i + 1}
              </div>

              {/* Agent Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${tierColor}22`, color: tierColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {agent.full_name}
                    {!agent.is_active && (
                      <span style={{ fontSize: '9px', color: '#3D5068', background: '#1C2A3A', padding: '1px 6px', borderRadius: '4px' }}>Inactive</span>
                    )}
                    <span style={{ fontSize: '9px', fontWeight: '700', color: tierColor, background: `${tierColor}22`, padding: '1px 6px', borderRadius: '4px', border: `1px solid ${tierColor}33` }}>
                      {tierLabel}
                    </span>
                  </div>
                  {/* Progress bar based on sort key */}
                  <div style={{ width: '100px', height: '3px', background: '#16202C', borderRadius: '2px', marginTop: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${barPct}%`, height: '100%', background: tierColor, borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              </div>

              {/* YTD ALP */}
              <div style={{ fontSize: '13px', fontWeight: '600', color: sortKey === 'ytd' ? '#00E5A0' : '#ECF0F5', display: 'flex', alignItems: 'center' }}>
                {fmt(agent.ytdAlp)}
              </div>

              {/* Month ALP */}
              <div style={{ fontSize: '13px', color: sortKey === 'month' ? '#60A5FA' : '#7A90A8', display: 'flex', alignItems: 'center' }}>
                {fmt(agent.monthAlp)}
              </div>

              {/* Week ALP */}
              <div style={{ fontSize: '13px', color: sortKey === 'week' ? '#A78BFA' : '#7A90A8', display: 'flex', alignItems: 'center' }}>
                {fmt(agent.weekAlp)}
              </div>

              {/* Ref YTD */}
              <div style={{ fontSize: '12px', color: '#7A90A8', display: 'flex', alignItems: 'center' }}>
                {fmt(agent.ytdRefAlp)}
              </div>

              {/* Ref Month */}
              <div style={{ fontSize: '12px', color: '#7A90A8', display: 'flex', alignItems: 'center' }}>
                {fmt(agent.monthRefAlp)}
              </div>

              {/* Ref Week */}
              <div style={{ fontSize: '12px', color: '#7A90A8', display: 'flex', alignItems: 'center' }}>
                {fmt(agent.weekRefAlp)}
              </div>

              {/* Close % */}
              <div style={{ fontSize: '13px', fontWeight: '600', color: closeColor, display: 'flex', alignItems: 'center' }}>
                {agent.closeRatio > 0 ? `${agent.closeRatio}%` : '—'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
