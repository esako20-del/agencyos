'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = supabaseBrowser()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,160,0.06) 0%, #07090D 60%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#00E5A0', letterSpacing: '2px' }}>
            AgencyOS
          </div>
          <div style={{ fontSize: '10px', color: '#3D5068', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '4px' }}>
            AO Globe Life · American Income Life
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#0C1018',
          border: '1px solid #1C2A3A',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ECF0F5' }}>Welcome back</div>
            <div style={{ fontSize: '12px', color: '#3D5068', marginTop: '2px' }}>Sign in to your command center</div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="owner@agencyos.com"
                required
                style={{
                  width: '100%',
                  background: '#111820',
                  border: '1px solid #1C2A3A',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ECF0F5',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '9px', color: '#3D5068', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  background: '#111820',
                  border: '1px solid #1C2A3A',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ECF0F5',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 12px', color: '#EF4444', fontSize: '12px', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#00B87A' : '#00E5A0',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.5px',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '10px', color: '#3D5068', marginTop: '24px' }}>
          Powered by AgencyOS · Built for AO Globe Life
        </p>
      </div>
    </div>
  )
}
