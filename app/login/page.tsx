'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const ROLE_HOME: Record<string, string> = {
  REGIONAL_HEAD: '/regional',
  ADMIN:         '/dashboard',
  UNIVERSITY:    '/university',
  INDUSTRY:      '/industry',
  CITIZEN:       '/',
}

export default function LoginPage() {
  const router       = useRouter()
  const params       = useSearchParams()
  const fromPath     = params.get('from')
  const isUnauth     = params.get('error') === 'unauthorized'

  const [form, setForm]         = useState({ phone: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(isUnauth ? 'इस पोर्टल तक पहुँचने का अधिकार नहीं है।' : null)

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

    // Redirect: to "from" path, or to role default
    const dest = fromPath || ROLE_HOME[data.role] || '/'
    router.push(dest)
    router.refresh()
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'var(--font-noto-devanagari), sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '36px 32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, #1a56db, #7c3aed)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', margin: '0 auto 12px',
          }}>🏛</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
            लॉग इन करें
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            SIH 2026 — झारखंड नवाचार पोर्टल
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '20px',
          }}>
            <p style={{ color: '#b91c1c', margin: 0, fontSize: '13px' }}>✗ {error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>मोबाइल नंबर</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="10 अंकों का मोबाइल नंबर"
              required
              pattern="[0-9]{10}"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>पासवर्ड</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading
                ? '#93c5fd'
                : 'linear-gradient(135deg, #1a56db, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-noto-devanagari), sans-serif',
            }}
          >
            {loading ? 'लॉग इन हो रहे हैं...' : 'लॉग इन करें'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' }}>
          नया खाता?{' '}
          <Link href="/register" style={{ color: '#1a56db', fontWeight: '600', textDecoration: 'none' }}>
            रजिस्टर करें
          </Link>
        </p>

        {/* Test credentials hint */}
        <div style={{
          marginTop: '20px', padding: '12px',
          backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: '8px', fontSize: '12px', color: '#64748b',
        }}>
          <strong style={{ color: '#475569' }}>Demo credentials:</strong><br />
          🟣 Regional Head: <code>9000000002</code> / <code>regional123</code><br />
          🔴 Admin: <code>9000000001</code> / <code>admin123</code>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: '600',
  color: '#374151', marginBottom: '6px',
}
const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '10px 12px',
  border: '1px solid #d1d5db', borderRadius: '8px',
  fontSize: '14px', color: '#111', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'var(--font-noto-devanagari), sans-serif',
  backgroundColor: '#fff',
}
