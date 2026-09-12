'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const ROLE_DASHBOARD: Record<string, string> = {
  REGIONAL_HEAD: '/regional/dashboard',
  ADMIN:         '/admin/dashboard',
  UNIVERSITY:    '/university/dashboard',
  INDUSTRY:      '/industry/dashboard',
  CITIZEN:       '/citizen/submit',
}

function LoginForm() {
  const router   = useRouter()
  const params   = useSearchParams()
  const fromPath = params.get('from')
  const isUnauth = params.get('error') === 'unauthorized'

  const [form, setForm]       = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(isUnauth ? 'इस पेज तक पहुँचने का अधिकार नहीं है।' : null)
  const [showPw, setShowPw]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res  = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'लॉग इन विफल')
      setLoading(false)
      return
    }

    // Save token for client-side Navbar
    if (data.token) localStorage.setItem('token', data.token)

    const dest = fromPath || ROLE_DASHBOARD[data.role] || '/'
    router.push(dest)
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
    }}>
      {/* Background accent */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,144,255,0.1) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #1E90FF, #00D2FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', margin: '0 auto 1rem',
            boxShadow: '0 0 24px rgba(30,144,255,0.4)',
          }}>
            🌉
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            लॉग इन करें
          </h1>
          <p style={{ color: '#607080', fontSize: '0.875rem' }}>
            समाधान-सेतु · SIH 2026
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {/* Error */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Phone */}
            <div className="form-group">
              <label className="form-label">मोबाइल नंबर</label>
              <input
                id="login-phone"
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="10 अंकों का मोबाइल नंबर"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                autoComplete="tel"
              />
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">पासवर्ड</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: '#607080', cursor: 'pointer', fontSize: '1.1rem', padding: 0,
                  }}
                  title={showPw ? 'छिपाएं' : 'दिखाएं'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', borderRadius: '10px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  लॉग इन हो रहे हैं...
                </span>
              ) : 'लॉग इन करें →'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider" style={{ margin: '1.5rem 0' }} />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#607080' }}>
            नया खाता नहीं है?{' '}
            <Link href="/register" style={{ color: '#1E90FF', fontWeight: 600, textDecoration: 'none' }}>
              रजिस्टर करें
            </Link>
          </p>

          {/* Demo credentials */}
          <details style={{ marginTop: '1.25rem' }}>
            <summary style={{
              fontSize: '0.75rem', color: '#607080', cursor: 'pointer',
              userSelect: 'none', letterSpacing: '0.04em',
            }}>
              🔑 Demo credentials (development)
            </summary>
            <div style={{
              marginTop: '0.875rem',
              padding: '0.875rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#607080',
              lineHeight: 2,
              fontFamily: 'var(--font-mono), monospace',
            }}>
              🟡 Regional Head: <strong style={{ color: '#F5A623' }}>9000000002</strong> / regional123<br />
              🔴 Admin: <strong style={{ color: '#FF4757' }}>9000000001</strong> / admin123<br />
              🟢 Citizen: <strong style={{ color: '#00C48C' }}>9999999999</strong> / citizen123
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#607080' }}>लोड हो रहा है...</div>}>
      <LoginForm />
    </Suspense>
  )
}
