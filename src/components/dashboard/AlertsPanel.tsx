'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, Star, Info, CheckCircle } from 'lucide-react'

function getETDateString(): string {
  const now = new Date()
  const etDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const y = etDate.getFullYear()
  const m = String(etDate.getMonth() + 1).padStart(2, '0')
  const d = String(etDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function AlertsPanel({ missingReports }: { missingReports: any[] }) {
  const [missing, setMissing] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Get all agents who have ever submitted
        const agentsRes = await fetch('/api/agentscoreboard')
        const { data: agents } = await agentsRes.json()

        // Get today's submissions
        const today = getETDateString()
        const reportsRes = await fetch(`/api/reports?date=${today}`)
        const { data: reports } = await reportsRes.json()

        if (agents && reports) {
          const submittedIds = new Set((reports || []).map((r: any) => r.agent_id))
          // Only flag agents who have submitted at least once before (have JotForm data)
          const missingAgents = agents
            .filter((a: any) => a.is_active && a.totalSales > 0 && !submittedIds.has(a.id))
            .map((a: any) => a.full_name)
          setMissing(missingAgents)
        }
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div>
      <div className="text-[9px] text-text-muted uppercase tracking-[2px] font-mono mb-2">Live Alerts</div>
      <div style={{ fontSize: '12px', color: '#3D5068', padding: '10px 0' }}>Loading alerts...</div>
    </div>
  )

  return (
    <div>
      <div className="text-[9px] text-text-muted uppercase tracking-[2px] font-mono mb-2">Live Alerts</div>

      {missing.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
          <CheckCircle size={14} color="#00E5A0" />
          <span style={{ fontSize: '12px', color: '#00E5A0', fontWeight: '500' }}>All active agents have submitted today!</span>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
            <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '12px', color: '#ECF0F5' }}>
              <strong style={{ color: '#EF4444' }}>{missing.length} agent{missing.length > 1 ? 's' : ''}</strong> {missing.length > 1 ? 'have' : 'has'} not submitted today's report:{' '}
              <span style={{ color: '#7A90A8' }}>{missing.join(', ')}</span>
            </span>
          </div>
        </>
      )}
    </div>
  )
}
