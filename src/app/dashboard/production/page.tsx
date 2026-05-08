import { formatCurrency, calcPercent } from '@/lib/utils'

const PERSONAL_YTD = 74000
const PERSONAL_GOAL = 200000
const MONTHS_REMAINING = 7.5
const NEEDED_PER_MONTH = Math.ceil((PERSONAL_GOAL - PERSONAL_YTD) / MONTHS_REMAINING)
const pct = calcPercent(PERSONAL_YTD, PERSONAL_GOAL)

export default function ProductionPage() {
  return (
    <div className="space-y-5 animate-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Personal ALP — YTD', value: formatCurrency(PERSONAL_YTD, true), sub: `Goal: ${formatCurrency(PERSONAL_GOAL, true)} · ${pct}% done`, color: 'green' },
          { label: 'This Month', value: '$14.8K', sub: `${formatCurrency(NEEDED_PER_MONTH, true)}/mo needed`, color: 'blue' },
          { label: 'Close Rate', value: '48%', sub: 'Team avg: 42%', color: 'amber' },
          { label: 'Avg ALP / Sale', value: '$987', sub: 'Goal: $1,000+', color: 'green' },
        ].map(k => (
          <div key={k.label} className={`kpi-card ${k.color}`}>
            <div className="text-[9px] text-text-muted uppercase tracking-[1.5px] font-mono mb-2">{k.label}</div>
            <div className={`font-display text-2xl font-bold ${k.color === 'blue' ? 'text-accent-blue2' : k.color === 'amber' ? 'text-accent-amber' : 'text-accent-green'}`}>{k.value}</div>
            <div className="text-[10px] text-text-muted mt-1.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel">
          <div className="panel-head"><div className="panel-title">$200K Annual Goal Progress</div></div>
          <div className="p-5">
            <div className="text-center mb-5">
              <div className="font-display text-6xl font-black text-accent-green">{pct}%</div>
              <div className="text-xs text-text-muted font-mono mt-1">{formatCurrency(PERSONAL_YTD)} of {formatCurrency(PERSONAL_GOAL)} written</div>
            </div>
            <div className="progress-bar h-2.5 mb-4">
              <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00E5A0, #00B87A)' }} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[10px] text-text-muted">Remaining</div>
                <div className="font-display font-bold text-accent-red">{formatCurrency(PERSONAL_GOAL - PERSONAL_YTD, true)}</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted">Months Left</div>
                <div className="font-display font-bold text-accent-amber">{MONTHS_REMAINING}</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted">Needed/Month</div>
                <div className="font-display font-bold text-accent-blue2">{formatCurrency(NEEDED_PER_MONTH, true)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><div className="panel-title">Activity Blueprint to Hit {formatCurrency(NEEDED_PER_MONTH, true)}/mo</div></div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Daily Dials', value: '40–45', color: 'text-accent-green' },
              { label: 'Daily Appointments', value: '4–5', color: 'text-accent-green' },
              { label: 'Daily Sits', value: '3', color: 'text-accent-amber' },
              { label: 'Weekly Sales', value: '4', color: 'text-accent-blue2' },
              { label: 'Monthly ALP Target', value: formatCurrency(NEEDED_PER_MONTH, true), color: 'text-accent-green', highlight: true },
            ].map(item => (
              <div key={item.label}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${item.highlight ? 'bg-accent-green/5 border border-accent-green/15' : 'bg-surface-2'}`}>
                <span className={`text-sm ${item.highlight ? 'text-accent-green' : 'text-text-soft'}`}>{item.label}</span>
                <span className={`font-display font-bold text-base ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Your Conversion Funnel</div></div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Dials → Contacts', rate: '22%', color: 'text-accent-blue2' },
              { label: 'Contacts → Appointments', rate: '48%', color: 'text-accent-blue2' },
              { label: 'Appointments → Sits', rate: '74%', color: 'text-accent-amber' },
              { label: 'Sits → Sales', rate: '48%', color: 'text-accent-green' },
              { label: 'Dials → Sale (Overall)', rate: '1 in 8', color: 'text-accent-green', highlight: true },
            ].map(item => (
              <div key={item.label}
                className={`flex justify-between items-center px-3 py-2 rounded-lg ${item.highlight ? 'bg-accent-green/5 border border-accent-green/15' : 'bg-surface-2'}`}>
                <span className={`text-sm ${item.highlight ? 'text-accent-green' : 'text-text-soft'}`}>{item.label}</span>
                <span className={`font-mono text-sm font-medium ${item.color}`}>{item.rate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><div className="panel-title">Learn From Marcus W. — $230K Last Year</div></div>
          <div className="p-4">
            <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent-amber/20 flex items-center justify-center font-bold text-accent-amber text-sm">MW</div>
              <div>
                <div className="font-semibold text-sm">Marcus W.</div>
                <div className="text-[11px] text-accent-amber">$230K last year · $182K YTD</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Avg Daily Dials', you: '38', marcus: '52' },
                { label: 'Avg Daily Sits', you: '3.1', marcus: '5.2' },
                { label: 'Close Rate', you: '48%', marcus: '58%' },
                { label: 'Refs Per Sale', you: '1.6', marcus: '2.1' },
                { label: 'Avg ALP / Sale', you: '$987', marcus: '$1,043' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-[11px] py-1 border-b border-border/40 last:border-0">
                  <span className="text-text-muted">{row.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-text-soft font-mono">You: {row.you}</span>
                    <span className="text-accent-green font-mono font-medium">MW: {row.marcus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
