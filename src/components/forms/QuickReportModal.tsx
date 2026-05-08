'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabaseBrowser } from '@/lib/supabase'

const AGENTS = [
  { id: '1', name: 'Marcus W.' }, { id: '2', name: 'DeShawn T.' },
  { id: '3', name: 'Priya S.' }, { id: '4', name: 'Jordan R.' },
  { id: '5', name: 'Keisha M.' }, { id: '6', name: 'Tyler B.' },
  { id: '7', name: 'Aisha N.' }, { id: '8', name: 'Carlos V.' },
]

export default function QuickReportModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    agent_id: '', dials: '', appointments_set: '', sits: '',
    sales: '', alp_written: '', referral_appointments: '',
    referral_sits: '', referral_sales: '', referral_alp: '',
    win_of_day: '', struggles: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.agent_id) { toast.error('Please select an agent'); return }
    setLoading(true)
    // In production this calls the API route /api/reports
    await new Promise(r => setTimeout(r, 800))
    toast.success('Report submitted! Dashboard updated.')
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface-1 border border-border-2 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="font-display font-bold text-sm tracking-wide">Submit Daily Report</div>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="form-label">Agent</label>
            <select className="form-select" value={form.agent_id} onChange={e => set('agent_id', e.target.value)} required>
              <option value="">Select agent...</option>
              {AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { field: 'dials', label: 'Dials' },
              { field: 'appointments_set', label: 'Appointments Set' },
              { field: 'sits', label: 'Sits' },
              { field: 'sales', label: 'Sales' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="form-label">{label}</label>
                <input type="number" min="0" className="form-input" placeholder="0"
                  value={(form as any)[field]} onChange={e => set(field, e.target.value)} />
              </div>
            ))}
          </div>

          <div>
            <label className="form-label">ALP Written ($)</label>
            <input type="number" min="0" className="form-input" placeholder="0"
              value={form.alp_written} onChange={e => set('alp_written', e.target.value)} />
          </div>

          <div className="border-t border-border pt-3">
            <div className="text-[9px] text-text-muted uppercase tracking-widest font-mono mb-3">Referral Activity</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { field: 'referral_appointments', label: 'Ref Appointments' },
                { field: 'referral_sits', label: 'Ref Sits' },
                { field: 'referral_sales', label: 'Ref Sales' },
                { field: 'referral_alp', label: 'Ref ALP ($)' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="form-label">{label}</label>
                  <input type="number" min="0" className="form-input" placeholder="0"
                    value={(form as any)[field]} onChange={e => set(field, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Win of the Day</label>
            <input type="text" className="form-input" placeholder="What went well today?"
              value={form.win_of_day} onChange={e => set('win_of_day', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Notes / Struggles</label>
            <textarea rows={2} className="form-input resize-none" placeholder="Any challenges or notes for manager..."
              value={form.struggles} onChange={e => set('struggles', e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Submitting...' : 'Submit Daily Report'}
          </button>
        </form>
      </div>
    </div>
  )
}
