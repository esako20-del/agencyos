'use client'
import { useState, useEffect } from 'react'

type Period = 'daily' | 'weekly' | 'monthly'

interface StatEntry {
  id: string
  period: string
  label: string
  alp: number
  refAlp: number
  appointments: number
  sits: number
  sales: number
  refAppointments: number
  refSits: number
  refSales: number
}

function showRatio(appts: number, sits: number) {
  return appts > 0 ? Math.round((sits / appts) * 100) : 0
}

function closeRatio(sits: number, sales: number) {
  return sits > 0 ? Math.round((sales / sits) * 100) : 0
}

function fmt(val: number) {
  if (val === 0) return '$0'
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val}`
}

function getWeekLabel(date: Date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function generatePeriods(type: Period): StatEntry[] {
  const periods: StatEntry[] = []
  const now = new Date()

  if (type === 'daily') {
    for (let i = 0; i < 14; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const str = d.toISOString().split('T')[0]
      periods.push({
        id: str, period: str,
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        alp: 0, refAlp: 0, appointments: 0, sits: 0, sales: 0,
        refAppointments: 0, refSits: 0, refSales: 0,
      })
    }
  } else if (type === 'weekly') {
    for (let i = 0; i < 12; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const day = d.getDay()
      const diff = day === 0 ? -6 : 1 - day
      d.setDate(d.getDate() + diff)
      const str = d.toISOString().split('T')[0]
      periods.push({
        id: str, period: str,
        label: i === 0 ? `This Week (${getWeekLabel(d)})` : getWeekLabel(d),
        alp: 0, refAlp: 0, appointments: 0, sits: 0, sales: 0,
        refAppointments: 0, refSits: 0, refSales: 0,
      })
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      periods.push({
        id: str, period: str,
        label: i === 0 ? `This Month (${getMonthLabel(d)})` : getMonthLabel(d),
        alp: 0, refAlp: 0, appointments: 0, sits: 0, sales: 0,
        refAppointments: 0, refSits: 0, refSales: 0,
      })
    }
  }
  return periods
}

const inputStyle = {
  width: '100%', background: '#07090D', border: '1px solid #1C2A3A',
  borderRadius: '6px', padding: '6px 8px', color: '#ECF0F5',
  fontSize: '12px', outline: 'none', boxSizing: 'border-box' as const,
  textAlign: 'center' as const,
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('weekly')
  const [entries, setEntries] = useState<StatEntry[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<StatEntry>>({})
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const generated = generatePeriods(period)

      // Load from database
      try {
        const res = await fetch(`/api/analytics?period=${period}`)
        const { data } = await res.json()
        if (data && data.length > 0) {
          const merged = generated.map(g => {
            const saved = data.find((d: any) => d.period_id === g.id)
            if (saved) {
              return {
                ...g,
                alp: saved.alp || 0,
                refAlp: saved.ref_alp || 0,
                appointments: saved.appointments || 0,
                sits: saved.sits || 0,
                sales: saved.sales || 0,
                refAppointments: saved.ref_appointments || 0,
                refSits: saved.ref_sits || 0,
                refSales: saved.ref_sales || 0,
              }
            }
            return g
          })
          setEntries(merged)
        } else {
          setEntries(generated)
        }
      } catch (e) {
        setEntries(generated)
      }
      setLoading(false)
    }
    load()
  }, [period])

  function startEdit(entry: StatEntry) {
    setEditing(entry.id)
    setEditForm({ ...entry })
  }

  async function saveEdit() {
    if (!editing || !editForm) return
    setSaving(true)
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_type: period,
          period_id: editing,
          alp: editForm.alp || 0,
          ref_alp: editForm.refAlp || 0,
          appointments: editForm.appointments || 0,
          sits: editForm.sits || 0,
          sales: editForm.sales || 0,
          ref_appointments: editForm.refAppointments || 0,
          ref_sits: editForm.refSits || 0,
          ref_sales: editForm.refSales || 0,
        }),
      })
      setEntries(prev => prev.map(e => e.id === editing ? { ...e, ...editForm } as StatEntry : e))
      setEditing(null)
      setSavedMsg('✓ Saved!')
      setTimeout(() => setSavedMsg(''), 2000)
    } catch (e) {
      setSavedMsg('Error saving')
    }
    setSaving(false)
  }

  function field(key: keyof StatEntry, label: string) {
    return (
      <div>
        <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>{label}</div>
        <input
          type="number"
          style={inputStyle}
          value={(editForm as any)[key] || 0}
          onChange={e => setEditForm(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
        />
      </div>
    )
  }

  // Calculate YTD totals
  const ytdTotals = entries.reduce((acc, e) => ({
    alp: acc.alp + e.alp,
    refAlp: acc.refAlp + e.refAlp,
    appointments: acc.appointments + e.appointments,
    sits: acc.sits + e.sits,
    sales: acc.sales + e.sales,
    refAppointments: acc.refAppointments + e.refAppointments,
    refSits: acc.refSits + e.refSits,
    refSales: acc.refSales + e.refSales,
  }), { alp: 0, refAlp: 0, appointments: 0, sits: 0, sales: 0, refAppointments: 0, refSits: 0, refSales: 0 })

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#ECF0F5' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>Team Analytics</div>
          <div style={{ fontSize: '12px', color: '#7A90A8', marginTop: '2px' }}>View and edit historical team performance data</div>
        </div>
        {savedMsg && (
          <div style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', color: '#00E5A0' }}>
            {savedMsg}
          </div>
        )}
        {/* Period toggle */}
        <div style={{ display: 'flex', gap: '2px', background: '#111820', border: '1px solid #1C2A3A', padding: '3px', borderRadius: '8px' }}>
          {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '6px 14px', borderRadius: '5px', fontSize: '11px', fontWeight: '600',
              cursor: 'pointer', border: 'none', textTransform: 'capitalize',
              background: period === p ? '#0C1018' : 'transparent',
              color: period === p ? '#ECF0F5' : '#7A90A8',
            }}>
              {p === 'daily' ? 'Daily' : p === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* YTD Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Total ALP', value: fmt(ytdTotals.alp), color: '#00E5A0' },
          { label: 'Referral ALP', value: fmt(ytdTotals.refAlp), color: '#A78BFA' },
          { label: 'Show / Close', value: `${showRatio(ytdTotals.appointments, ytdTotals.sits)}% / ${closeRatio(ytdTotals.sits, ytdTotals.sales)}%`, color: '#3B82F6' },
          { label: 'Ref Show / Close', value: `${showRatio(ytdTotals.refAppointments, ytdTotals.refSits)}% / ${closeRatio(ytdTotals.refSits, ytdTotals.refSales)}%`, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0C1018', border: `1px solid ${s.color}22`, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{s.label} — All Periods</div>
          </div>
        ))}
      </div>

      {/* Data table */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#3D5068', padding: '40px' }}>Loading data...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {entries.map(entry => {
            const show = showRatio(entry.appointments, entry.sits)
            const close = closeRatio(entry.sits, entry.sales)
            const refShow = showRatio(entry.refAppointments, entry.refSits)
            const refClose = closeRatio(entry.refSits, entry.refSales)
            const isEditing = editing === entry.id
            const hasData = entry.alp > 0 || entry.sits > 0

            return (
              <div key={entry.id} style={{ background: '#0C1018', border: `1px solid ${isEditing ? '#00E5A044' : '#1C2A3A'}`, borderRadius: '12px', overflow: 'hidden' }}>

                {/* Row header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: isEditing ? '1px solid #1C2A3A' : 'none', background: isEditing ? 'rgba(0,229,160,0.03)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {hasData && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E5A0', boxShadow: '0 0 4px #00E5A0' }} />}
                    {!hasData && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1C2A3A' }} />}
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{entry.label}</span>
                  </div>

                  {!isEditing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <span style={{ fontSize: '12px', color: '#00E5A0', fontWeight: '600' }}>{fmt(entry.alp)}</span>
                        <span style={{ fontSize: '12px', color: '#A78BFA' }}>Ref: {fmt(entry.refAlp)}</span>
                        <span style={{ fontSize: '12px', color: '#3B82F6' }}>{show}% / {close}%</span>
                        <span style={{ fontSize: '12px', color: '#F59E0B' }}>Ref: {refShow}% / {refClose}%</span>
                      </div>
                      <button onClick={() => startEdit(entry)} style={{ background: '#111820', border: '1px solid #1C2A3A', color: '#7A90A8', borderRadius: '6px', padding: '5px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                        ✏️ Edit
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setEditing(null)} style={{ background: '#111820', border: '1px solid #1C2A3A', color: '#7A90A8', borderRadius: '6px', padding: '5px 12px', fontSize: '11px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button onClick={saveEdit} disabled={saving} style={{ background: '#00E5A0', border: 'none', color: '#000', borderRadius: '6px', padding: '5px 14px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                        {saving ? 'Saving...' : '✓ Save'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ gridColumn: 'span 4', fontSize: '10px', color: '#00E5A0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Team Production</div>
                      {field('alp', 'Total ALP ($)')}
                      {field('appointments', 'Appointments')}
                      {field('sits', 'Sits')}
                      {field('sales', 'Sales')}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      <div style={{ gridColumn: 'span 4', fontSize: '10px', color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Referral Activity</div>
                      {field('refAlp', 'Referral ALP ($)')}
                      {field('refAppointments', 'Ref Appointments')}
                      {field('refSits', 'Ref Sits')}
                      {field('refSales', 'Ref Sales')}
                    </div>
                    <div style={{ marginTop: '12px', padding: '10px', background: '#111820', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Show Ratio</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#3B82F6' }}>{showRatio(editForm.appointments || 0, editForm.sits || 0)}%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Close Ratio</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#3B82F6' }}>{closeRatio(editForm.sits || 0, editForm.sales || 0)}%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Ref Show Ratio</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#F59E0B' }}>{showRatio(editForm.refAppointments || 0, editForm.refSits || 0)}%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Ref Close Ratio</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#F59E0B' }}>{closeRatio(editForm.refSits || 0, editForm.refSales || 0)}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
