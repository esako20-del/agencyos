'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { href: '/dashboard/production', label: 'Production', icon: '◈' },
  { href: '/dashboard/team', label: 'Team', icon: '◎' },
  { href: '/dashboard/recruiting', label: 'Recruiting', icon: '◉' },
  { href: '/dashboard/leads', label: 'Leads', icon: '◇' },
  { href: '/dashboard/training', label: 'Training', icon: '△' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '◫' },
  { href: '/dashboard/insights', label: 'AI Insights', icon: '✦' },
  { href: '/dashboard/goals', label: 'Goals', icon: '◐' },
  { href: '/dashboard/report', label: 'Daily Report', icon: '▷' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#07090D', fontFamily: 'system-ui, sans-serif' }}>

      {/* Sidebar */}
      <div style={{ width: '200px', flexShrink: 0, background: '#0C1018', borderRight: '1px solid #1C2A3A', display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1C2A3A' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#00E5A0', letterSpacing: '1px' }}>AgencyOS</div>
          <div style={{ fontSize: '9px', color: '#3D5068', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '3px' }}>AO Globe Life · AIL</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
                  color: isActive ? '#00E5A0' : '#7A90A8',
                  background: isActive ? 'rgba(0,229,160,0.05)' : 'transparent',
                  borderLeft: isActive ? '2px solid #00E5A0' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: '14px', width: '16px', textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1C2A3A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #00E5A0, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#000' }}>A</div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#ECF0F5' }}>Agency Owner</div>
              <div style={{ fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1px' }}>Owner · Admin</div>
            </div>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00E5A0', marginLeft: 'auto', boxShadow: '0 0 6px #00E5A0' }} />
          </div>
          <a href="/auth/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px', color: '#3D5068', textDecoration: 'none', padding: '4px 0' }}
            onClick={async () => { const { createClient } = await import('@supabase/supabase-js'); const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); await s.auth.signOut(); }}>
            ↩ Sign Out
          </a>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{ height: '52px', background: '#0C1018', borderBottom: '1px solid #1C2A3A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', flexShrink: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#ECF0F5' }}>
            {navItems.find(n => n.href === pathname)?.label ?? 'Dashboard'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#111820', border: '1px solid #1C2A3A', padding: '5px 11px', borderRadius: '6px', fontSize: '11px', color: '#7A90A8' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E5A0', display: 'inline-block' }} />
              Live
            </div>
            <div style={{ background: '#111820', border: '1px solid #1C2A3A', padding: '5px 11px', borderRadius: '6px', fontSize: '11px', color: '#7A90A8' }}>
              {new Date().toLocaleString('en-US', { timeZone: 'America/New_York', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
