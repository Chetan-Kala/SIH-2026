'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface District { id: string; name: string; nameHi: string }

const ROLE_OPTIONS = [
  { value: 'CITIZEN',       label: 'नागरिक (Citizen)',              desc: 'समस्याएं दर्ज करें और समाधान देखें', icon: '👥', requiresPortalId: false, requiresOrg: false },
  { value: 'UNIVERSITY',    label: 'विश्वविद्यालय (University / HEI)', desc: 'हैकाथॉन आयोजित करें और समस्याएं हल करें', icon: '🎓', requiresPortalId: false, requiresOrg: true },
  { value: 'INDUSTRY',      label: 'उद्योग (Industry / MSME)',       desc: 'छात्र टीमों को सहयोग दें और समाधान को स्केल करें', icon: '🏭', requiresPortalId: false, requiresOrg: true },
  { value: 'REGIONAL_HEAD', label: 'क्षेत्रीय अध्यक्ष / Ministry',    desc: 'पोर्टल ID आवश्यक — विभाग से प्राप्त करें', icon: '🏛️', requiresPortalId: true, requiresOrg: false },
]

const ROLE_DASHBOARD: Record<string, string> = {
  REGIONAL_HEAD: '/regional/dashboard',
  ADMIN:         '/admin/dashboard',
  UNIVERSITY:    '/university/dashboard',
  INDUSTRY:      '/industry/dashboard',
  CITIZEN:       '/citizen/submit',
}

export default function RegisterPage() {
  const router = useRouter()

  const [step, setStep]               = useState(1)
  const [selectedRole, setSelectedRole] = useState<typeof ROLE_OPTIONS[0] | null>(null)
  const [districts, setDistricts]     = useState<District[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [showPw, setShowPw]           = useState(false)

  const [form, setForm] = useState({
    name: '',
    nameHi: '',
    phone: '',
    password: '',
    confirmPassword: '',
    districtId: '',
    orgName: '',
    portalId: '',
  })

  useEffect(() => {
    fetch('/api/districts')
      .then(r => r.json())
      .then(data => setDistricts(data.districts || []))
  }, [])

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) { setError('कृपया भूमिका चुनें'); return }
    if (form.password !== form.confirmPassword) { setError('पासवर्ड मेल नहीं खाते'); return }
    if (form.password.length < 8) { setError('पासवर्ड कम से कम 8 अक्षर का होना चाहिए'); return }
    if (selectedRole.requiresPortalId && !form.portalId.trim()) {
      setError('पोर्टल ID अनिवार्य है — अपने विभाग से प्राप्त करें')
      return
    }

    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        nameHi: form.nameHi || undefined,
        phone: form.phone,
        password: form.password,
        role: selectedRole.value,
        orgName: form.orgName || undefined,
        districtId: form.districtId || undefined,
        portalId: form.portalId || undefined,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'रजिस्ट्रेशन विफल')
      setLoading(false)
      return
    }

    if (data.token) localStorage.setItem('token', data.token)
    router.push(ROLE_DASHBOARD[data.role] || '/')
    router.refresh()
  }

  // Step 1: role selection
  if (step === 1) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100%', padding: '3rem 1.5rem',
      }}>
        {/* Removed BG glow to fit editorial minimalism */}

        <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.5rem', margin: '0 auto 1rem',
              color: 'var(--accent-ink)',
            }}>
              🌉
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              रजिस्टर करें
            </h1>
            <p style={{ color: '#607080', fontSize: '0.875rem' }}>
              आप इस मंच पर किस रूप में जुड़ना चाहते हैं?
            </p>
          </div>

          {/* Role cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {ROLE_OPTIONS.map(role => (
              <button
                key={role.value}
                id={`role-${role.value.toLowerCase()}`}
                type="button"
                onClick={() => setSelectedRole(role)}
                style={{
                  width: '100%',
                  padding: '1.1rem 1.25rem',
                  background: selectedRole?.value === role.value
                    ? 'var(--bg-tertiary)'
                    : 'var(--bg-card)',
                  border: selectedRole?.value === role.value
                    ? '1.5px solid var(--accent-ink)'
                    : '1.5px solid var(--border)',
                  borderRadius: '0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '0', flexShrink: 0,
                  background: selectedRole?.value === role.value ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  {role.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem', fontFamily: 'var(--font-sans)', color: 'var(--accent-ink)' }}>{role.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{role.desc}</div>
                </div>
                {role.requiresPortalId && (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                    background: 'transparent', border: '1px solid var(--accent-terra)',
                    borderRadius: '0', color: 'var(--accent-terra)', letterSpacing: '0.05em',
                    flexShrink: 0,
                  }}>
                    ID जरूरी
                  </span>
                )}
                {selectedRole?.value === role.value && (
                  <span style={{ color: 'var(--accent-ink)', fontSize: '1.2rem', flexShrink: 0 }}>✓</span>
                )}
              </button>
            ))}
          </div>

          <button
            id="register-next"
            className="btn btn-primary"
            disabled={!selectedRole}
            onClick={() => setStep(2)}
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
          >
            आगे बढ़ें →
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#607080', marginTop: '1.25rem' }}>
            पहले से खाता है?{' '}
            <Link href="/login" style={{ color: '#1E90FF', fontWeight: 600, textDecoration: 'none' }}>
              लॉग इन करें
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Step 2: fill details
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100%', padding: '3rem 1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Back + header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <button
            onClick={() => { setStep(1); setError(null) }}
            style={{
              background: 'none', border: 'none', color: '#607080',
              cursor: 'pointer', fontSize: '0.875rem', padding: 0,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              marginBottom: '1rem',
            }}
          >
            ← वापस
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.875rem 1rem',
            background: 'rgba(30,144,255,0.08)',
            border: '1px solid rgba(30,144,255,0.2)',
            borderRadius: '10px',
            marginBottom: '1.5rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{selectedRole?.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedRole?.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#607080' }}>Step 2 of 2 — विवरण भरें</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Portal ID (only for Regional Head) */}
            {selectedRole?.requiresPortalId && (
              <div className="form-group">
                <label className="form-label" style={{ color: '#F5A623' }}>
                  🔑 सरकारी पोर्टल ID <span style={{ color: '#FF4757' }}>*</span>
                </label>
                <input
                  id="register-portal-id"
                  type="text"
                  className="form-input"
                  value={form.portalId}
                  onChange={e => update('portalId', e.target.value)}
                  placeholder="जैसे: RH-JHKD-2026"
                  required
                  style={{ borderColor: 'rgba(245,166,35,0.3)' }}
                />
                <p style={{ fontSize: '0.72rem', color: '#607080', marginTop: '0.4rem' }}>
                  यह ID आपके विभाग / मंत्रालय द्वारा जारी की जाती है
                </p>
              </div>
            )}

            {/* Name */}
            <div className="form-group">
              <label className="form-label">पूरा नाम (English) <span style={{ color: '#FF4757' }}>*</span></label>
              <input
                id="register-name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Full name in English"
                required
              />
            </div>

            {/* Hindi name */}
            <div className="form-group">
              <label className="form-label">नाम हिंदी में <span style={{ color: '#607080' }}>(वैकल्पिक)</span></label>
              <input
                id="register-name-hi"
                type="text"
                className="form-input"
                value={form.nameHi}
                onChange={e => update('nameHi', e.target.value)}
                placeholder="हिंदी में नाम"
              />
            </div>

            {/* Org name for university/industry */}
            {selectedRole?.requiresOrg && (
              <div className="form-group">
                <label className="form-label">
                  {selectedRole.value === 'UNIVERSITY' ? 'विश्वविद्यालय का नाम' : 'संस्था / कंपनी का नाम'}{' '}
                  <span style={{ color: '#FF4757' }}>*</span>
                </label>
                <input
                  id="register-org"
                  type="text"
                  className="form-input"
                  value={form.orgName}
                  onChange={e => update('orgName', e.target.value)}
                  placeholder={selectedRole.value === 'UNIVERSITY' ? 'जैसे: BIT Sindri' : 'जैसे: Tata Consultancy Services'}
                  required
                />
              </div>
            )}

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">मोबाइल नंबर <span style={{ color: '#FF4757' }}>*</span></label>
              <input
                id="register-phone"
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="10 अंकों का मोबाइल नंबर"
                required
                pattern="[0-9]{10}"
                maxLength={10}
              />
            </div>

            {/* District */}
            <div className="form-group">
              <label className="form-label">जिला <span style={{ color: '#607080' }}>(वैकल्पिक)</span></label>
              <select
                id="register-district"
                className="form-select"
                value={form.districtId}
                onChange={e => update('districtId', e.target.value)}
              >
                <option value="">— जिला चुनें —</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.nameHi} ({d.name})</option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">पासवर्ड <span style={{ color: '#FF4757' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="कम से कम 8 अक्षर"
                  required
                  minLength={8}
                  style={{ paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#607080', cursor: 'pointer', fontSize: '1.1rem', padding: 0,
                }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">पासवर्ड की पुष्टि <span style={{ color: '#FF4757' }}>*</span></label>
              <input
                id="register-confirm-password"
                type="password"
                className="form-input"
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
                placeholder="पासवर्ड दोबारा दर्ज करें"
                required
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="form-error">⚠️ पासवर्ड मेल नहीं खाते</p>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', borderRadius: '10px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="spinner" />
                  रजिस्टर हो रहे हैं...
                </span>
              ) : 'खाता बनाएं →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#607080', marginTop: '1.25rem' }}>
          पहले से खाता है?{' '}
          <Link href="/login" style={{ color: '#1E90FF', fontWeight: 600, textDecoration: 'none' }}>
            लॉग इन करें
          </Link>
        </p>
      </div>
    </div>
  )
}
