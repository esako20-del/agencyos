import { calcPercent, formatCurrency } from '@/lib/utils'

const GOALS = [
  { name: 'Personal ALP — Annual', current: 74000, target: 200000, unit: '$', pacing: 'Nov 2026' },
  { name: 'Team ALP — Annual', current: 182000, target: 500000, unit: '$', pacing: 'Dec 2026' },
  { name: 'Consistent Producers', current: 4, target: 8, unit: '', pacing: 'Sep 2026' },
  { name: 'Total Agent Count', current: 13, target: 26, unit: '', pacing: 'Need +2/mo' },
  { name: 'Personal Monthly ALP', current: 14800, target: 16700, unit: '$', pacing: 'On track' },
  { name: 'Team Monthly ALP', current: 37200, target: 50000, unit: '$', pacing: 'On track' },
]

const FORECASTS = [
  { label: 'Hit $200K personal ALP', status: 'on-track', date: 'Nov 2026' },
  { label: 'Reach 6 consistent agents', status: 'watch', date: 'Sep 2026' },
  { label: '26 total agents this year', status: 'at-risk', date: 'Need +2/mo' },
  { label: 'Team ALP $500K+', status: 'on-track', date: 'Dec 2026' },
]

function fmt(v: number, unit: string) {
  return unit === '$' ? formatCurrency(v, true) : String(v)
}

export default function GoalsPage() {
  return (
    <div className="space-y-5 animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Annual Goals — 2026</div></div>
          <div className="p-4 space-y-5">
            {GOALS.map(g => {
              const pct = calcPercent(g.current, g.target)
              const color = pct >= 75 ? '#00E5A0' : pct >= 50 ? '#F59E0B' : '#EF4444'
              return (
                <div key={g.name}>
                  <div className="flex items-end justify-between mb-1.5">
                    <div>
                      <div className="text-sm font-semibold">{g.name}</div>
                      <div className="text-[10px] text-text-muted font-mono mt-0.5">
                        {fmt(g.current, g.unit)} / {fmt(g.target, g.unit)}
                      </div>
                    </div>
                    <div className="font-display font-bold text-base" style={{ color }}>{pct}%</div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><div className="panel-title">Goal Pacing Forecast</div></div>
          <div className="p-4">
            <div className="text-sm text-text-soft font-display mb-4">At current pace you will:</div>
            <div className="space-y-2 mb-5">
              {FORECASTS.map(f => {
                const styles = {
                  'on-track': 'bg-accent-green/5 border-accent-green/15 text-accent-green',
                  'watch': 'bg-accent-amber/5 border-accent-amber/15 text-accent-amber',
                  'at-risk': 'bg-accent-red/5 border-accent-red/15 text-accent-red',
                }
                const icons = { 'on-track': '✓', 'watch': '⚡', 'at-risk': '✗' }
                return (
                  <div key={f.label} className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${styles[f.status as keyof typeof styles]}`}>
                    <span className="text-sm">
                      <span className="mr-2">{icons[f.status as keyof typeof icons]}</span>
                      <span className="text-text">{f.label}</span>
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">{f.date}</span>
                  </div>
                )
              })}
            </div>
            <div className="bg-surface-2 rounded-lg p-3">
              <div className="text-[9px] text-text-muted uppercase tracking-widest font-mono mb-2">To Accelerate Recruiting</div>
              <div className="text-sm text-text-soft">
                You need to license <strong className="text-accent-amber">2 new agents per month</strong> to hit 26 by year end. Current pace: 1.2/mo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
