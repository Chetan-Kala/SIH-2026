'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface District {
  id: string
  name: string
  nameHi: string
}

const ROLE_OPTIONS = [
  { value: 'CITIZEN',    label: 'नागरिक (Citizen)',          desc: 'समस्या दर्ज करें' },
  { value: 'UNIVERSITY', label: 'विश्वविद्यालय (University)', desc: 'हैकाथॉन और समाधान' },
  { value: 'INDUSTRY',   label: 'उद्योग (Industry)',          desc: 'मेंटरशिप और सहयोग' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [districts, setDistricts] = useState<District[]>([])
  const [form, setForm] = useState({
    name: '', phone: '', password: '', confirmPassword: '',
    role: 'CITIZEN', orgName: '', districtId: '',
  })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/districts').then(r => r.json()).then(d => setDistricts(d.districts || []))
  }, [])

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('पासवर्ड मेल नहीं खाते')
      return
    }
    setLoading(true)
    setError(null)

    const res  = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        password: form.password,
        role: form.role,
        orgName: form.orgName || null,
        districtId: form.districtId || null,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'रजिस्ट्रेशन विफल')
      setLoading(false)
      return
    }

    router.push(data.role === 'CITIZEN' ? '/' : `/${data.role.toLowerCase()}`)
    router.refresh()
  }

  const isOrgRole = form.role === 'UNIVERSITY' || form.role === 'INDUSTRY'

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'var(--font-noto-devanagari), sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: '480px',
        backgroundColor: '#fff', border: '1px solid #e2e8f0',
        borderRadius: '12px', padding: '36px 32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, #1a56db, #7c3aed)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', margin: '0 auto 12px',
          }}>🏛</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
            नया खाता बनाएं
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            SIH 2026 — झारखंड नवाचार पोर्टल
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '20px',
          }}>
            <p style={{ color: '#b91c1c', margin: 0, fontSize: '13px' }}>✗ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>आप कौन हैं?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ROLE_OPTIONS.map(opt => (
                <label key={opt.value} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', border: `2px solid ${form.role === opt.value ? '#1a56db' : '#e2e8f0'}`,
                  borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: form.role === opt.value ? '#eff6ff' : '#fff',
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="radio" name="role" value={opt.value}
                    checked={form.role === opt.value}
                    onChange={change}
                    style={{ accentColor: '#1a56db' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#111' }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>
              {isOrgRole ? 'प्रतिनिधि का नाम' : 'पूरा नाम'} *
            </label>
            <input
              name="name" type="text" value={form.name} onChange={change}
              placeholder="अपना नाम लिखें" required style={inputStyle}
            />
          </div>

          {isOrgRole && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                {form.role === 'UNIVERSITY' ? 'विश्वविद्यालय का नाम' : 'कंपनी/उद्योग का नाम'} *
              </label>
              <input
                name="orgName" type="text" value={form.orgName} onChange={change}
                placeholder={form.role === 'UNIVERSITY' ? 'जैसे: BIT Mesra' : 'जैसे: Tata Steel'}
                required={isOrgRole} style={inputStyle}
              />
            </div>
          )}

          {form.role === 'CITIZEN' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>जिला</label>
              <select
                name="districtId" value={form.districtId} onChange={change}
                style={inputStyle}
              >
                <option value="">— जिला चुनें —</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.nameHi} ({d.name})</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>मोबाइल नंबर *</label>
            <input
              name="phone" type="tel" value={form.phone} onChange={change}
              placeholder="10 अंकों का मोबाइल नंबर"
              required pattern="[0-9]{10}" style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>पासवर्ड *</label>
            <input
              name="password" type="password" value={form.password} onChange={change}
              placeholder="••••••••" required minLength={6} style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>पासवर्ड दोबारा लिखें *</label>
            <input
              name="confirmPassword" type="password" value={form.confirmPassword} onChange={change}
              placeholder="••••••••" required style={inputStyle}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1a56db, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-noto-devanagari), sans-serif',
            }}
          >
            {loading ? 'रजिस्टर हो रहे हैं...' : 'खाता बनाएं'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' }}>
          पहले से खाता है?{' '}
          <Link href="/login" style={{ color: '#1a56db', fontWeight: '600', textDecoration: 'none' }}>
            लॉग इन करें
          </Link>
        </p>
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
