'use client'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import QuickReportModal from '@/components/forms/QuickReportModal'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Command Dashboard',
  '/dashboard/production': 'Personal Production',
  '/dashboard/team': 'Team Roster',
  '/dashboard/recruiting': 'Recruiting CRM',
  '/dashboard/leads': 'Lead Management',
  '/dashboard/training': 'Training & Onboarding',
  '/dashboard/insights': 'AI Business Insights',
  '/dashboard/goals': 'Goal Tracker',
  '/dashboard/report': 'Daily Report',
}

export default function Topbar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const [showReport, setShowReport] = useState(false)
  const title = pageTitles[pathname] ?? 'Dashboard'
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      <header className="h-13 bg-surface-1 border-b border-border flex items-center justify-between px-5 lg:px-6 flex-shrink-0" style={{ height: 52 }}>
        <h1 className="font-display font-bold text-sm tracking-widest uppercase">{title}</h1>

        <div className="flex items-center gap-2.5">
          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-surface-2 border border-border px-3 py-1.5 rounded-lg text-[11px] text-text-soft font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" />
            Live
          </div>

          {/* Date */}
          <div className="hidden sm:flex items-center bg-surface-2 border border-border px-3 py-1.5 rounded-lg text-[11px] text-text-soft font-mono">
            {dateStr}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg bg-surface-2 border border-border text-text-soft hover:text-text hover:border-border-2 transition-colors">
            <Bell size={14} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-red shadow-[0_0_4px_#EF4444]" />
          </button>

          {/* Quick Report */}
          <button
            onClick={() => setShowReport(true)}
            className="btn-primary"
          >
            + Daily Report
          </button>
        </div>
      </header>

      {showReport && <QuickReportModal onClose={() => setShowReport(false)} />}
    </>
  )
}
