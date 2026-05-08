'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Profile } from '@/types'
import {
  LayoutDashboard, TrendingUp, Users, UserPlus, Zap,
  BookOpen, Lightbulb, Target, ClipboardList, LogOut
} from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Command', section: true },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/production', label: 'Production', icon: TrendingUp },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { label: 'Pipeline', section: true },
  { href: '/dashboard/recruiting', label: 'Recruiting', icon: UserPlus, badge: '6' },
  { href: '/dashboard/leads', label: 'Leads', icon: Zap },
  { href: '/dashboard/training', label: 'Training', icon: BookOpen },
  { label: 'Intelligence', section: true },
  { href: '/dashboard/insights', label: 'AI Insights', icon: Lightbulb, badgeGreen: '8' },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/report', label: 'Daily Report', icon: ClipboardList },
]

export default function Sidebar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = supabaseBrowser()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ?? 'A'

  return (
    <aside className="w-[200px] flex-shrink-0 bg-surface-1 border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="font-display font-black text-lg text-accent-green tracking-wider leading-none">AgencyOS</div>
        <div className="text-[9px] text-text-muted tracking-[2px] uppercase font-mono mt-1">AO Globe Life · AIL</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item, i) => {
          if ('section' in item) {
            return (
              <div key={i} className="px-4 pt-4 pb-1 text-[9px] text-text-muted tracking-[2px] uppercase font-mono">
                {item.label}
              </div>
            )
          }

          const Icon = item.icon!
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href!)

          return (
            <Link key={item.href} href={item.href!}>
              <div className={cn('nav-item', isActive && 'active')}>
                <Icon size={14} className="flex-shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-accent-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                    {item.badge}
                  </span>
                )}
                {item.badgeGreen && (
                  <span className="ml-auto bg-accent-green text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                    {item.badgeGreen}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">{profile?.full_name ?? 'Owner'}</div>
            <div className="text-[9px] text-text-muted uppercase tracking-wide">{profile?.role ?? 'Owner'}</div>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green flex-shrink-0 shadow-[0_0_6px_#00E5A0]" />
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-text-muted hover:text-accent-red hover:bg-accent-red/5 transition-colors text-[11px]"
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
