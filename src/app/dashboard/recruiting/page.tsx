import { recruitStageLabel } from '@/lib/utils'
import { Plus } from 'lucide-react'

const PIPELINE_STAGES = [
  { stage: 'sourced', count: 8, color: '#7A90A8' },
  { stage: 'intro_meeting', count: 5, color: '#7A90A8' },
  { stage: 'course_started', count: 4, color: '#F59E0B' },
  { stage: 'exam_pending', count: 3, color: '#F59E0B' },
  { stage: 'training', count: 2, color: '#00E5A0' },
  { stage: 'release_check', count: 1, color: '#00E5A0' },
]

const RECRUITS = [
  { name: 'Nia Johnson', source: 'Social', stage: 'training', days: 10, recruiter: 'Owner', next: 'Release check this week' },
  { name: 'Ryan Cole', source: 'Vendor', stage: 'training', days: 7, recruiter: 'Mgr 1', next: 'Role play session Fri' },
  { name: 'Mia Torres', source: 'Vendor', stage: 'exam_pending', days: 12, recruiter: 'Owner', next: 'Follow up on exam date' },
  { name: 'James Park', source: 'Social', stage: 'course_started', days: 4, recruiter: 'Mgr 2', next: 'Check course progress' },
  { name: 'Layla Brown', source: 'Social', stage: 'course_started', days: 6, recruiter: 'Mgr 1', next: 'Intro meeting follow-up' },
  { name: 'Devon Smith', source: 'Vendor', stage: 'intro_meeting', days: 3, recruiter: 'Owner', next: 'Send course link today' },
]

const SOURCE_RATES = [
  { source: 'Agent Referrals', rate: 31, color: '#F59E0B' },
  { source: 'Vendor Leads', rate: 22, color: '#00E5A0' },
  { source: 'Social Media', rate: 14, color: '#3B82F6' },
]

export default function RecruitingPage() {
  return (
    <div className="space-y-5 animate-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'In Pipeline', value: '6', color: 'green', sub: 'Active candidates' },
          { label: 'Near Release', value: '2', color: 'amber', sub: 'Nia J. · Ryan C.' },
          { label: 'Overall Conversion', value: '12%', color: 'red', sub: 'Sourced → Active' },
          { label: 'Avg Onboard Time', value: '38d', color: 'blue', sub: 'Exam to release' },
        ].map(k => (
          <div key={k.label} className={`kpi-card ${k.color}`}>
            <div className="text-[9px] text-text-muted uppercase tracking-[1.5px] font-mono mb-2">{k.label}</div>
            <div className={`font-display text-2xl font-bold text-accent-${k.color === 'blue' ? 'blue2' : k.color === 'amber' ? 'amber' : k.color === 'red' ? 'red' : 'green'}`}>{k.value}</div>
            <div className="text-[10px] text-text-muted mt-1.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline visualization */}
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Recruiting Pipeline</div>
          <button className="btn-primary flex items-center gap-1.5 text-[10px] py-1.5 px-3">
            <Plus size={11} /> Add Recruit
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-0 mb-5">
            {PIPELINE_STAGES.map((s, i) => (
              <div key={s.stage} className="flex-1 relative">
                <div className="bg-surface-2 border border-border border-r-0 px-2 py-3 text-center last:border-r"
                  style={{ borderRadius: i === 0 ? '8px 0 0 8px' : i === PIPELINE_STAGES.length - 1 ? '0 8px 8px 0' : '0' }}>
                  <div className="font-display text-xl font-bold" style={{ color: s.color }}>{s.count}</div>
                  <div className="text-[9px] text-text-muted uppercase tracking-wide font-mono mt-1 leading-tight">{recruitStageLabel(s.stage)}</div>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-3 h-3 border-t border-r border-border-2 rotate-45 bg-surface-2" />
                )}
              </div>
            ))}
          </div>

          {/* Candidate table */}
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Candidate</th><th>Source</th><th>Stage</th>
                <th>Days in Stage</th><th>Recruiter</th><th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              {RECRUITS.map(r => {
                const daysColor = r.days > 10 ? 'text-accent-red' : r.days > 7 ? 'text-accent-amber' : 'text-accent-green'
                const stageBadge = r.stage === 'training' ? 'badge-green' : r.stage === 'exam_pending' ? 'badge-amber' : 'badge-muted'
                return (
                  <tr key={r.name}>
                    <td className="font-semibold text-xs">{r.name}</td>
                    <td><span className="badge badge-muted">{r.source}</span></td>
                    <td><span className={`badge ${stageBadge}`}>{recruitStageLabel(r.stage)}</span></td>
                    <td className={`font-mono text-xs ${daysColor}`}>{r.days}d</td>
                    <td className="text-xs text-text-soft">{r.recruiter}</td>
                    <td className="text-[11px] text-text-muted">{r.next}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Source Conversion Rates</div></div>
          <div className="p-4 space-y-4">
            {SOURCE_RATES.map(s => (
              <div key={s.source}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-soft">{s.source}</span>
                  <span className="font-mono" style={{ color: s.color }}>{s.rate}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${s.rate}%`, background: s.color }} />
                </div>
              </div>
            ))}
            <div className="bg-surface-2 rounded-lg p-3 mt-2">
              <div className="text-[9px] text-text-muted uppercase tracking-widest font-mono mb-1.5">Key Insight</div>
              <div className="text-xs text-text-soft">Agent referrals convert <strong className="text-accent-amber">2.2x better</strong> than social media. Incentivize your team to refer candidates.</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><div className="panel-title">Cohort Retention</div></div>
          <div className="p-4">
            <table className="data-table w-full">
              <thead><tr><th>Cohort</th><th>Started</th><th>30 Days</th><th>6 Months</th><th>12 Months</th></tr></thead>
              <tbody>
                {[
                  { cohort: 'Jan 2026', start: 4, d30: '3 (75%)', m6: '—', m12: '—', c30: 'amber' },
                  { cohort: 'Oct 2025', start: 5, d30: '4 (80%)', m6: '1 (20%)', m12: '—', c30: 'green' },
                  { cohort: 'Jul 2025', start: 3, d30: '3 (100%)', m6: '1 (33%)', m12: '0 (0%)', c30: 'green' },
                  { cohort: 'Apr 2025', start: 4, d30: '3 (75%)', m6: '1 (25%)', m12: '1 (25%)', c30: 'amber' },
                ].map(row => (
                  <tr key={row.cohort}>
                    <td className="font-mono text-[11px] text-text-soft">{row.cohort}</td>
                    <td className="font-mono text-xs">{row.start}</td>
                    <td className={`font-mono text-xs text-accent-${row.c30}`}>{row.d30}</td>
                    <td className="font-mono text-xs text-accent-red">{row.m6}</td>
                    <td className="font-mono text-xs text-accent-red">{row.m12}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
