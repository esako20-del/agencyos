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
  s_tier: 'S', a_tier: 'A', b_tier: 'B', c_tier: 'C', t_tier: 'T', i_tier: 'I',
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
  const [agents, setAgents]         = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [sortKey, setSortKey]       = useState<SortKey>('ytd')
  const [showAdd, setShowAdd]       = useState(false)
  const [newAgent, setNewAgent]     = useState({ full_name: '', tier: 'c_tier' })
  const [adding, setAdding]         = useState(false)
  const [addMsg, setAddMsg]         = useState('')
  const [confirmAction, setConfirmAction] = useState<{ type: 'deactivate' | 'delete'; agent: any } | null>(null)
  const [actionMsg, setActionMsg]   = useState('')

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
          full_name:     newAgent.full_name.trim(),
          tier:          newAgent.tier,
          is_active:     true,
          monthly_alp:   [0,0,0,0,0,0,0,0,0,0,0,0],
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

  async function handleDeactivate(agent: any) {
    try {
      const res = await fetch('/api/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agent.id, is_active: false }),
      })
      const { error } = await res.json()
      if (error) throw new Error(error)
      setActionMsg(`✓ ${agent.full_name} deactivated`)
      setTimeout(() => setActionMsg(''), 3000)
      setConfirmAction(null)
      loadAgents()
    } catch (e: any) {
      setActionMsg('Error: ' + e.message)
    }
  }

  async function handleDelete(agent: any) {
    try {
      const res = await fetch(`/api/agents?id=${agent.id}`, { method: 'DELETE' })
      const { error } = await res.json()
      if (error) throw new Error(error)
      setActionMsg(`✓ ${agent.full_name} deleted`)
      setTimeout(() => setActionMsg(''), 3000)
      setConfirmAction(null)
      loadAgents()
    } catch (e: any) {
      setActionMsg('Error: ' + e.message)
    }
  }

  async function handleReactivate(agent: any) {
    try {
      await fetch('/api/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agent.id, is_active: true }),
      })
      setActionMsg(`✓ ${agent.full_name} reactivated`)
      setTimeout(() => setActionMsg(''), 3000)
      loadAgents()
    } catch (e: any) {
      setActionMsg('Error: ' + e.message)
    }
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

      {/* Confirm Modal */}
      {confirmAction && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
              {confirmAction.type === 'deactivate' ? '⚠️ Deactivate Agent' : '🗑️ Delete Agent'}
            </div>
            <div style={{ fontSize: '12px', color: '#7A90A8', marginBottom: '16px', lineHeight: '1.6' }}>
              {confirmAction.type === 'deactivate'
                ? `Deactivating ${confirmAction.agent.full_name} will hide them from the scoreboard but keep their ALP in team totals. You can reactivate them later.`
                : `Permanently deleting ${confirmAction.agent.full_name} will remove them and all their data. This cannot be undone.`
              }
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => confirmAction.type === 'deactivate' ? handleDeactivate(confirmAction.agent) : handleDelete(confirmAction.agent)}
                style={{ background: confirmAction.type === 'deactivate' ? '#F59E0B' : '#EF4444', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                {confirmAction.type === 'deactivate' ? 'Yes, Deactivate' : 'Yes, Delete Permanently'}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                style={{ background: 'transparent', border: '1px solid #1C2A3A', color: '#7A90A8', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>Team Scoreboard</div>
          <div style={{ fontSize: '12px', color: '#7A90A8', marginTop: '2px' }}>{agents.filter(a => a.is_active).length} active · {agents.filter(a => !a.is_active).length} inactive</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(addMsg || actionMsg) && (
            <span style={{ fontSize: '12px', color: (addMsg || actionMsg).startsWith('Error') ? '#EF4444' : '#00E5A0' }}>{addMsg || actionMsg}</span>
          )}
          <button onClick={() => setShowAdd(!showAdd)}
            style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
            + Add Agent
          </button>
        </div>
      </div>

      {/* Add Agent Form */}
      {showAdd && (
        <div style={{ background: '#0C1018', border: '1px solid #00E5A044', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#00E5A0', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', fontWeight: '700' }}>New Agent</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Full Name</div>
              <input style={inputStyle} placeholder="First Last" value={newAgent.full_name} onChange={e => setNewAgent(n => ({ ...n, full_name: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Tier</div>
              <select style={inputStyle} value={newAgent.tier} onChange={e => setNewAgent(n => ({ ...n, tier: e.target.value }))}>
                <option value="s_tier">S Tier</option>
                <option value="a_tier">A Tier</option>
                <option value="b_tier">B Tier</option>
                <option value="c_tier">C Tier</option>
                <option value="t_tier">T Tier (Training)</option>
                <option value="i_tier">I Tier (Inactive)</option>
              </select>
            </div>
            <button onClick={handleAddAgent} disabled={adding}
              style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {adding ? 'Adding...' : 'Save Agent'}
            </button>
          </div>
        </div>
      )}

      {/* Sort Toggle */}
      <div style={{ display: 'flex', gap: '2px', background: '#111820', border: '1px solid #1C2A3A', padding: '3px', borderRadius: '8px', width: 'fit-content', marginBottom: '16px' }}>
        {([
          { key: 'ytd', label: 'YTD Ranking' },
          { key: 'month', label: 'This Month' },
          { key: 'week', label: 'This Week' },
        ] as { key: SortKey; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setSortKey(t.key)} style={{
            padding: '6px 14px', borderRadius: '5px', fontSize: '11px', fontWeight: '600',
            cursor: 'pointer', border: 'none',
            background: sortKey === t.key ? '#0C1018' : 'transparent',
            color: sortKey === t.key ? '#ECF0F5' : '#7A90A8',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Scoreboard Table */}
      <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 100px 100px 100px 100px 80px 110px', padding: '10px 16px', background: '#111820', borderBottom: '1px solid #1C2A3A' }}>
          {['#', 'Agent', 'YTD ALP', 'Month ALP', 'Week ALP', 'Ref YTD', 'Ref Month', 'Ref Week', 'Close %', ''].map(h => (
            <div key={h} style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>{h}</div>
          ))}
        </div>

        {/* Active agents */}
        {sorted.filter(a => a.is_active).map((agent, i) => {
          const tierColor = TIER_COLORS[agent.tier] || '#7A90A8'
          const tierLabel = TIER_LABELS[agent.tier] || '?'
          const rankColor = i < 3 ? RANK_COLORS[i] : '#3D5068'
          const agentId   = AGENT_IDS[agent.full_name] || '1'
          const initials  = agent.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
          const sortValue = sortKey === 'ytd' ? agent.ytdAlp : sortKey === 'month' ? agent.monthAlp : agent.weekAlp
          const barPct    = Math.round((sortValue / topValue) * 100)
          const closeColor = agent.closeRatio >= 45 ? '#00E5A0' : agent.closeRatio >= 30 ? '#F59E0B' : agent.closeRatio > 0 ? '#EF4444' : '#3D5068'

          return (
            <div key={agent.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 100px 100px 100px 100px 80px 110px', padding: '12px 16px', borderBottom: '1px solid rgba(28,42,58,0.5)', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: rankColor }}>{i + 1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.location.href = `/dashboard/team/${agentId}`}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${tierColor}22`, color: tierColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>{initials}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {agent.full_name}
                    <span style={{ fontSize: '9px', fontWeight: '700', color: tierColor, background: `${tierColor}22`, padding: '1px 6px', borderRadius: '4px' }}>{tierLabel}</span>
                  </div>
                  <div style={{ width: '100px', height: '3px', background: '#16202C', borderRadius: '2px', marginTop: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${barPct}%`, height: '100%', background: tierColor, borderRadius: '2px' }} />
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: sortKey === 'ytd' ? '#00E5A0' : '#ECF0F5' }}>{fmt(agent.ytdAlp)}</div>
              <div style={{ fontSize: '13px', color: sortKey === 'month' ? '#60A5FA' : '#7A90A8' }}>{fmt(agent.monthAlp)}</div>
              <div style={{ fontSize: '13px', color: sortKey === 'week' ? '#A78BFA' : '#7A90A8' }}>{fmt(agent.weekAlp)}</div>
              <div style={{ fontSize: '12px', color: '#7A90A8' }}>{fmt(agent.ytdRefAlp)}</div>
              <div style={{ fontSize: '12px', color: '#7A90A8' }}>{fmt(agent.monthRefAlp)}</div>
              <div style={{ fontSize: '12px', color: '#7A90A8' }}>{fmt(agent.weekRefAlp)}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: closeColor }}>{agent.closeRatio > 0 ? `${agent.closeRatio}%` : '—'}</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setConfirmAction({ type: 'deactivate', agent })}
                  style={{ background: '#1C2A3A', border: 'none', color: '#F59E0B', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Deactivate
                </button>
                {agent.totalSales === 0 && (
                  <button
                    onClick={() => setConfirmAction({ type: 'delete', agent })}
                    style={{ background: '#1C2A3A', border: 'none', color: '#EF4444', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Inactive agents section */}
        {sorted.filter(a => !a.is_active).length > 0 && (
          <>
            <div style={{ padding: '10px 16px', background: '#111820', borderTop: '1px solid #1C2A3A', borderBottom: '1px solid #1C2A3A' }}>
              <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '2px' }}>Inactive / Terminated — ALP still counts toward team totals</div>
            </div>
            {sorted.filter(a => !a.is_active).map(agent => {
              const tierColor = TIER_COLORS[agent.tier] || '#3D5068'
              const initials  = agent.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)

              return (
                <div key={agent.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 100px 100px 100px 100px 80px 110px', padding: '10px 16px', borderBottom: '1px solid rgba(28,42,58,0.3)', alignItems: 'center', opacity: 0.5 }}>
                  <div style={{ fontSize: '12px', color: '#3D5068' }}>—</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#1C2A3A', color: '#3D5068', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>{initials}</div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#3D5068' }}>{agent.full_name}</div>
                      <div style={{ fontSize: '9px', color: '#1C2A3A', marginTop: '2px' }}>Inactive</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#3D5068' }}>{fmt(agent.ytdAlp)}</div>
                  <div style={{ fontSize: '12px', color: '#3D5068' }}>{fmt(agent.monthAlp)}</div>
                  <div style={{ fontSize: '12px', color: '#3D5068' }}>{fmt(agent.weekAlp)}</div>
                  <div style={{ fontSize: '12px', color: '#3D5068' }}>{fmt(agent.ytdRefAlp)}</div>
                  <div style={{ fontSize: '12px', color: '#3D5068' }}>{fmt(agent.monthRefAlp)}</div>
                  <div style={{ fontSize: '12px', color: '#3D5068' }}>{fmt(agent.weekRefAlp)}</div>
                  <div style={{ fontSize: '12px', color: '#3D5068' }}>{agent.closeRatio > 0 ? `${agent.closeRatio}%` : '—'}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleReactivate(agent)}
                      style={{ background: '#1C2A3A', border: 'none', color: '#00E5A0', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
                    >
                      Reactivate
                    </button>
                    <button
                      onClick={() => setConfirmAction({ type: 'delete', agent })}
                      style={{ background: '#1C2A3A', border: 'none', color: '#EF4444', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
