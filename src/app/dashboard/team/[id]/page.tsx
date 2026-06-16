'use client'
import { useState, useEffect, useCallback } from 'react'

const AGENT_NAMES: Record<string, any> = {
  '1':  { name: 'Jonis H.',   role: 'Top Producer',          tier: 'S Tier', color: '#F59E0B', initials: 'JH', start: 'Jan 2022', manager: 'Enri S.' },
  '2':  { name: 'Caitlyn R.', role: 'A Tier Producer',       tier: 'A Tier', color: '#00E5A0', initials: 'CR', start: 'Jan 2022', manager: 'Enri S.' },
  '3':  { name: 'Luis K.',    role: 'A Tier Producer',       tier: 'A Tier', color: '#00E5A0', initials: 'LK', start: 'Jan 2022', manager: 'Enri S.' },
  '5':  { name: 'Ardit M.',   role: 'B Tier Producer',       tier: 'B Tier', color: '#3B82F6', initials: 'AM', start: 'Jan 2023', manager: 'Enri S.' },
  '6':  { name: 'Adrian B.',  role: 'B Tier Producer',       tier: 'B Tier', color: '#3B82F6', initials: 'AB', start: 'Jan 2023', manager: 'Enri S.' },
  '7':  { name: 'Dayell F.',  role: 'B Tier Producer',       tier: 'B Tier', color: '#3B82F6', initials: 'DF', start: 'Jan 2023', manager: 'Enri S.' },
  '9':  { name: 'Kelsey S.',  role: 'C Tier Producer',       tier: 'C Tier', color: '#A78BFA', initials: 'KS', start: 'Jan 2023', manager: 'Enri S.' },
  '10': { name: 'Edlira S.',  role: 'C Tier Producer',       tier: 'C Tier', color: '#A78BFA', initials: 'ES', start: 'Jan 2023', manager: 'Enri S.' },
  '11': { name: 'Matthew H.', role: 'C Tier Producer',       tier: 'C Tier', color: '#A78BFA', initials: 'MH', start: 'Jan 2023', manager: 'Enri S.' },
  '12': { name: 'Drew C.',    role: 'C Tier Producer',       tier: 'C Tier', color: '#A78BFA', initials: 'DC', start: 'Jan 2023', manager: 'Enri S.' },
  '13': { name: 'Nadirah M.', role: 'C Tier Producer',       tier: 'C Tier', color: '#A78BFA', initials: 'NM', start: 'Jan 2023', manager: 'Enri S.' },
  '14': { name: 'Tiffany S.', role: 'C Tier Producer',       tier: 'C Tier', color: '#A78BFA', initials: 'TS', start: 'Jan 2023', manager: 'Enri S.' },
  '15': { name: 'Jorge R.',   role: 'In Training',           tier: 'T Tier', color: '#F97316', initials: 'JR', start: 'Jan 2024', manager: 'Enri S.' },
  '16': { name: 'Alyssa H.',  role: 'In Training',           tier: 'T Tier', color: '#F97316', initials: 'AH', start: 'Jan 2024', manager: 'Enri S.' },
  '17': { name: 'Llambi T.',  role: 'Inactive',              tier: 'I Tier', color: '#EF4444', initials: 'LT', start: 'Jan 2023', manager: 'Enri S.' },
  '18': { name: 'Endi A.',    role: 'Inactive',              tier: 'I Tier', color: '#EF4444', initials: 'EA', start: 'Jan 2023', manager: 'Enri S.' },
  '20': { name: 'Enri S.',    role: 'Agency Owner · A Tier', tier: 'A Tier', color: '#00E5A0', initials: 'ES', start: 'Jan 2020', manager: 'AO Globe Life' },
  '21': { name: 'Bruno N.',   role: 'S Tier Producer',       tier: 'S Tier', color: '#F59E0B', initials: 'BN', start: 'Jun 2026', manager: 'Enri S.' },
}

const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const LEAD_TYPES = ['Union','Veteran','POS','Union + Veteran','Union + POS','Union + POS + Veteran','New Pack','N/A']
const PAGE_SIZE  = 10

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
  totalALP: number
  totalRefALP: number
  totalSits: number
  totalSales: number
  showRatio: number
  closeRatio: number
  avgALPPerSale: number
}

function formatCurrency(val: number) {
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`
  return `$${Math.round(val)}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Get current month index in ET (0=Jan)
function getCurrentMonthET(): number {
  const etOffset = -4
  const etDate = new Date(new Date().getTime() + etOffset * 60 * 60 * 1000)
  return etDate.getUTCMonth()
}

export default function AgentProfilePage({ params }: { params: { id: string } }) {
  const base = AGENT_NAMES[params.id]
  const currentMonth = getCurrentMonthET()

  // Agent data
  const [agentUUID, setAgentUUID] = useState('')
  const [agentData, setAgentData] = useState<any>(null)
  const [loading, setLoading]     = useState(true)

  // Historical monthly ALP (from monthly_alp array)
  const [monthlyALP, setMonthlyALP] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0])

  // JotForm calculated header stats
  const [jotYTD, setJotYTD]       = useState(0)
  const [jotMonth, setJotMonth]   = useState(0)
  const [jotClose, setJotClose]   = useState(0)
  const [jotStreak, setJotStreak] = useState(0)
  const [jotLoaded, setJotLoaded] = useState(false)

  // Activity tab
  const [reports, setReports]               = useState<DailyReport[]>([])
  const [reportStats, setReportStats]       = useState<ReportStats | null>(null)
  const [reportTotal, setReportTotal]       = useState(0)
  const [reportPage, setReportPage]         = useState(0)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [expandedRow, setExpandedRow]       = useState<string | null>(null)

  // Inline report editing
  const [editingReportId, setEditingReportId] = useState<string | null>(null)
  const [reportEditForm, setReportEditForm]   = useState<Partial<DailyReport>>({})
  const [savingReport, setSavingReport]       = useState(false)
  const [reportSaveMsg, setReportSaveMsg]     = useState('')

  // UI
  const [activeTab, setActiveTab]       = useState('overview')
  const [editing, setEditing]           = useState(false)
  const [editForm, setEditForm]         = useState<any>({})
  const [saving, setSaving]             = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [coachingNote, setCoachingNote] = useState('')

  // Step 1: Load agent
  useEffect(() => {
    if (!base) { setLoading(false); return }
    async function loadAgent() {
      try {
        const res      = await fetch(`/api/agents?name=${encodeURIComponent(base.name)}`)
        const { data } = await res.json()
        if (data) {
          setAgentUUID(data.id)
          const monthly = data.monthly_alp || [0,0,0,0,0,0,0,0,0,0,0,0]
          setMonthlyALP(monthly)
          setAgentData(data)
          setEditForm({
            sits:    data.avg_daily_sits  || 0,
            dials:   data.avg_daily_dials || 0,
            refs:    data.refs_per_sale   || 0,
            health:  data.health_status   || 'yellow',
            leads:   data.lead_types_text || 'New Pack',
            monthly: [...monthly],
            coaching: data.coaching_notes || [],
          })
        }
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    loadAgent()
  }, [params.id])

  // Step 2: Load JotForm stats for header
  useEffect(() => {
    if (!agentUUID) return
    async function loadJotFormStats() {
      try {
        const res  = await fetch(`/api/reports?agent_id=${agentUUID}&limit=1000&offset=0`)
        const json = await res.json()
        if (!json.reports || json.reports.length === 0) { setJotLoaded(true); return }

        const all: DailyReport[] = json.reports
        const etOffset = -4
        const etNow    = new Date(new Date().getTime() + etOffset * 60 * 60 * 1000)
        const thisYear  = etNow.getUTCFullYear()
        const thisMonth = etNow.getUTCMonth()

        const ytd = all
          .filter(r => new Date(r.report_date + 'T00:00:00').getFullYear() === thisYear)
          .reduce((s, r) => s + (r.alp_written || 0), 0)

        const month = all
          .filter(r => {
            const d = new Date(r.report_date + 'T00:00:00')
            return d.getFullYear() === thisYear && d.getMonth() === thisMonth
          })
          .reduce((s, r) => s + (r.alp_written || 0), 0)

        const totalSits  = all.reduce((s, r) => s + (r.sits  || 0), 0)
        const totalSales = all.reduce((s, r) => s + (r.sales || 0), 0)
        const close = totalSits > 0 ? Math.round((totalSales / totalSits) * 100) : 0

        const saleDates = new Set(all.filter(r => (r.sales || 0) > 0).map(r => r.report_date))
        let streak = 0
        const check = new Date(new Date().getTime() + etOffset * 60 * 60 * 1000)
        for (let i = 0; i < 365; i++) {
          const ds = `${check.getUTCFullYear()}-${String(check.getUTCMonth()+1).padStart(2,'0')}-${String(check.getUTCDate()).padStart(2,'0')}`
          if (saleDates.has(ds)) { streak++; check.setUTCDate(check.getUTCDate() - 1) }
          else break
        }

        setJotYTD(ytd)
        setJotMonth(month)
        setJotClose(close)
        setJotStreak(streak)
        setJotLoaded(true)
      } catch (e) { console.error(e); setJotLoaded(true) }
    }
    loadJotFormStats()
  }, [agentUUID])

  // Step 3: Load paginated reports for Activity tab
  const loadReports = useCallback(async (page: number) => {
    if (!agentUUID) return
    setReportsLoading(true)
    try {
      const offset = page * PAGE_SIZE
      const res    = await fetch(`/api/reports?agent_id=${agentUUID}&limit=${PAGE_SIZE}&offset=${offset}`)
      const json   = await res.json()
      if (json.reports) {
        setReports(json.reports)
        setReportStats(json.stats)
        setReportTotal(json.total || 0)
      }
    } catch (e) { console.error(e) }
    setReportsLoading(false)
  }, [agentUUID])

  useEffect(() => {
    if (activeTab === 'activity' && agentUUID) loadReports(reportPage)
  }, [activeTab, reportPage, agentUUID])

  // Header display values
  // Historical: sum of monthly_alp for past months + current month manual entry
  const historicalYTD   = monthlyALP.slice(0, currentMonth).reduce((s, v) => s + (v || 0), 0)
  const historicalMonth = monthlyALP[currentMonth] || 0
  const displayYTD      = historicalYTD + historicalMonth + jotYTD
  const displayMonth    = historicalMonth + jotMonth
  const displayClose    = jotClose
  const displayStreak   = jotStreak

  // Save report edit
  async function saveReportEdit() {
    if (!editingReportId) return
    setSavingReport(true)
    setReportSaveMsg('')
    try {
      const res = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingReportId, ...reportEditForm }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setReportSaveMsg('✓ Saved!')
      setEditingReportId(null)
      setReportEditForm({})
      loadReports(reportPage)
      setJotLoaded(false)
      const statsRes  = await fetch(`/api/reports?agent_id=${agentUUID}&limit=1000&offset=0`)
      const statsJson = await statsRes.json()
      if (statsJson.reports?.length > 0) {
        const all = statsJson.reports
        const etOffset = -4
        const etNow = new Date(new Date().getTime() + etOffset * 60 * 60 * 1000)
        const ytd = all.filter((r: DailyReport) => new Date(r.report_date + 'T00:00:00').getFullYear() === etNow.getUTCFullYear()).reduce((s: number, r: DailyReport) => s + (r.alp_written || 0), 0)
        const month = all.filter((r: DailyReport) => { const d = new Date(r.report_date + 'T00:00:00'); return d.getFullYear() === etNow.getUTCFullYear() && d.getMonth() === etNow.getUTCMonth() }).reduce((s: number, r: DailyReport) => s + (r.alp_written || 0), 0)
        const ts  = all.reduce((s: number, r: DailyReport) => s + (r.sits  || 0), 0)
        const tsa = all.reduce((s: number, r: DailyReport) => s + (r.sales || 0), 0)
        setJotYTD(ytd)
        setJotMonth(month)
        setJotClose(ts > 0 ? Math.round((tsa / ts) * 100) : 0)
      }
      setJotLoaded(true)
      setTimeout(() => setReportSaveMsg(''), 3000)
    } catch (e: any) {
      setReportSaveMsg('Error: ' + e.message)
    }
    setSavingReport(false)
  }

  // Save agent edit
  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:            base.name,
          avg_daily_sits:  editForm.sits,
          avg_daily_dials: editForm.dials,
          refs_per_sale:   editForm.refs,
          health_status:   editForm.health,
          lead_types_text: editForm.leads,
          monthly_alp:     editForm.monthly,
          coaching_notes:  editForm.coaching,
        }),
      })
      const { error } = await res.json()
      if (error) throw new Error(error)
      setMonthlyALP([...editForm.monthly])
      setAgentData((prev: any) => ({ ...prev, ...editForm, monthly_alp: editForm.monthly }))
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
    const date    = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const newNote = `${date} — ${coachingNote}`
    const updated = [newNote, ...(agentData?.coaching_notes || [])]
    try {
      await fetch('/api/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: base.name, coaching_notes: updated }),
      })
      setAgentData((prev: any) => ({ ...prev, coaching_notes: updated }))
      setCoachingNote('')
    } catch (e) {}
  }

  const inputStyle = {
    width: '100%', background: '#07090D', border: '1px solid #1C2A3A',
    borderRadius: '6px', padding: '7px 10px', color: '#ECF0F5',
    fontSize: '12px', outline: 'none', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    display: 'block', fontSize: '9px', color: '#3D5068',
    textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '4px',
  }
  const smallInputStyle = {
    width: '100%', background: '#07090D', border: '1px solid #1C2A3A',
    borderRadius: '4px', padding: '5px 8px', color: '#ECF0F5',
    fontSize: '11px', outline: 'none', boxSizing: 'border-box' as const, textAlign: 'center' as const,
  }

  if (!base) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#7A90A8', fontFamily: 'system-ui' }}>
      Agent not found. <a href="/dashboard/team" style={{ color: '#00E5A0' }}>Back to Team</a>
    </div>
  )
  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#7A90A8', fontFamily: 'system-ui' }}>
      Loading agent data...
    </div>
  )

  const color        = base.color
  const healthStatus = agentData?.health_status || 'yellow'
  const healthColor  = healthStatus === 'green' ? '#00E5A0' : healthStatus === 'yellow' ? '#F59E0B' : '#EF4444'
  const healthLabel  = healthStatus === 'green' ? 'Healthy' : healthStatus === 'yellow' ? 'Watch' : 'Needs Help'
  const maxMonthly   = Math.max(...monthlyALP.filter(v => v > 0), 1)
  const totalPages   = Math.ceil(reportTotal / PAGE_SIZE)
  const coaching     = agentData?.coaching_notes || []

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
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: `${color}22`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>
            {base.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{base.name}</div>
            <div style={{ fontSize: '12px', color: '#7A90A8', marginTop: '2px' }}>{base.role} · Started {base.start}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: `${color}22`, color, border: `1px solid ${color}44` }}>
                {base.tier}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: healthColor, boxShadow: `0 0 5px ${healthColor}` }} />
                <span style={{ fontSize: '11px', color: healthColor }}>{healthLabel}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setEditing(!editing)
                setEditForm({
                  sits:    agentData?.avg_daily_sits  || 0,
                  dials:   agentData?.avg_daily_dials || 0,
                  refs:    agentData?.refs_per_sale   || 0,
                  health:  healthStatus,
                  leads:   agentData?.lead_types_text || 'New Pack',
                  monthly: [...monthlyALP],
                  coaching,
                })
              }}
              style={{ background: editing ? '#111820' : '#00E5A0', color: editing ? '#7A90A8' : '#000', border: editing ? '1px solid #1C2A3A' : 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            >
              {editing ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#1C2A3A' }}>
          {[
            { label: 'YTD ALP',    value: displayYTD    > 0 ? `$${(displayYTD / 1000).toFixed(0)}K`   : (jotLoaded ? '—' : '…'), color: '#00E5A0' },
            { label: 'This Month', value: displayMonth  > 0 ? `$${(displayMonth / 1000).toFixed(1)}K` : (jotLoaded ? '—' : '…'), color: '#60A5FA' },
            { label: 'Close Rate', value: displayClose  > 0 ? `${displayClose}%`                      : (jotLoaded ? '—' : '…'), color: displayClose >= 45 ? '#00E5A0' : displayClose >= 30 ? '#F59E0B' : '#EF4444' },
            { label: 'Day Streak', value: displayStreak > 0 ? `🔥 ${displayStreak}d`                  : (jotLoaded ? '—' : '…'), color: displayStreak > 0 ? '#00E5A0' : '#EF4444' },
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
          <div style={{ fontSize: '11px', color: '#00E5A0', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px', fontWeight: '700' }}>✏️ Editing — {base.name}</div>
          <div style={{ fontSize: '10px', color: '#3D5068', marginBottom: '16px' }}>JotForm data is added on top of historical entries automatically.</div>

          {/* Historical ALP by month */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: '#00E5A0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '10px' }}>
              📅 Historical ALP by Month
            </div>
            <div style={{ fontSize: '10px', color: '#3D5068', marginBottom: '10px' }}>
              Enter total ALP for each month. For the current month, enter only the pre-JotForm portion (e.g. Jun 1–14). Leave future months as 0.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {MONTHS.map((month, i) => {
                const isCurrent = i === currentMonth
                const isFuture  = i > currentMonth
                return (
                  <div key={month}>
                    <div style={{ fontSize: '9px', color: isCurrent ? '#00E5A0' : isFuture ? '#1C2A3A' : '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{month}</span>
                      {isCurrent && <span style={{ color: '#00E5A0' }}>Current</span>}
                    </div>
                    <input
                      type="number"
                      style={{
                        ...smallInputStyle,
                        border: isCurrent ? '1px solid #00E5A044' : '1px solid #1C2A3A',
                        opacity: isFuture ? 0.3 : 1,
                        background: isCurrent ? 'rgba(0,229,160,0.05)' : '#07090D',
                      }}
                      value={editForm.monthly[i] || 0}
                      disabled={isFuture}
                      onChange={e => {
                        const updated = [...editForm.monthly]
                        updated[i] = parseInt(e.target.value) || 0
                        setEditForm((f: any) => ({ ...f, monthly: updated }))
                      }}
                    />
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: '10px', padding: '8px 12px', background: '#111820', borderRadius: '6px', fontSize: '11px', color: '#7A90A8', display: 'flex', justifyContent: 'space-between' }}>
              <span>Historical Total:</span>
              <span style={{ color: '#00E5A0', fontWeight: '700' }}>
                ${editForm.monthly.reduce((s: number, v: number) => s + (v || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Agent details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div><label style={labelStyle}>Avg Daily Sits</label><input type="number" style={inputStyle} value={editForm.sits} onChange={e => setEditForm((f: any) => ({ ...f, sits: parseInt(e.target.value) || 0 }))} /></div>
            <div><label style={labelStyle}>Avg Daily Dials</label><input type="number" style={inputStyle} value={editForm.dials} onChange={e => setEditForm((f: any) => ({ ...f, dials: parseInt(e.target.value) || 0 }))} /></div>
            <div><label style={labelStyle}>Referrals Per Sale</label><input type="number" style={inputStyle} value={editForm.refs} onChange={e => setEditForm((f: any) => ({ ...f, refs: parseInt(e.target.value) || 0 }))} /></div>
            <div><label style={labelStyle}>Lead Types</label><select style={inputStyle} value={editForm.leads} onChange={e => setEditForm((f: any) => ({ ...f, leads: e.target.value }))}>{LEAD_TYPES.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
            <div><label style={labelStyle}>Health Status</label><select style={inputStyle} value={editForm.health} onChange={e => setEditForm((f: any) => ({ ...f, health: e.target.value }))}><option value="green">Healthy</option><option value="yellow">Watch</option><option value="red">Needs Help</option></select></div>
          </div>

          <button onClick={handleSave} disabled={saving} style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
            {saving ? 'Saving...' : '✓ Save Changes'}
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
          }}>{tab}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Agent Info</div>
            {[
              { label: 'Manager',          value: base.manager },
              { label: 'Lead Types',       value: agentData?.lead_types_text || '—' },
              { label: 'Start Date',       value: base.start },
              { label: 'Avg Daily Dials',  value: agentData?.avg_daily_dials || '—' },
              { label: 'Avg Daily Sits',   value: agentData?.avg_daily_sits  || '—' },
              { label: 'Referrals / Sale', value: agentData?.refs_per_sale   || '—' },
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
              {monthlyALP.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <div style={{ width: '100%', borderRadius: '2px 2px 0 0', height: v > 0 ? `${Math.round((v / maxMonthly) * 80) + 8}px` : '4px', background: i === currentMonth ? color : `${color}44`, minHeight: '4px' }} />
                  <div style={{ fontSize: '8px', color: '#3D5068' }}>{MONTHS[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div>
          {reportsLoading && <div style={{ textAlign: 'center', color: '#7A90A8', fontSize: '12px', padding: '40px' }}>Loading report data...</div>}
          {!reportsLoading && (!reportStats || reportStats.totalReports === 0) && (
            <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#3D5068', fontSize: '12px' }}>
              No daily reports submitted yet for {base.name}.
            </div>
          )}
          {!reportsLoading && reportStats && reportStats.totalReports > 0 && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
                  All-Time from Daily Reports ({reportStats.totalReports} reports)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { label: 'Total ALP',    value: formatCurrency(reportStats.totalALP),     color: '#00E5A0' },
                    { label: 'Show Ratio',   value: `${reportStats.showRatio}%`,               color: '#60A5FA' },
                    { label: 'Close Ratio',  value: `${reportStats.closeRatio}%`,              color: '#A78BFA' },
                    { label: 'Total Sales',  value: String(reportStats.totalSales),            color: '#00E5A0' },
                    { label: 'Total Sits',   value: String(reportStats.totalSits),             color: '#60A5FA' },
                    { label: 'Avg ALP/Sale', value: formatCurrency(reportStats.avgALPPerSale), color: '#F59E0B' },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #1C2A3A' }}>
                  <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Report History</div>
                  {reportSaveMsg && <span style={{ fontSize: '11px', color: reportSaveMsg.startsWith('Error') ? '#EF4444' : '#00E5A0' }}>{reportSaveMsg}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.7fr 0.7fr 0.9fr 0.9fr 0.7fr 60px', padding: '8px 16px', background: '#111820', borderBottom: '1px solid #1C2A3A' }}>
                  {['Date','Appts','Sits','Sales','ALP','Ref ALP','Notes',''].map(h => (
                    <div key={h} style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</div>
                  ))}
                </div>

                {reports.map(report => {
                  const isEditing  = editingReportId === report.id
                  const isExpanded = expandedRow === report.id && !isEditing
                  const hasNotes   = report.win_of_day || report.struggles
                  return (
                    <div key={report.id} style={{ borderBottom: '1px solid rgba(28,42,58,0.4)' }}>
                      {!isEditing ? (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.7fr 0.7fr 0.9fr 0.9fr 0.7fr 60px', padding: '10px 16px', fontSize: '12px', background: isExpanded ? '#111820' : 'transparent' }}>
                            <div style={{ color: '#ECF0F5', fontWeight: '500', cursor: hasNotes ? 'pointer' : 'default' }} onClick={() => hasNotes && setExpandedRow(isExpanded ? null : report.id)}>{formatDate(report.report_date)}</div>
                            <div style={{ color: '#7A90A8' }}>{report.appointments_set ?? '—'}</div>
                            <div style={{ color: '#7A90A8' }}>{report.sits ?? '—'}</div>
                            <div style={{ color: '#7A90A8' }}>{report.sales ?? '—'}</div>
                            <div style={{ color: '#00E5A0', fontWeight: '600' }}>{report.alp_written > 0 ? formatCurrency(report.alp_written) : '—'}</div>
                            <div style={{ color: '#60A5FA' }}>{report.referral_alp > 0 ? formatCurrency(report.referral_alp) : '—'}</div>
                            <div style={{ color: '#3D5068', fontSize: '10px', cursor: hasNotes ? 'pointer' : 'default' }} onClick={() => hasNotes && setExpandedRow(isExpanded ? null : report.id)}>{hasNotes ? (isExpanded ? '▲' : '▼') : '—'}</div>
                            <div><button onClick={() => { setEditingReportId(report.id); setReportEditForm({ ...report }); setExpandedRow(null) }} style={{ background: '#1C2A3A', border: 'none', color: '#7A90A8', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Edit</button></div>
                          </div>
                          {isExpanded && hasNotes && (
                            <div style={{ padding: '10px 16px 14px', background: '#111820', borderTop: '1px solid #1C2A3A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              {report.win_of_day && <div><div style={{ fontSize: '9px', color: '#00E5A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Win of Day</div><div style={{ fontSize: '12px', color: '#7A90A8', lineHeight: '1.5' }}>{report.win_of_day}</div></div>}
                              {report.struggles && <div><div style={{ fontSize: '9px', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Struggles</div><div style={{ fontSize: '12px', color: '#7A90A8', lineHeight: '1.5' }}>{report.struggles}</div></div>}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ padding: '12px 16px', background: 'rgba(0,229,160,0.03)', borderLeft: '2px solid #00E5A044' }}>
                          <div style={{ fontSize: '10px', color: '#00E5A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: '700' }}>Editing — {formatDate(report.report_date)}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
                            {[
                              { label: 'Date', field: 'report_date', type: 'date' },
                              { label: 'Appointments', field: 'appointments_set', type: 'number' },
                              { label: 'Sits', field: 'sits', type: 'number' },
                              { label: 'Sales', field: 'sales', type: 'number' },
                              { label: 'ALP ($)', field: 'alp_written', type: 'number' },
                              { label: 'Ref Appts', field: 'referral_appointments', type: 'number' },
                              { label: 'Ref Sits', field: 'referral_sits', type: 'number' },
                              { label: 'Ref Sales', field: 'referral_sales', type: 'number' },
                              { label: 'Ref ALP ($)', field: 'referral_alp', type: 'number' },
                            ].map(({ label, field, type }) => (
                              <div key={field}>
                                <div style={{ fontSize: '9px', color: '#3D5068', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
                                <input type={type} style={smallInputStyle}
                                  value={(reportEditForm as any)[field] ?? (type === 'date' ? '' : 0)}
                                  onChange={e => setReportEditForm(f => ({ ...f, [field]: type === 'number' ? (field.includes('alp') ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0) : e.target.value }))} />
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            {[{ label: 'Win of Day', field: 'win_of_day' }, { label: 'Struggles', field: 'struggles' }].map(({ label, field }) => (
                              <div key={field}>
                                <div style={{ fontSize: '9px', color: '#3D5068', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
                                <input type="text" style={smallInputStyle} value={(reportEditForm as any)[field] || ''} onChange={e => setReportEditForm(f => ({ ...f, [field]: e.target.value }))} placeholder="Optional" />
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={saveReportEdit} disabled={savingReport} style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: '6px', padding: '7px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>{savingReport ? 'Saving...' : '✓ Save'}</button>
                            <button onClick={() => { setEditingReportId(null); setReportEditForm({}) }} style={{ background: 'transparent', border: '1px solid #1C2A3A', color: '#7A90A8', borderRadius: '6px', padding: '7px 14px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #1C2A3A' }}>
                    <span style={{ fontSize: '11px', color: '#3D5068' }}>{reportPage * PAGE_SIZE + 1}–{Math.min((reportPage + 1) * PAGE_SIZE, reportTotal)} of {reportTotal} reports</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setReportPage(p => Math.max(0, p - 1))} disabled={reportPage === 0} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', border: '1px solid #1C2A3A', background: 'transparent', color: reportPage === 0 ? '#3D5068' : '#7A90A8', cursor: reportPage === 0 ? 'not-allowed' : 'pointer' }}>← Prev</button>
                      <span style={{ padding: '5px 10px', fontSize: '11px', color: '#3D5068' }}>{reportPage + 1} / {totalPages}</span>
                      <button onClick={() => setReportPage(p => Math.min(totalPages - 1, p + 1))} disabled={reportPage >= totalPages - 1} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', border: '1px solid #1C2A3A', background: 'transparent', color: reportPage >= totalPages - 1 ? '#3D5068' : '#7A90A8', cursor: reportPage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>Next →</button>
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
            <textarea rows={3} value={coachingNote} onChange={e => setCoachingNote(e.target.value)} placeholder="Enter coaching notes, action items, follow-ups..."
              style={{ width: '100%', background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '6px', padding: '8px', color: '#ECF0F5', fontSize: '12px', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            <button onClick={handleAddNote} style={{ marginTop: '8px', background: '#00E5A0', color: '#000', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Save Note</button>
          </div>
          {coaching.length > 0 ? coaching.map((note: string, i: number) => (
            <div key={i} style={{ padding: '12px', background: '#111820', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', color: '#7A90A8', lineHeight: '1.6' }}>{note}</div>
          )) : (
            <div style={{ textAlign: 'center', color: '#3D5068', fontSize: '12px', padding: '20px' }}>No coaching sessions recorded yet.</div>
          )}
        </div>
      )}
    </div>
  )
}
