'use client'
import { useState, useEffect } from 'react'

const ALL_AGENTS = [
  'Enri S.', 'Jonis H.', 'Caitlyn R.', 'Luis K.', 'Ardit M.',
  'Adrian B.', 'Dayell F.', 'Kelsey S.', 'Edlira S.', 'Matthew H.',
  'Drew C.', 'Nadirah M.', 'Tiffany S.', 'Jorge R.', 'Alyssa H.',
  'Llambi T.', 'Endi A.', 'Bruno N.',
]

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ReportPage() {
  const [date, setDate] = useState(todayStr())
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/reports?date=${date}`)
        const { data } = await res.json()
        setReports(data || [])
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [date])

  const totals = reports.reduce((acc, r) => ({
    appointments: acc.appointments + (r.appointments_set || 0),
    sits: acc.sits + (r.sits || 0),
    sales: acc.sales + (r.sales || 0),
    alp: acc.alp + (r.alp_written || 0),
    refAppts: acc.refAppts + (r.referral_appointments || 0),
    refSits: acc.refSits + (r.referral_sits || 0),
    refSales: acc.refSales + (r.referral_sales || 0),
    refAlp: acc.refAlp + (r.referral_alp || 0),
  }), { appointments: 0, sits: 0, sales: 0, alp: 0, refAppts: 0, refSits: 0, refSales: 0, refAlp: 0 })

  const submittedNames = reports.map(r => r.agent?.full_name || '')
  const missing = ALL_AGENTS.filter(name => !submittedNames.some(s => s.includes(name.split(' ')[0])))
  const closeRate = totals.sits > 0 ? Math.round((totals.sales / totals.sits) * 100) : 0
  const showRate = totals.appointments > 0 ? Math.round((totals.sits / totals.appointments) * 100) : 0

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#ECF0F5' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>Daily Report View</div>
          <div style={{ fontSize: '12px', color: '#7A90A8', marginTop: '2px' }}>{formatDate(date)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ background: '#111820', border: '1px solid #1C2A3A', borderRadius: '8px', padding: '7px 12px', color: '#ECF0F5', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
          />
          <button onClick={() => setDate(todayStr())}
            style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
            Today
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Submitted', value: reports.length, color: '#00E5A0' },
          { label: 'Missing', value: missing.length, color: '#EF4444' },
          { label: 'Total Sales', value: totals.sales, color: '#00E5A0' },
          { label: 'Total ALP', value: `$${(totals.alp / 1000).toFixed(1)}K`, color: '#60A5FA' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0C1018', border: `1px solid ${s.color}22`, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Team totals */}
      <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Team Totals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '12px' }}>
          {[
            { label: 'Appointments', value: totals.appointments, color: '#60A5FA' },
            { label: 'Sits', value: totals.sits, color: '#F59E0B' },
            { label: 'Sales', value: totals.sales, color: '#00E5A0' },
            { label: 'Show Rate', value: `${showRate}%`, color: '#3B82F6' },
            { label: 'Close Rate', value: `${closeRate}%`, color: closeRate >= 40 ? '#00E5A0' : '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ background: '#111820', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #1C2A3A', paddingTop: '12px' }}>
          <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Referral Activity</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { label: 'Ref Appts', value: totals.refAppts, color: '#A78BFA' },
              { label: 'Ref Sits', value: totals.refSits, color: '#A78BFA' },
              { label: 'Ref Sales', value: totals.refSales, color: '#A78BFA' },
              { label: 'Ref ALP', value: `$${(totals.refAlp / 1000).toFixed(1)}K`, color: '#A78BFA' },
            ].map(s => (
              <div key={s.label} style={{ background: '#111820', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Submitted */}
        <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1C2A3A' }}>
            <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Submitted ({reports.length})</div>
          </div>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#3D5068', fontSize: '12px' }}>Loading...</div>
          ) : reports.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#3D5068', fontSize: '12px' }}>No reports submitted yet for this date.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#111820' }}>
                  {['Agent', 'Appts', 'Sits', 'Sales', 'ALP', 'Time'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #1C2A3A' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => {
                  const time = r.submitted_at ? new Date(r.submitted_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(28,42,58,0.5)' }}>
                      <td style={{ padding: '8px 10px', fontSize: '12px', fontWeight: '600' }}>{r.agent?.full_name || '—'}</td>
                      <td style={{ padding: '8px 10px', fontSize: '12px', color: '#60A5FA' }}>{r.appointments_set || 0}</td>
                      <td style={{ padding: '8px 10px', fontSize: '12px', color: '#F59E0B' }}>{r.sits || 0}</td>
                      <td style={{ padding: '8px 10px', fontSize: '12px', color: '#00E5A0' }}>{r.sales || 0}</td>
                      <td style={{ padding: '8px 10px', fontSize: '12px', color: '#00E5A0' }}>${((r.alp_written || 0) / 1000).toFixed(1)}K</td>
                      <td style={{ padding: '8px 10px', fontSize: '11px', color: '#3D5068' }}>{time}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Missing + Notes */}
        <div style={{ background: '#0C1018', border: '1px solid #1C2A3A', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1C2A3A' }}>
            <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Missing Reports ({missing.length})</div>
          </div>
          {missing.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#00E5A0', fontSize: '12px' }}>
              🎉 All agents have submitted!
            </div>
          ) : (
            missing.map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(28,42,58,0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 5px #EF4444' }} />
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>{name}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: '600' }}>Not submitted</span>
              </div>
            ))
          )}

          {/* Agent notes */}
          {reports.some(r => r.win_of_day || r.struggles) && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #1C2A3A' }}>
              <div style={{ fontSize: '10px', color: '#7A90A8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Agent Notes</div>
              {reports.filter(r => r.win_of_day || r.struggles).map((r, i) => (
                <div key={i} style={{ background: '#111820', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#ECF0F5', marginBottom: '4px' }}>{r.agent?.full_name}</div>
                  {r.win_of_day && <div style={{ fontSize: '11px', color: '#00E5A0', marginBottom: '2px' }}>✓ {r.win_of_day}</div>}
                  {r.struggles && <div style={{ fontSize: '11px', color: '#F59E0B' }}>⚠ {r.struggles}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
