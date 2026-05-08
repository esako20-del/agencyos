'use client'
import { useState } from 'react'
import { cn, tierColor, tierLabel, formatCurrency } from '@/lib/utils'
import { AgentTier } from '@/types'
import { Plus, Flame } from 'lucide-react'

const AGENTS = [
  { id: '1', full_name: 'Marcus W.', role: 'Top Producer', tier: 'consistent' as AgentTier, ytd: 182000, month: 13100, sits: 24, close: 58, refs: 9, leads: 'Union+Vet', streak: 22, health: 'green', initials: 'MW', color: '#F59E0B' },
  { id: '2', full_name: 'DeShawn T.', role: 'Consistent', tier: 'consistent' as AgentTier, ytd: 72000, month: 8400, sits: 19, close: 47, refs: 6, leads: 'Union+POS', streak: 14, health: 'green', initials: 'DT', color: '#3B82F6' },
  { id: '3', full_name: 'Priya S.', role: 'Consistent', tier: 'consistent' as AgentTier, ytd: 52000, month: 6500, sits: 17, close: 44, refs: 5, leads: 'Union', streak: 11, health: 'green', initials: 'PS', color: '#A78BFA' },
  { id: '4', full_name: 'Jordan R.', role: 'New Consistent', tier: 'consistent' as AgentTier, ytd: 42000, month: 10200, sits: 21, close: 52, refs: 7, leads: 'Veteran', streak: 9, health: 'green', initials: 'JR', color: '#00E5A0' },
  { id: '5', full_name: 'Keisha M.', role: 'Developing', tier: 'training' as AgentTier, ytd: 18000, month: 3600, sits: 11, close: 36, refs: 3, leads: 'New Pack', streak: 5, health: 'yellow', initials: 'KM', color: '#F59E0B' },
  { id: '6', full_name: 'Tyler B.', role: 'In Training', tier: 'training' as AgentTier, ytd: 7200, month: 1400, sits: 6, close: 25, refs: 1, leads: 'New Pack', streak: 0, health: 'red', initials: 'TB', color: '#EF4444' },
  { id: '7', full_name: 'Aisha N.', role: 'In Training', tier: 'training' as AgentTier, ytd: 5100, month: 900, sits: 4, close: 22, refs: 1, leads: 'New Pack', streak: 2, health: 'yellow', initials: 'AN', color: '#F59E0B' },
  { id: '8', full_name: 'Carlos V.', role: 'In Training', tier: 'training' as AgentTier, ytd: 3200, month: 600, sits: 3, close: 20, refs: 0, leads: 'New Pack', streak: 0, health: 'red', initials: 'CV', color: '#EF4444' },
  { id: '9', full_name: 'Destiny H.', role: 'Part Time', tier: 'parttime' as AgentTier, ytd: 9800, month: 1800, sits: 7, close: 30, refs: 2, leads: 'Union', streak: 4, health: 'yellow', initials: 'DH', color: '#60A5FA' },
  { id: '10', full_name: 'Omar F.', role: 'Part Time', tier: 'parttime' as AgentTier, ytd: 6400, month: 1100, sits: 5, close: 28, refs: 1, leads: 'Veteran', streak: 3, health: 'yellow', initials: 'OF', color: '#60A5FA' },
  { id: '11', full_name: 'Grace L.', role: 'Part Time', tier: 'parttime' as AgentTier, ytd: 4200, month: 800, sits: 4, close: 25, refs: 1, leads: 'Union', streak: 2, health: 'yellow', initials: 'GL', color: '#60A5FA' },
  { id: '12', full_name: 'Brandon K.', role: 'Just Released', tier: 'new' as AgentTier, ytd: 2100, month: 2100, sits: 5, close: 30, refs: 1, leads: 'New Pack', streak: 1, health: 'yellow', initials: 'BK', color: '#3B82F6' },
  { id: '13', full_name: 'Tamara J.', role: 'Just Released', tier: 'new' as AgentTier, ytd: 1800, month: 1800, sits: 4, close: 28, refs: 0, leads: 'New Pack', streak: 1, health: 'yellow', initials: 'TJ', color: '#A78BFA' },
]

const TABS = [
  { label: 'All (13)', value: 'all' },
  { label: 'Consistent (4)', value: 'consistent' },
  { label: 'Training (4)', value: 'training' },
  { label: 'Part Time (3)', value: 'parttime' },
  { label: 'New (2)', value: 'new' },
]

export default function TeamPage() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? AGENTS : AGENTS.filter(a => a.tier === filter)
  const topYtd = AGENTS[0].ytd

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-surface-2 border border-border p-1 rounded-lg">
          {TABS.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              className={cn('px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all',
                filter === t.value ? 'bg-surface-1 text-text shadow-sm' : 'text-text-muted hover:text-text')}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-1.5">
          <Plus size={12} /> Add Agent
        </button>
      </div>

      <div className="panel overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>Agent</th><th>Tier</th><th>YTD ALP</th>
              <th>This Month</th><th>Close %</th><th>Sits</th>
              <th>Refs</th><th>Streak</th><th>Health</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(agent => {
              const pct = Math.round((agent.ytd / topYtd) * 100)
              const healthColor = agent.health === 'green' ? '#00E5A0' : agent.health === 'yellow' ? '#F59E0B' : '#EF4444'
              const closeColor = agent.close >= 45 ? 'text-accent-green' : agent.close >= 30 ? 'text-accent-amber' : 'text-accent-red'

              return (
                <tr key={agent.id} className="cursor-pointer">
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: `${agent.color}22`, color: agent.color }}>
                        {agent.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{agent.full_name}</div>
                        <div className="text-[10px] text-text-muted">{agent.role}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={cn('badge', tierColor(agent.tier))}>{tierLabel(agent.tier)}</span></td>
                  <td>
                    <div className="font-mono text-xs text-accent-green">{formatCurrency(agent.ytd, true)}</div>
                    <div className="w-20 h-1 bg-surface-3 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-accent-green rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="font-mono text-xs text-accent-blue2">{formatCurrency(agent.month, true)}</td>
                  <td className={cn('font-mono text-xs', closeColor)}>{agent.close}%</td>
                  <td className="font-mono text-xs text-text-soft">{agent.sits}</td>
                  <td className="font-mono text-xs text-text-soft">{agent.refs}</td>
                  <td>
                    {agent.streak > 0
                      ? <span className="flex items-center gap-1 text-accent-green font-mono text-xs"><Flame size={10} />{agent.streak}d</span>
                      : <span className="text-accent-red font-mono text-xs">—</span>}
                  </td>
                  <td>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: healthColor, boxShadow: `0 0 5px ${healthColor}` }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
