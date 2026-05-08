import { leadTypeLabel } from '@/lib/utils'

const LEAD_TYPES = [
  { type: 'union', threshold: '250 ALP', close: 44, alpPerLead: 248, bestDay: 'Tuesday', color: 'green' },
  { type: 'veteran', threshold: '250 ALP', close: 39, alpPerLead: 221, bestDay: 'Wednesday', color: 'blue' },
  { type: 'policy_owner_service', threshold: '350 ALP', close: 61, alpPerLead: 347, bestDay: 'Monday', color: 'purple' },
  { type: 'new_agent_pack', threshold: 'N/A', close: 28, alpPerLead: 142, bestDay: 'Thursday', color: 'amber' },
  { type: 'referral', threshold: 'N/A', close: 62, alpPerLead: 412, bestDay: 'Any', color: 'green' },
]

const LEAD_DIST = [
  { name: 'Marcus W.', leads: 42, color: '#F59E0B' },
  { name: 'DeShawn T.', leads: 31, color: '#3B82F6' },
  { name: 'Jordan R.', leads: 35, color: '#00E5A0' },
  { name: 'Priya S.', leads: 28, color: '#A78BFA' },
  { name: 'Keisha M.', leads: 20, color: '#F59E0B' },
]

const badgeMap: Record<string, string> = { green: 'badge-green', blue: 'badge-blue', purple: 'badge-purple', amber: 'badge-amber' }

export default function LeadsPage() {
  const maxLeads = Math.max(...LEAD_DIST.map(l => l.leads))

  return (
    <div className="space-y-5 animate-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Active Leads', value: '218', color: 'green', sub: 'Across all agents' },
          { label: 'ALP per Lead', value: '$203', color: 'blue', sub: 'Blended average' },
          { label: 'Unconverted Leads', value: '47', color: 'amber', sub: '14+ days no contact' },
          { label: 'Inactive Leads', value: '12', color: 'red', sub: 'Redistribution needed' },
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
          <div className="panel-head"><div className="panel-title">Lead Performance by Type</div></div>
          <div className="p-0">
            <table className="data-table w-full">
              <thead><tr><th>Type</th><th>ALP Threshold</th><th>Close %</th><th>ALP/Lead</th><th>Best Day</th></tr></thead>
              <tbody>
                {LEAD_TYPES.map(l => (
                  <tr key={l.type}>
                    <td><span className={`badge ${badgeMap[l.color]}`}>{leadTypeLabel(l.type)}</span></td>
                    <td className="font-mono text-xs text-text-muted">{l.threshold}</td>
                    <td className={`font-mono text-xs text-accent-${l.color === 'blue' ? 'blue2' : l.color === 'amber' ? 'amber' : 'green'}`}>{l.close}%</td>
                    <td className={`font-mono text-xs text-accent-${l.color === 'blue' ? 'blue2' : l.color === 'amber' ? 'amber' : 'green'}`}>${l.alpPerLead}</td>
                    <td className="text-xs text-text-muted">{l.bestDay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><div className="panel-title">Lead Distribution by Agent</div></div>
          <div className="p-4 space-y-3">
            {LEAD_DIST.map(l => (
              <div key={l.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-soft">{l.name}</span>
                  <span className="font-mono" style={{ color: l.color }}>{l.leads} leads</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.round(l.leads / maxLeads * 100)}%`, background: l.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><div className="panel-title">Lead Intelligence Alerts</div></div>
        <div className="p-4 space-y-2">
          {[
            { type: 'red', msg: '<strong>12 leads</strong> assigned to inactive agents — Carlos V., Destiny H. Recommend redistribution to Jordan R. or Keisha M. immediately.' },
            { type: 'amber', msg: '<strong>Policy Owner Service leads</strong> converting at 61% — highest of all types. Prioritize these for top producers over union leads this week.' },
            { type: 'green', msg: '<strong>Referral leads</strong> converting at 62% with $412 ALP/lead. Marcus W. generates 2.1 refs/sale vs 1.8 team avg. Share his referral approach in next meeting.' },
          ].map((a, i) => (
            <div key={i} className={`alert alert-${a.type}`}>
              <span className="text-xs flex-1 text-text" dangerouslySetInnerHTML={{ __html: a.msg }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
