'use client'
import { useState, useEffect } from 'react'

const AGENT_NAMES: Record<string, any> = {
  '1': { name: 'Jonis H.', role: 'Top Producer', tier: 'S Tier', color: '#F59E0B', initials: 'JH', start: 'Jan 2022', manager: 'Enri S.' },
  '2': { name: 'Caitlyn R.', role: 'A Tier Producer', tier: 'A Tier', color: '#00E5A0', initials: 'CR', start: 'Jan 2022', manager: 'Enri S.' },
  '3': { name: 'Luis K.', role: 'A Tier Producer', tier: 'A Tier', color: '#00E5A0', initials: 'LK', start: 'Jan 2022', manager: 'Enri S.' },
  '5': { name: 'Ardit M.', role: 'B Tier Producer', tier: 'B Tier', color: '#3B82F6', initials: 'AM', start: 'Jan 2023', manager: 'Enri S.' },
  '6': { name: 'Adrian B.', role: 'B Tier Producer', tier: 'B Tier', color: '#3B82F6', initials: 'AB', start: 'Jan 2023', manager: 'Enri S.' },
  '7': { name: 'Dayell F.', role: 'B Tier Producer', tier: 'B Tier', color: '#3B82F6', initials: 'DF', start: 'Jan 2023', manager: 'Enri S.' },
  '9': { name: 'Kelsey S.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'KS', start: 'Jan 2023', manager: 'Enri S.' },
  '10': { name: 'Edlira S.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'ES', start: 'Jan 2023', manager: 'Enri S.' },
  '11': { name: 'Matthew H.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'MH', start: 'Jan 2023', manager: 'Enri S.' },
  '12': { name: 'Drew C.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'DC', start: 'Jan 2023', manager: 'Enri S.' },
  '13': { name: 'Nadirah M.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'NM', start: 'Jan 2023', manager: 'Enri S.' },
  '14': { name: 'Tiffany S.', role: 'C Tier Producer', tier: 'C Tier', color: '#A78BFA', initials: 'TS', start: 'Jan 2023', manager: 'Enri S.' },
  '15': { name: 'Jorge R.', role: 'In Training', tier: 'T Tier', color: '#F97316', initials: 'JR', start: 'Jan 2024', manager: 'Enri S.' },
  '16': { name: 'Alyssa H.', role: 'In Training', tier: 'T Tier', color: '#F97316', initials: 'AH', start: 'Jan 2024', manager: 'Enri S.' },
  '17': { name: 'Llambi T.', role: 'Inactive', tier: 'I Tier', color: '#EF4444', initials: 'LT', start: 'Jan 2023', manager: 'Enri S.' },
  '18': { name: 'Endi A.', role: 'Inactive', tier: 'I Tier', color: '#EF4444', initials: 'EA', start: 'Jan 2023', manager: 'Enri S.' },
  '20': { name: 'Enri S.', role: 'Agency Owner · A Tier', tier: 'A Tier', color: '#00E5A0', initials: 'ES', start: 'Jan 2020', manager: 'AO Globe Life' },
  '21': { name: 'Bruno N.', role: 'S Tier Producer', tier: 'S Tier', color: '#F59E0B', initials: 'BN', start: 'May 2026', manager: 'Enri S.' },
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const TIERS = ['S Tier', 'A Tier', 'B Tier', 'C Tier', 'T Tier', 'I Tier']
const LEAD_TYPES = ['Union', 'Veteran', 'POS', 'Union + Veteran', 'Union + POS', 'Union + POS + Veteran', 'New Pack', 'N/A']

const DEFAULT_STATS: {
  ytd: number; month: number; close: number; sits: number; dials: number;
  refs: number; streak: number; health: string; leads: string;
  monthly: number[]; coaching: string[];
} = {
  ytd: 0, month: 0, close: 0, sits: 0, dials: 0,
  refs: 0, streak: 0, health: 'yellow', leads: 'New Pack',
  monthly: [0,0,0,0,0,0,0,0,0,0,0,0],
  coaching: [],
}

interface DailyReport {
  id: string
  report_date: string
  appointments_set: number
  sits: number
  sales: number
  alp_written: number
  referral_appointments: number
  referral_sits: number
  referral_sales: number
  referral_alp: number
  win_of_day: string
  struggles: string
}

interface ReportStats {
  totalReports: number
  totalAppointments: number
  totalSits: number
  totalSales: number
  totalALP: number
  totalRefALP: number
  showRatio: number
  closeRatio: number
  avgALPPerSale: number
}

const PAGE_SIZE = 10

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(val: number) {
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`
  return `$${val.toFixed(0)}`
}

export default function AgentProfilePage({ params }: { params: { id: string } }) {
  const base = AGENT_NAMES[params.id]
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [activeTab, setActiveTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState(DEFAULT_STATS)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [coachingNote, setCoachingNote] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [agentUUID, setAgentUUID] = useState('')

  // JotForm report state
  const [reports, setReports] = useState<DailyReport[]>([])
  const [reportStats, setReportStats] = useState<ReportStats | null>(null)
  const [reportTotal, setReportTotal] = useState(0)
  const [reportPage, setReportPage] = useState(0)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  useEffect(() => {
    async function loadAgent() {
      if (!base) { setLoading(false); return }
      try {
        const res = await fetch(`/api/agents?name=${encodeURIComponent(base.name)}`)
        const { data } = await res.json()
        setAgentUUID(data.id)
        if (data) {
          const loaded = {
            ytd: data.ytd_alp || 0,
            month: data.month_alp || 0,
            close: data.close_rate || 0,
            sits: data.avg_daily_sits || 0,
            dials: data.avg_daily_dials || 0,
            refs: data.refs_per_sale || 0,
            streak: data.streak_days || 0,
            health: data.health_status || 'yellow',
            leads: data.lead_types_text || 'New Pack',
            monthly: data.monthly_alp || [0,0,0,0,0,0,0,0,0,0,0,0],
            coaching: data.coaching_notes || [],
          }
          setStats(loaded)
          setEditForm(loaded)
        }
      } catch (e) {}
      setLoading(false)
    }
    loadAgent()
  }, [params.id])

  // Load JotForm reports when Activity tab is opened
  useEffect(() => {
    if (activeTab === 'activity') {
      fetchReports(reportPage)
    }
  }, [activeTab, reportPage])

  async function fetchReports(page: number) {
    setReportsLoading(true)
    try {
      const offset = page * PAGE_SIZE
      const res = await fetch(`/api/reports?agent_id=${agentUUID}&limit=${PAGE_SIZE}&offset=${offset}`)
      const json = await res.json()
      if (json.reports) {
        setReports(json.reports)
        setReportStats(json.stats)
        setReportTotal(json.total || 0)
      }
    } catch (e) {
      console.error('Failed to load reports', e)
    }
    setReportsLoading(false)
  }

  if (!base) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#7A90A8', fontFamily: 'system-ui' }}>
      Agent not found. <a href="/dashboard/team" style={{ color: '#00E5A0' }}>Back to Team</a>
    </div>
  )

  function handleEditChange(field: string, value: any) {
    setEditForm((prev: any) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: base.name,
          ytd_alp: editForm.ytd,
          month_alp: editForm.month,
          close_rate: editForm.close,
          avg_daily_sits: editForm.sits,
          avg_daily_dials: editForm.dials,
          refs_per_sale: editForm.refs,
          streak_days: editForm.streak,
          health_status: editForm.health,
          lead_types_text: editForm.leads,
          monthly_alp: editForm.monthly,
          coaching_notes: editForm.coaching,
        }),
      })
      const { error } = await res.json()
      if (error) throw new Error(error)
      setStats(editForm)
      setEditing(false)
      setSavedMessage('✓ Saved successfully!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (e: any) {
      setSavedMessage('Error saving — please try again')
    }
    setSaving(false)
  }

  async function handleAddNote() {
    if (!coachingNote.trim()) return
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const newNote = `${date} — ${coachingNote}`
    const updatedNotes = [newNote, ...stats.coaching]
    try {
      await fetch('/api/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: base.name, coaching_notes: updatedNotes }),
      })
      setStats(prev => ({ ...prev, coaching: updatedNotes }))
      setCoachingNote('')
    } catch (e) {}
  }

  const agent = { ...base, ...stats }
  const healthColor = agent.health === 'green' ? '#00E5A0' : agent.health === 'yellow' ? '#F59E0B' : '#EF4444'
  const maxMonthly = Math.max(...agent.monthly.filter((v: number) => v > 0), 1)
  const totalPages = Math.ceil(reportTotal / PAGE_SIZE)

  const inputStyle = {
    width: '100%', background: '#07090D', border: '1px solid #1C2A3A',
    borderRadius: '6px', padding: '7px 10px', color: '#ECF0F5',
    fontSize: '12px', outline: 'none', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    display: 'block', fontSize: '9px', color: '#3D5068',
    textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '4px',
  }

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#7A90A8', fontFamily: 'system-ui' }}>
      Loading agent data...
    </div>
  )

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#ECF0F5' }}>

      <a href="/dashboard/team" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#7A90A8', textDecoration: 'none', fontSize: '12px', marginBottom: '16px' }}>
        ← Back to Team
      </a>

      {savedMessage && (
        <div style={{ background: savedMessage.includes('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(0,229,160,0.1)', border: `1px solid ${savedMessage.includes('Error') ? 'rgba(239,68,68,0.2)' : 'rgba(0,229,160,0.2)'}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '12px', color: savedMessage.includes('Error') ? '#EF4444' : '#00E5A0' }}>
          {savedMessage}
        </div>
      )}

      {/* Hero */}
      <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #1C2A3A' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: `${agent.color}22`, color: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>
            {agent.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{agent.name}</div>
            <div style={{ fontSize: '12px', color: '#7A90A8', marginTop: '2px' }}>{agent.role} · Started {agent.start}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: `${agent.color}22`, color: agent.color, border: `1px solid ${agent.color}44` }}>
                {agent.tier}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: healthColor, boxShadow: `0 0 5px ${healthColor}` }} />
                <span style={{ fontSize: '11px', color: healthColor }}>{agent.health === 'green' ? 'Healthy' : agent.health === 'yellow' ? 'Watch' : 'Needs Help'}</span>
              </div>
            </div>
            <button
              onClick={() => { setEditing(!editing); setEditForm(stats) }}
              style={{ background: editing ? '#111820' : '#00E5A0', color: editing ? '#7A90A8' : '#000', border: editing ? '1px solid #1C2A3A' : 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            >
              {editing ? 'Cancel' : '✏️ Edit'}
            </button>
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

      {/* Edit Form */}
      {editing && (
        <div style={{ background: '#0C1018', border: '1px solid #00E5A044', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#00E5A0', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: '700' }}>
            ✏️ Editing — {agent.name}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>YTD ALP ($)</label>
              <input type="number" style={inputStyle} value={editForm.ytd}
                onChange={e => handleEditChange('ytd', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label style={labelStyle}>This Month ALP ($)</label>
              <input type="number" style={inputStyle} value={editForm.month}
                onChange={e => handleEditChange('month', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label style={labelStyle}>Close Rate (%)</label>
              <input type="number" style={inputStyle} value={editForm.close}
                onChange={e => handleEditChange('close', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label style={labelStyle}>Avg Daily Sits</label>
              <input type="number" style={inputStyle} value={editForm.sits}
                onChange={e => handleEditChange('sits', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label style={labelStyle}>Avg Daily Dials</label>
              <input type="number" style={inputStyle} value={editForm.dials}
                onChange={e => handleEditChange('dials', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label style={labelStyle}>Referrals Per Sale</label>
              <input type="number" style={inputStyle} value={editForm.refs}
                onChange={e => handleEditChange('refs', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label style={labelStyle}>Day Streak</label>
              <input type="number" style={inputStyle} value={editForm.streak}
                onChange={e => handleEditChange('streak', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label style={labelStyle}>Lead Types</label>
              <select style={inputStyle} value={editForm.leads}
                onChange={e => handleEditChange('leads', e.target.value)}>
                {LEAD_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Health Status</label>
              <select style={inputStyle} value={editForm.health}
                onChange={e => handleEditChange('health', e.target.value)}>
                <option value="green">Healthy</option>
                <option value="yellow">Watch</option>
                <option value="red">Needs Help</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Monthly ALP — Jan through Dec (comma separated)</label>
            <input type="text" style={inputStyle}
              value={editForm.monthly.join(',')}
              onChange={e => {
                const vals = e.target.value.split(',').map((v: string) => parseInt(v.trim()) || 0)
                while (vals.length < 12) vals.push(0)
                handleEditChange('monthly', vals.slice(0, 12))
              }}
              placeholder="5000,6000,7000,8000,9000,10000,0,0,0,0,0,0"
            />
            <div style={{ fontSize: '10px', color: '#3D5068', marginTop: '4px' }}>12 numbers separated by commas. Use 0 for months not yet completed.</div>
          </div>

          <button onClick={handleSave} disabled={saving}
            style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
            {saving ? 'Saving to database...' : '✓ Save Changes'}
          </button>
        </div>
      )}

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

      {/* Activity Tab — JotForm Data */}
      {activeTab === 'activity' && (
        <div>
          {reportsLoading && (
            <div style={{ textAlign: 'center', color: '#7A90A8', fontSize: '12px', padding: '40px' }}>
              Loading report data...
            </div>
          )}

          {!reportsLoading && reportStats && reportStats.totalReports === 0 && (
            <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#3D5068', fontSize: '12px' }}>
              No daily reports submitted yet for {agent.name}.
            </div>
          )}

          {!reportsLoading && reportStats && reportStats.totalReports > 0 && (
            <>
              {/* Summary Stats from JotForm */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
                  All-Time from Daily Reports ({reportStats.totalReports} reports)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { label: 'Total ALP', value: formatCurrency(reportStats.totalALP), color: '#00E5A0' },
                    { label: 'Show Ratio', value: `${reportStats.showRatio}%`, color: '#60A5FA' },
                    { label: 'Close Ratio', value: `${reportStats.closeRatio}%`, color: '#A78BFA' },
                    { label: 'Total Sales', value: String(reportStats.totalSales), color: '#00E5A0' },
                    { label: 'Total Sits', value: String(reportStats.totalSits), color: '#60A5FA' },
                    { label: 'Avg ALP/Sale', value: formatCurrency(reportStats.avgALPPerSale), color: '#F59E0B' },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report History Table */}
              <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '14px 16px', borderBottom: '1px solid #1C2A3A' }}>
                  Report History
                </div>

                {/* Table Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr 0.8fr 1fr 1fr 0.8fr', gap: '0', padding: '8px 16px', background: '#111820', borderBottom: '1px solid #1C2A3A' }}>
                  {['Date', 'Appts', 'Sits', 'Sales', 'ALP', 'Ref ALP', 'Notes'].map(h => (
                    <div key={h} style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</div>
                  ))}
                </div>

                {/* Rows */}
                {reports.map((report) => {
                  const isExpanded = expandedRow === report.id
                  const hasNotes = report.win_of_day || report.struggles
                  return (
                    <div key={report.id} style={{ borderBottom: '1px solid rgba(28,42,58,0.4)' }}>
                      <div
                        onClick={() => hasNotes && setExpandedRow(isExpanded ? null : report.id)}
                        style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr 0.8fr 1fr 1fr 0.8fr', gap: '0', padding: '10px 16px', fontSize: '12px', cursor: hasNotes ? 'pointer' : 'default', background: isExpanded ? '#111820' : 'transparent' }}
                      >
                        <div style={{ color: '#ECF0F5', fontWeight: '500' }}>{formatDate(report.report_date)}</div>
                        <div style={{ color: '#7A90A8' }}>{report.appointments_set ?? '—'}</div>
                        <div style={{ color: '#7A90A8' }}>{report.sits ?? '—'}</div>
                        <div style={{ color: '#7A90A8' }}>{report.sales ?? '—'}</div>
                        <div style={{ color: '#00E5A0', fontWeight: '600' }}>{report.alp_written > 0 ? formatCurrency(report.alp_written) : '—'}</div>
                        <div style={{ color: '#60A5FA' }}>{report.referral_alp > 0 ? formatCurrency(report.referral_alp) : '—'}</div>
                        <div style={{ color: '#3D5068', fontSize: '10px' }}>
                          {hasNotes ? (isExpanded ? '▲ hide' : '▼ view') : '—'}
                        </div>
                      </div>

                      {/* Expanded Notes */}
                      {isExpanded && hasNotes && (
                        <div style={{ padding: '10px 16px 14px', background: '#111820', borderTop: '1px solid #1C2A3A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          {report.win_of_day && (
                            <div>
                              <div style={{ fontSize: '9px', color: '#00E5A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Win of Day</div>
                              <div style={{ fontSize: '12px', color: '#7A90A8', lineHeight: '1.5' }}>{report.win_of_day}</div>
                            </div>
                          )}
                          {report.struggles && (
                            <div>
                              <div style={{ fontSize: '9px', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Struggles</div>
                              <div style={{ fontSize: '12px', color: '#7A90A8', lineHeight: '1.5' }}>{report.struggles}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #1C2A3A' }}>
                    <span style={{ fontSize: '11px', color: '#3D5068' }}>
                      {reportPage * PAGE_SIZE + 1}–{Math.min((reportPage + 1) * PAGE_SIZE, reportTotal)} of {reportTotal} reports
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setReportPage(p => Math.max(0, p - 1))}
                        disabled={reportPage === 0}
                        style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', border: '1px solid #1C2A3A', background: 'transparent', color: reportPage === 0 ? '#3D5068' : '#7A90A8', cursor: reportPage === 0 ? 'not-allowed' : 'pointer' }}
                      >
                        ← Prev
                      </button>
                      <span style={{ padding: '5px 10px', fontSize: '11px', color: '#3D5068' }}>
                        {reportPage + 1} / {totalPages}
                      </span>
                      <button
                        onClick={() => setReportPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={reportPage >= totalPages - 1}
                        style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', border: '1px solid #1C2A3A', background: 'transparent', color: reportPage >= totalPages - 1 ? '#3D5068' : '#7A90A8', cursor: reportPage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Coaching Tab */}
      {activeTab === 'coaching' && (
        <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Coaching History</div>

          <div style={{ marginBottom: '16px', padding: '12px', background: '#111820', borderRadius: '8px', border: '1px solid #1C2A3A' }}>
            <div style={{ fontSize: '10px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Add Coaching Note</div>
            <textarea rows={3} value={coachingNote} onChange={e => setCoachingNote(e.target.value)}
              placeholder="Enter coaching notes, action items, follow-ups..."
              style={{ width: '100%', background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '6px', padding: '8px', color: '#ECF0F5', fontSize: '12px', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            <button onClick={handleAddNote}
              style={{ marginTop: '8px', background: '#00E5A0', color: '#000', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
              Save Note
            </button>
          </div>

          {stats.coaching.length > 0 ? stats.coaching.map((note: string, i: number) => (
            <div key={i} style={{ padding: '12px', background: '#111820', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', color: '#7A90A8', lineHeight: '1.6' }}>
              {note}
            </div>
          )) : (
            <div style={{ textAlign: 'center', color: '#3D5068', fontSize: '12px', padding: '20px' }}>
              No coaching sessions recorded yet. Add one above.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
