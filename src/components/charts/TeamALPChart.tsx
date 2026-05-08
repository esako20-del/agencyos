'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useState } from 'react'

const FALLBACK_DATA = [
  { label: 'Dec', value: 28000 },
  { label: 'Jan', value: 31000 },
  { label: 'Feb', value: 29000 },
  { label: 'Mar', value: 34000 },
  { label: 'Apr', value: 36000 },
  { label: 'May', value: 37200 },
]

const PERSONAL_DATA = [
  { label: 'Dec', value: 10200 },
  { label: 'Jan', value: 12400 },
  { label: 'Feb', value: 11800 },
  { label: 'Mar', value: 13600 },
  { label: 'Apr', value: 14200 },
  { label: 'May', value: 14800 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-2 border border-border-2 rounded-lg px-3 py-2 text-xs font-mono">
      <div className="text-text-muted mb-1">{label}</div>
      <div className="text-accent-green font-bold">${(payload[0].value / 1000).toFixed(1)}K</div>
    </div>
  )
}

export default function TeamALPChart({ data }: { data: any[] }) {
  const [view, setView] = useState<'team' | 'personal'>('team')
  const chartData = view === 'personal' ? PERSONAL_DATA : FALLBACK_DATA

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">Monthly ALP — 6 Month Trend</div>
        <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5">
          {(['team', 'personal'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${
                view === v
                  ? 'bg-surface-1 text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {v === 'team' ? 'Team' : 'Personal'}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#3D5068', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#3D5068', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${v / 1000}K`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === chartData.length - 1 ? '#00E5A0' : 'rgba(59,130,246,0.5)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
