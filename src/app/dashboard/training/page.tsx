'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const TRAINEES = [
  { name: 'Keisha M.', stage: 'Released · Week 3', score: 72, tasks: [true, true, true, true, false, false, false] },
  { name: 'Tyler B.', stage: 'Training · Week 2 ⚠', score: 45, tasks: [true, true, true, false, false, false, false] },
  { name: 'Aisha N.', stage: 'Training · Week 1', score: 38, tasks: [true, true, false, false, false, false, false] },
  { name: 'Carlos V.', stage: 'Training · Week 3 🔴', score: 31, tasks: [true, true, false, false, false, false, false] },
]

const CHECKLIST = [
  'Online course complete',
  'State exam scheduled',
  'State exam passed',
  'Expectation meeting done',
  'Week 1 training (corporate)',
  'Week 2 training (role play)',
  'Release check presentation',
]

function ChecklistItem({ label }: { label: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <div className="flex items-center gap-2.5 py-1.5 border-b border-border/40 last:border-0 cursor-pointer" onClick={() => setChecked(!checked)}>
      <div className={cn('w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all', checked ? 'bg-accent-green/10 border border-accent-green' : 'border border-border bg-surface-2')}>
        {checked && <Check size={10} className="text-accent-green" />}
      </div>
      <span className={cn('text-xs', checked ? 'text-text-muted line-through' : 'text-text-soft')}>{label}</span>
    </div>
  )
}

export default function TrainingPage() {
  return (
    <div className="space-y-5 animate-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'In Training', value: '4', color: 'amber', sub: 'Active trainees' },
          { label: 'Released This Month', value: '2', color: 'green', sub: 'Brandon K. · Tamara J.' },
          { label: 'Avg Days to Release', value: '12d', color: 'blue', sub: 'From exam pass' },
          { label: 'Behind Schedule', value: '1', color: 'red', sub: 'Carlos V. — Day 18' },
        ].map(k => (
          <div key={k.label} className={`kpi-card ${k.color}`}>
            <div className="text-[9px] text-text-muted uppercase tracking-[1.5px] font-mono mb-2">{k.label}</div>
            <div className={`font-display text-2xl font-bold text-accent-${k.color === 'blue' ? 'blue2' : k.color === 'amber' ? 'amber' : k.color === 'red' ? 'red' : 'green'}`}>{k.value}</div>
            <div className="text-[10px] text-text-muted mt-1.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Trainee Progress</div></div>
          <div className="divide-y divide-border/50">
            {TRAINEES.map(t => {
              const color = t.score >= 70 ? '#00E5A0' : t.score >= 45 ? '#F59E0B' : '#EF4444'
              return (
                <div key={t.name} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-[10px] text-text-muted">{t.stage}</div>
                    </div>
                    <div className="font-display font-bold text-xl" style={{ color }}>
                      {t.score}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {t.tasks.map((done, i) => (
                      <div key={i} className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ background: done ? 'rgba(0,229,160,0.1)' : 'var(--color-surface-3)', border: `1px solid ${done ? '#00E5A0' : '#1C2A3A'}` }}>
                        {done && <Check size={9} className="text-accent-green" />}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><div className="panel-title">Onboarding Checklist Template</div></div>
          <div className="p-4">
            {CHECKLIST.map(item => <ChecklistItem key={item} label={item} />)}
          </div>
        </div>
      </div>

      {/* Activity-to-income blueprint */}
      <div className="panel">
        <div className="panel-head"><div className="panel-title">Activity-to-Income Blueprint — New Agent First Month</div></div>
        <div className="p-4">
          <div className="bg-surface-2 rounded-xl p-4 mb-3">
            <div className="text-[9px] text-accent-green font-mono tracking-widest mb-3">IF YOU FOLLOW THE SYSTEM · FIRST MONTH EARNINGS</div>
            <div className="grid grid-cols-5 gap-px bg-border rounded-lg overflow-hidden">
              {[
                { label: 'Daily Dials', value: '40', color: 'text-accent-green' },
                { label: 'Daily Sits', value: '3', color: 'text-accent-blue2' },
                { label: 'Weekly Sales', value: '3–4', color: 'text-accent-amber' },
                { label: 'Month ALP', value: '$8K', color: 'text-accent-purple' },
                { label: 'Commission', value: '$5–8K', color: 'text-accent-green', highlight: true },
              ].map(item => (
                <div key={item.label}
                  className={`p-3 text-center ${item.highlight ? 'bg-accent-green/5' : 'bg-surface-1'}`}>
                  <div className="text-[8px] text-text-muted uppercase tracking-wide mb-2 font-mono">{item.label}</div>
                  <div className={`font-display font-bold text-lg ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-text-muted text-center font-mono">
            Based on real agent results · Present this at every intro meeting
          </div>
        </div>
      </div>
    </div>
  )
}
