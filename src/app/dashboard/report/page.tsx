'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const AGENTS = ['Marcus W.', 'DeShawn T.', 'Priya S.', 'Jordan R.', 'Keisha M.', 'Tyler B.', 'Aisha N.', 'Carlos V.', 'Destiny H.', 'Omar F.', 'Grace L.', 'Brandon K.', 'Tamara J.']

const SUBMISSIONS = [
  { name: 'Marcus W.', time: '8:41 PM', alp: '$2,800', submitted: true },
  { name: 'DeShawn T.', time: '7:52 PM', alp: '$1,900', submitted: true },
  { name: 'Priya S.', time: '5:12 PM', alp: '$1,100', submitted: true },
  { name: 'Jordan R.', time: '8:38 PM', alp: '$1,800', submitted: true },
  { name: 'Keisha M.', time: '6:30 PM', alp: '$800', submitted: true },
  { name: 'Tyler B.', time: '—', alp: '—', submitted: false },
  { name: 'Aisha N.', time: '—', alp: '—', submitted: false },
  { name: 'Carlos V.', time: '—', alp: '—', submitted: false },
  { name: 'Destiny H.', time: '—', alp: '—', submitted: false },
]

function Field({ label, id, type = 'number' }: { label: string; id: string; type?: string }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input id={id} type={type} min="0" className="form-input" placeholder="0" />
    </div>
  )
}

export default function ReportPage() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    toast.success('Report submitted! Dashboard updated. Managers notified.')
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in">
      {/* Form */}
      <div className="panel">
        <div className="panel-head"><div className="panel-title">Submit Daily Report</div></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="form-label">Agent</label>
            <select className="form-select">
              <option value="">Select agent...</option>
              {AGENTS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Dials" id="dials" />
            <Field label="Appointments Set" id="appts" />
            <Field label="Sits" id="sits" />
            <Field label="Sales" id="sales" />
          </div>
          <Field label="ALP Written ($)" id="alp" />

          <div className="border-t border-border pt-3">
            <div className="text-[9px] text-text-muted uppercase tracking-widest font-mono mb-3">Referral Activity</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ref Appointments" id="ref-appts" />
              <Field label="Ref Sits" id="ref-sits" />
              <Field label="Ref Sales" id="ref-sales" />
              <Field label="Ref ALP ($)" id="ref-alp" />
            </div>
          </div>

          <div>
            <label className="form-label">Win of the Day</label>
            <input type="text" className="form-input" placeholder="What went well today?" />
          </div>
          <div>
            <label className="form-label">Notes / Struggles</label>
            <textarea rows={3} className="form-input resize-none" placeholder="Any challenges or notes for manager..." />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Submitting...' : 'Submit Daily Report'}
          </button>
        </form>
      </div>

      {/* Status panel */}
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Today's Submission Status</div>
          <div className="text-[10px] font-mono text-text-muted">
            {SUBMISSIONS.filter(s => s.submitted).length}/{SUBMISSIONS.length} submitted
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {SUBMISSIONS.map(s => (
            <div key={s.name} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.submitted ? 'bg-accent-green shadow-[0_0_5px_#00E5A0]' : 'bg-accent-red shadow-[0_0_5px_#EF4444]'}`} />
                <span className="text-sm font-medium">{s.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-mono text-xs ${s.submitted ? 'text-accent-green' : 'text-accent-red'}`}>{s.alp}</span>
                <span className="text-[10px] text-text-muted font-mono">{s.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <div className="bg-accent-red/5 border border-accent-red/15 rounded-lg p-3">
            <div className="text-xs text-accent-red font-semibold mb-1">⚠ 4 Missing Reports</div>
            <div className="text-[11px] text-text-soft">Automated SMS sent at 8:00 PM. Consider manual follow-up with Tyler B. who has shown declining activity this week.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
