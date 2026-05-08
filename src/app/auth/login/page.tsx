'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = supabaseBrowser()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,160,0.06) 0%, #07090D 60%)' }}>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-display font-black text-4xl text-accent-green tracking-wider mb-1">AgencyOS</div>
          <div className="text-[10px] text-text-muted tracking-[3px] uppercase font-mono">AO Globe Life · American Income Life</div>
        </div>

        {/* Card */}
        <div className="panel p-6">
          <div className="panel-head mb-6" style={{ padding: 0, border: 'none' }}>
            <div>
              <div className="font-display font-bold text-sm tracking-wide">Welcome back</div>
              <div className="text-xs text-text-muted mt-0.5">Sign in to your command center</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
                placeholder="owner@agencyos.com"
                required
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <a href="/auth/forgot-password" className="text-xs text-text-muted hover:text-accent-green transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        <p className="text-center text-[10px] text-text-muted mt-6">
          Powered by AgencyOS · Built for AO Globe Life
        </p>
      </div>
    </div>
  )
}
