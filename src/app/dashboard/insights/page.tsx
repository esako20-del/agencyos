import { cn } from '@/lib/utils'

const INSIGHTS = [
  { icon: '⚠', type: 'red', priority: 'HIGH', title: 'Tyler B. — Coaching Intervention Needed',
    desc: '0 sales in 9 consecutive days. Close rate dropped from 31% to 0%. Schedule immediate 1:1 coaching session and review his sit recordings. Check if he is getting enough sits — low sit count may be the root issue.',
    action: 'Schedule Coaching →' },
  { icon: '⚠', type: 'red', priority: 'HIGH', title: '4 Agents Missing Tonight\'s Report',
    desc: 'Carlos V., Destiny H., Tyler B., and Aisha N. have not submitted daily activity. Automated SMS was sent at 8:00 PM with no response. Manual follow-up recommended by manager.',
    action: 'View Report Status →' },
  { icon: '📉', type: 'amber', priority: 'MED', title: 'Personal ALP Below $200K Pace',
    desc: 'At $14.8K this month you need $16.8K/month for the remainder of the year to hit $200K. Protect 3 dedicated field days per week. Reduce admin time — delegate report review to your managers.',
    action: 'View Blueprint →' },
  { icon: '📉', type: 'amber', priority: 'MED', title: 'Recruiting Pace Below Target',
    desc: 'Current pace: 1.2 licensed agents/month. Goal pace: 2.0/month to hit 26 total agents by year end. You need 2 more introductory meetings per week. Vendor + social combined.',
    action: 'View Pipeline →' },
  { icon: '📈', type: 'green', priority: 'MED', title: 'Jordan R. Ready for Tier Promotion',
    desc: 'Averaging $10,200/month for 4 consecutive months. Ready to be promoted to Consistent tier and unlock Union + Veteran lead access. This also helps unlock your next team bonus tier.',
    action: 'Update Tier →' },
  { icon: '🎯', type: 'green', priority: 'MED', title: 'POS Leads Converting at 61% — Underutilized',
    desc: 'Policy Owner Service leads convert 17 points higher than union leads. Your top 2 producers are not currently using POS leads. Reassign some POS inventory to Marcus W. and DeShawn T. this week.',
    action: 'Reassign Leads →' },
  { icon: '🔄', type: 'amber', priority: 'LOW', title: 'Referral Rate Declining in Training Tier',
    desc: 'Training agents averaging 0.4 refs/sale vs 1.8 team average. Add referral scripting to Week 1 training content. Have Marcus W. demonstrate his referral close approach at next team meeting.',
    action: 'Update Training →' },
  { icon: '🏆', type: 'green', priority: 'LOW', title: 'Codify Marcus W.\'s System for the Team',
    desc: '$230K last year. Averages 52 dials/day, 5.2 sits/day, 58% close rate, 2.1 refs/sale. Schedule a monthly debrief with Marcus — his exact daily workflow can be documented and shared as the team standard.',
    action: 'View Profile →' },
]

export default function InsightsPage() {
  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center text-lg">✦</div>
        <div>
          <div className="font-display font-bold text-sm tracking-wide">AI Business Intelligence Engine</div>
          <div className="text-xs text-text-muted">Analyzing your agency in real time · {INSIGHTS.length} insights detected</div>
        </div>
      </div>

      <div className="space-y-3">
        {INSIGHTS.map((ins, i) => {
          const borderMap = { red: 'border-accent-red/20 hover:border-accent-red/40', amber: 'border-accent-amber/20 hover:border-accent-amber/40', green: 'border-accent-green/15 hover:border-accent-green/30' }
          const bgMap = { red: 'bg-accent-red/[0.03]', amber: 'bg-accent-amber/[0.03]', green: 'bg-accent-green/[0.03]' }
          const priorityMap = { red: 'badge-red', amber: 'badge-amber', green: 'badge-green' }
          const actionColorMap = { red: 'text-accent-red', amber: 'text-accent-amber', green: 'text-accent-green' }

          return (
            <div key={i} className={cn('flex gap-3 p-4 rounded-xl border transition-all cursor-pointer', borderMap[ins.type as keyof typeof borderMap], bgMap[ins.type as keyof typeof bgMap])}>
              <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-base flex-shrink-0">{ins.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm font-semibold">{ins.title}</div>
                  <span className={cn('badge', priorityMap[ins.type as keyof typeof priorityMap])}>{ins.priority}</span>
                </div>
                <div className="text-xs text-text-soft leading-relaxed mb-2">{ins.desc}</div>
                <div className={cn('text-[10px] font-mono font-medium', actionColorMap[ins.type as keyof typeof actionColorMap])}>{ins.action}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
