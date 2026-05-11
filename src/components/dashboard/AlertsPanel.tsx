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
  const alerts: Alert[] = [
    {
      type: 'red',
      message: '<strong>4 agents</strong> have not submitted tonight\'s report. Automated SMS sent.',
      time: '8:42 PM',
    },
    {
      type: 'amber',
      message: '<strong>Alyssa H.</strong> has had 0 sales this week — coaching intervention recommended.',
      time: 'EOD',
    },
    {
      type: 'green',
      message: '<strong>Caitlyn R.</strong> hit $9,800 this month — on pace for $117K annual. Great momentum!',
      time: 'Today',
    },
    {
      type: 'amber',
      message: '<strong>Jorge R.</strong> (training) has been in training for 10 days — check release readiness.',
      time: 'Training',
    },
  ]

  return (
    <div>
      <div className="text-[9px] text-text-muted uppercase tracking-[2px] font-mono mb-2">Live Alerts</div>
      {alerts.map((a, i) => <AlertRow key={i} {...a} />)}
    </div>
  )
}
