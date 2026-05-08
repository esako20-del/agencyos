import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AgentTier, AIInsight } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, compact = false): string {
  if (compact && value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function calcPercent(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

export function tierColor(tier: AgentTier): string {
  const map: Record<AgentTier, string> = {
    elite: 'text-accent-green border-accent-green/20 bg-accent-green/10',
    consistent: 'text-accent-blue2 border-accent-blue/20 bg-accent-blue/10',
    training: 'text-accent-amber border-accent-amber/20 bg-accent-amber/10',
    parttime: 'text-text-soft border-border bg-surface-2',
    new: 'text-accent-purple border-accent-purple/20 bg-accent-purple/10',
    inactive: 'text-text-muted border-border bg-surface-2',
    terminated: 'text-accent-red border-accent-red/20 bg-accent-red/10',
  }
  return map[tier] ?? map.new
}

export function tierLabel(tier: AgentTier): string {
  const map: Record<AgentTier, string> = {
    elite: 'Elite',
    consistent: 'Consistent',
    training: 'Training',
    parttime: 'Part Time',
    new: 'New',
    inactive: 'Inactive',
    terminated: 'Terminated',
  }
  return map[tier] ?? tier
}

export function healthColor(score: number): string {
  if (score >= 70) return 'text-accent-green'
  if (score >= 40) return 'text-accent-amber'
  return 'text-accent-red'
}

export function getStreakColor(streak: number): string {
  if (streak >= 14) return 'text-accent-green'
  if (streak >= 7) return 'text-accent-amber'
  if (streak > 0) return 'text-text-soft'
  return 'text-accent-red'
}

export function daysInStage(dateStr?: string): number {
  if (!dateStr) return 0
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function monthName(month: number): string {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1] ?? ''
}

export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

// AI Insights engine — generates insights from agency data
export function generateInsights(data: {
  agentsWithoutReports: string[]
  agentsWith0SalesStreak: Array<{ name: string; days: number }>
  personalAlpPace: number
  personalAlpGoal: number
  recruitingPace: number
  recruitingGoal: number
  topProducerStats?: { name: string; closeRate: number; avgDials: number }
  posLeadConversion?: number
  referralConversion?: number
}): AIInsight[] {
  const insights: AIInsight[] = []

  if (data.agentsWithoutReports.length > 0) {
    insights.push({
      id: 'missing-reports',
      type: 'warning',
      priority: 'high',
      title: `${data.agentsWithoutReports.length} agents missing tonight's report`,
      description: `${data.agentsWithoutReports.join(', ')} have not submitted. Automated SMS sent. Manual follow-up recommended.`,
      action: 'View Report Status',
      action_link: '/dashboard/reports',
    })
  }

  data.agentsWith0SalesStreak.forEach(agent => {
    if (agent.days >= 5) {
      insights.push({
        id: `0-sales-${agent.name}`,
        type: 'warning',
        priority: agent.days >= 9 ? 'high' : 'medium',
        title: `${agent.name} — Coaching intervention needed`,
        description: `${agent.days} consecutive days with 0 sales. Schedule an immediate 1:1 to review their sit approach and objection handling.`,
        action: 'Schedule Coaching',
        action_link: '/dashboard/team',
      })
    }
  })

  const personalPacePct = calcPercent(data.personalAlpPace, data.personalAlpGoal)
  if (personalPacePct < 85) {
    const monthlyNeeded = (data.personalAlpGoal - data.personalAlpPace) / getMonthsRemaining()
    insights.push({
      id: 'personal-alp-pace',
      type: 'warning',
      priority: 'high',
      title: 'Personal ALP below $200K pace',
      description: `You need $${Math.round(monthlyNeeded / 1000)}K/month for the remainder of the year. Protect dedicated field time — reduce admin delegation to managers.`,
      action: 'View Blueprint',
      action_link: '/dashboard/production',
    })
  }

  if (data.posLeadConversion && data.posLeadConversion > 55) {
    insights.push({
      id: 'pos-leads',
      type: 'opportunity',
      priority: 'medium',
      title: `Policy Owner Service leads converting at ${data.posLeadConversion}%`,
      description: 'POS leads are your highest-converting lead type. Ensure top producers have access and prioritize them this week.',
      action: 'Manage Lead Distribution',
      action_link: '/dashboard/leads',
    })
  }

  if (data.recruitingPace < data.recruitingGoal * 0.7) {
    insights.push({
      id: 'recruiting-pace',
      type: 'warning',
      priority: 'medium',
      title: 'Recruiting pace below target',
      description: `Current pace: ${data.recruitingPace.toFixed(1)} licensed/month. Need ${data.recruitingGoal}/month to double agent count. Add 2 more intro meetings per week.`,
      action: 'View Pipeline',
      action_link: '/dashboard/recruiting',
    })
  }

  if (data.topProducerStats) {
    insights.push({
      id: 'top-producer',
      type: 'opportunity',
      priority: 'low',
      title: `Learn from ${data.topProducerStats.name}'s system`,
      description: `${Math.round(data.topProducerStats.avgDials)} avg dials/day, ${data.topProducerStats.closeRate}% close rate. Codify their exact daily workflow and share it with developing agents.`,
      action: 'View Profile',
      action_link: '/dashboard/team',
    })
  }

  return insights.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}

function getMonthsRemaining(): number {
  const now = new Date()
  return 12 - now.getMonth()
}

export function recruitStageLabel(stage: string): string {
  const map: Record<string, string> = {
    sourced: 'Sourced',
    intro_meeting: 'Intro Meeting',
    intro_complete: 'Intro Done',
    course_started: 'Course',
    exam_pending: 'Exam Pending',
    exam_passed: 'Exam Passed',
    training: 'Training',
    roleplay: 'Role Play',
    release_check: 'Release Check',
    active: 'Active Agent',
    inactive: 'Inactive',
    terminated: 'Terminated',
  }
  return map[stage] ?? stage
}

export function leadTypeLabel(type: string): string {
  const map: Record<string, string> = {
    union: 'Union',
    veteran: 'Veteran',
    policy_owner_service: 'POS',
    new_agent_pack: 'New Agent',
    referral: 'Referral',
  }
  return map[type] ?? type
}
