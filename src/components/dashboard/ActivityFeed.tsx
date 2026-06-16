'use client'
import { useEffect, useState } from 'react'

function timeAgo(dateStr: string): string {
  const submitted = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - submitted.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function formatCurrency(val: number): string {
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val}`
}

export function ActivityFeed({ reports }: { reports: any[] }) {
  const [feed, setFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Fetch last 7 days of reports
        const res = await fetch('/api/recentactivity')
        const { data } = await res.json()
        if (data) setFeed(data)
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">Recent Activity</div>
      </div>

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#3D5068', fontSize: '12px' }}>
          Loading activity...
        </div>
      ) : feed.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#3D5068', fontSize: '12px' }}>
          No recent submissions.
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {feed.map((item, i) => {
            const hasAlp   = (item.alp_written || 0) > 0
            const hasSales = (item.sales || 0) > 0
            const dotColor = hasSales ? '#00E5A0' : hasAlp ? '#60A5FA' : '#3D5068'

            return (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: '5px' }} />
                <div style={{ flex: 1, fontSize: '11px', color: '#7A90A8', lineHeight: '1.6' }}>
                  <strong style={{ color: '#ECF0F5' }}>{item.agent?.full_name || 'Unknown'}</strong>
                  {' submitted — '}
                  {hasSales ? (
                    <>
                      <span style={{ color: '#00E5A0', fontWeight: '600' }}>{item.sales} sale{item.sales > 1 ? 's' : ''}</span>
                      {hasAlp && <>, <span style={{ color: '#60A5FA' }}>{formatCurrency(item.alp_written)} ALP</span></>}
                    </>
                  ) : hasAlp ? (
                    <span style={{ color: '#60A5FA' }}>{formatCurrency(item.alp_written)} ALP</span>
                  ) : (
                    <span style={{ color: '#3D5068' }}>0 sales</span>
                  )}
                </div>
                <div style={{ fontSize: '10px', color: '#3D5068', fontFamily: 'monospace', flexShrink: 0 }}>
                  {timeAgo(item.submitted_at)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ActivityFeed
