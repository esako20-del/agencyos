import { formatCurrency } from '@/lib/utils'
import { DailyReport } from '@/types'

function StatBox({ label, value, color = 'text-accent-green' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-surface-2 rounded-lg p-2.5 text-center">
      <div className={`font-display text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[9px] text-text-muted uppercase tracking-wide font-mono mt-0.5">{label}</div>
    </div>
  )
}

export function TodayActivity({ totals }: { totals: any }) {
  const closeRate = totals.sits > 0 ? Math.round((totals.sales / totals.sits) * 100) : 0
  const apptKept = totals.appointments > 0 ? Math.round((totals.sits / totals.appointments) * 100) : 0

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">Today's Team Activity</div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <StatBox label="Dials" value={totals.dials || 284} />
          <StatBox label="Appts" value={totals.appointments || 31} color="text-accent-blue2" />
          <StatBox label="Sits" value={totals.sits || 22} color="text-accent-amber" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="Sales" value={totals.sales || 9} />
          <StatBox label="ALP Written" value={formatCurrency(totals.alp || 8400, true)} color="text-accent-blue2" />
        </div>

        <div className="border-t border-border pt-3">
          <div className="text-[9px] text-text-muted uppercase tracking-widest font-mono mb-2">Referral Activity</div>
          <div className="grid grid-cols-2 gap-2">
            <StatBox label="Ref Appts" value={totals.refAppts || 8} color="text-accent-purple" />
            <StatBox label="Ref Sits" value={totals.refSits || 5} color="text-accent-purple" />
            <StatBox label="Ref Sales" value={totals.refSales || 3} color="text-accent-purple" />
            <StatBox label="Ref ALP" value={formatCurrency(totals.refAlp || 2800, true)} color="text-accent-purple" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
          <div className="text-center">
            <div className="text-[10px] text-text-muted">Close Rate</div>
            <div className={`font-display font-bold text-base ${closeRate >= 40 ? 'text-accent-green' : 'text-accent-amber'}`}>{closeRate || 41}%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-text-muted">Appt Kept</div>
            <div className={`font-display font-bold text-base ${apptKept >= 65 ? 'text-accent-green' : 'text-accent-amber'}`}>{apptKept || 71}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TodayActivity

const FEED_ITEMS = [
  { color: 'bg-accent-green', text: '<strong>Marcus W.</strong> submitted daily report — 3 sales, $2,800 ALP', time: '8:41 PM' },
  { color: 'bg-accent-green', text: '<strong>Jordan R.</strong> submitted daily report — 2 sales, $1,800 ALP', time: '8:38 PM' },
  { color: 'bg-accent-red', text: 'Automated SMS sent to <strong>4 agents</strong> for missing reports', time: '8:00 PM' },
  { color: 'bg-accent-blue2', text: '<strong>DeShawn T.</strong> submitted daily report — 2 sales, $1,900 ALP', time: '7:52 PM' },
  { color: 'bg-accent-amber', text: '<strong>Nia Johnson</strong> (recruit) completed Week 2 training checklist', time: '5:30 PM' },
  { color: 'bg-accent-green', text: '<strong>Priya S.</strong> submitted daily report — 1 sale, $1,100 ALP', time: '5:12 PM' },
  { color: 'bg-accent-amber', text: 'Goal alert: Team ALP at 74% of monthly goal with 8 days remaining', time: '12:00 PM' },
]

export function ActivityFeed({ reports }: { reports: DailyReport[] }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">Activity Feed</div>
        <button className="text-[10px] text-text-muted font-mono hover:text-text">Clear</button>
      </div>
      <div className="divide-y divide-border/40">
        {FEED_ITEMS.map((item, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-2.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${item.color}`} />
            <div className="flex-1 text-[11px] text-text-soft leading-relaxed"
              dangerouslySetInnerHTML={{ __html: item.text }} />
            <div className="text-[10px] text-text-muted font-mono flex-shrink-0">{item.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
