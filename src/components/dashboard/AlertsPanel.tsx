import { cn } from '@/lib/utils'
import { AlertTriangle, Star, Info } from 'lucide-react'

interface Alert {
  type: 'red' | 'amber' | 'green'
  message: string
  time: string
}

function AlertRow({ type, message, time }: Alert) {
  const styles = {
    red: 'alert-red text-accent-red',
    amber: 'alert-amber text-accent-amber',
    green: 'alert-green text-accent-green',
  }
  const Icon = type === 'green' ? Star : type === 'amber' ? Info : AlertTriangle

  return (
    <div className={cn('alert mb-2', styles[type])}>
      <Icon size={14} className="flex-shrink-0 mt-0.5" />
      <span className="flex-1 text-text text-xs" dangerouslySetInnerHTML={{ __html: message }} />
      <span className="text-[10px] text-text-muted font-mono flex-shrink-0">{time}</span>
    </div>
  )
}

export default function AlertsPanel({ missingReports }: { missingReports: any[] }) {
  const missingNames = missingReports.map((r: any) => r.full_name).join(', ')

  const alerts: Alert[] = [
    ...(missingReports.length > 0 ? [{
      type: 'red' as const,
      message: `<strong>${missingReports.length} agents</strong> have not submitted tonight's report${missingNames ? ` — ${missingNames}` : ''}. Automated SMS sent.`,
      time: '8:42 PM',
    }] : []),
    {
      type: 'amber',
      message: '<strong>Tyler B.</strong> has had 0 sales for 9 consecutive days — coaching intervention recommended.',
      time: 'EOD',
    },
    {
      type: 'green',
      message: '<strong>Jordan R.</strong> hit $10,200 this month — on pace for $120K annual. Ready for Consistent tier promotion.',
      time: 'Today',
    },
    {
      type: 'amber',
      message: '<strong>Nia Johnson</strong> (recruit) has been in Training stage for 10 days — check release readiness.',
      time: 'Recruiting',
    },
  ]

  if (alerts.length === 0) return null

  return (
    <div>
      <div className="text-[9px] text-text-muted uppercase tracking-[2px] font-mono mb-2">Live Alerts</div>
      {alerts.map((a, i) => <AlertRow key={i} {...a} />)}
    </div>
  )
}
