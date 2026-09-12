'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { classify } from '@/lib/classifier'
import Link from 'next/link'
import VoiceInput from '@/components/VoiceInput'


interface District { id: string; name: string; nameHi: string }

const DOMAINS = [
  'Roads & Infrastructure', 'Water Supply & Sanitation', 'Electricity',
  'Waste Management', 'Public Health', 'Law & Order', 'Education', 'Transport', 'Agriculture', 'General',
]

const URGENCY_OPTIONS = [
  { value: 20, label: 'कम', emoji: '🟢', desc: 'कोई समय-सीमा नहीं' },
  { value: 50, label: 'मध्यम', emoji: '🟡', desc: 'कुछ हफ्तों में समाधान चाहिए' },
  { value: 80, label: 'अधिक', emoji: '🟠', desc: 'जल्द ध्यान चाहिए' },
  { value: 100, label: 'आपातकालीन', emoji: '🔴', desc: 'तत्काल कार्रवाई आवश्यक है' },
]

const LANG_OPTIONS = [
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', label: 'English', flag: '🏴' },
  { code: 'or', label: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'sat', label: 'Santali', flag: '🇮🇳' },
]

export default function CitizenSubmitPage() {
  const router = useRouter()

  const [step, setStep]         = useState(1) // 1=details, 2=media, 3=confirm
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<{ id: string; domain: string; routedTo: string } | null>(null)
  const [livePreview, setLivePreview] = useState<{ domain: string; routedTo: string } | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    districtId: '',
    sourceLang: 'hi',
    urgencyScore: 20,
  })

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?from=/citizen/submit')
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'CITIZEN') {
        router.push('/')
        return
      }
    } catch {
      router.push('/login?from=/citizen/submit')
      return
    }

    fetch('/api/districts')
      .then(r => r.json())
      .then(d => setDistricts(d.districts || []))
  }, [router])

  // Live domain preview as user types
  useEffect(() => {
    if (form.title.length > 3 || form.description.length > 10) {
      try {
        const result = classify(form.title, form.description)
        setLivePreview(result)
      } catch {
        setLivePreview(null)
      }
    } else {
      setLivePreview(null)
    }
  }, [form.title, form.description])

  const update = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.districtId) {
      setError('कृपया सभी आवश्यक फ़ील्ड भरें')
      return
    }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      // If unauthorized, redirect to login
      if (res.status === 401) { router.push('/login?from=/citizen/submit'); return }
      setError(data.error || 'कुछ गलत हुआ')
      setLoading(false)
      return
    }

    setSuccess(data.problem)
    setLoading(false)
  }

  // ── Success State ──────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'float 2s ease-in-out infinite' }}>✅</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            समस्या दर्ज हो गई!
          </h1>
          <p style={{ color: '#B0BEC5', marginBottom: '1.5rem' }}>
            आपकी समस्या सफलतापूर्वक दर्ज हो गई है। क्षेत्रीय अध्यक्ष जल्द समीक्षा करेंगे।
          </p>

          <div className="card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#607080' }}>समस्या ID</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#1E90FF' }}>{success.id.slice(0, 16)}…</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#607080' }}>क्षेत्र / Domain</span>
                <span className="domain-tag">{success.domain}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#607080' }}>भेजा गया</span>
                <span style={{ fontSize: '0.8rem', color: '#B0BEC5' }}>{success.routedTo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#607080' }}>पॉइंट्स</span>
                <span style={{ fontSize: '0.85rem', color: '#F5A623', fontWeight: 700 }}>+10 ⭐</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => { setSuccess(null); setStep(1); setForm({ title: '', description: '', districtId: '', sourceLang: 'hi', urgencyScore: 20 }) }}
            >
              + नई समस्या दर्ज करें
            </button>
            <Link href="/hub" className="btn btn-ghost">
              समस्या हब देखें
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const STEPS = [
    { n: 1, label: 'समस्या विवरण', icon: '📝' },
    { n: 2, label: 'तात्कालिकता', icon: '🔥' },
    { n: 3, label: 'पुष्टि', icon: '✓' },
  ]

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ fontSize: '0.8rem', color: '#607080', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
          ← वापस होम पर
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          समस्या दर्ज करें
        </h1>
        <p style={{ color: '#607080', fontSize: '0.875rem' }}>
          अपनी स्थानीय समस्या यहाँ दर्ज करें — AI स्वत: वर्गीकरण और रूटिंग करेगा
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', gap: '0' }}>
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: step > s.n ? '14px' : '16px',
                fontWeight: 700,
                background: step === s.n
                  ? 'linear-gradient(135deg, #1E90FF, #00D2FF)'
                  : step > s.n
                  ? 'rgba(0,196,140,0.2)'
                  : 'rgba(255,255,255,0.06)',
                border: step === s.n
                  ? 'none'
                  : step > s.n
                  ? '1.5px solid rgba(0,196,140,0.4)'
                  : '1.5px solid rgba(255,255,255,0.1)',
                color: step === s.n ? '#fff' : step > s.n ? '#00C48C' : '#607080',
                boxShadow: step === s.n ? '0 0 16px rgba(30,144,255,0.4)' : 'none',
                transition: 'all 0.3s',
              }}>
                {step > s.n ? '✓' : s.icon}
              </div>
              <span style={{ fontSize: '0.7rem', color: step === s.n ? '#1E90FF' : step > s.n ? '#00C48C' : '#607080', whiteSpace: 'nowrap', fontWeight: step === s.n ? 700 : 400 }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                height: '1px', flex: 1, margin: '0 0.5rem',
                marginBottom: '1.25rem',
                background: step > s.n ? 'rgba(0,196,140,0.4)' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Details ── */}
      {step === 1 && (
        <div className="card animate-fade-up" style={{ padding: '2rem' }}>
          {/* Language selector */}
          <div className="form-group">
            <label className="form-label">भाषा चुनें</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {LANG_OPTIONS.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => update('sourceLang', lang.code)}
                  style={{
                    padding: '0.4rem 0.875rem',
                    borderRadius: '999px',
                    border: form.sourceLang === lang.code
                      ? '1.5px solid rgba(30,144,255,0.5)'
                      : '1.5px solid rgba(255,255,255,0.1)',
                    background: form.sourceLang === lang.code
                      ? 'rgba(30,144,255,0.15)'
                      : 'transparent',
                    color: form.sourceLang === lang.code ? '#1E90FF' : '#607080',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
            {form.sourceLang !== 'en' && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(245,166,35,0.08)',
                border: '1px solid rgba(245,166,35,0.2)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#F5A623',
              }}>
                🎤 Bhashini AI अनुवाद सक्रिय होगा — API key मिलने के बाद स्वत: अनुवाद होगा
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              समस्या का शीर्षक <span style={{ color: '#FF4757' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <input
                id="problem-title"
                type="text"
                className="form-input"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                placeholder={form.sourceLang === 'hi' ? 'समस्या का संक्षिप्त विवरण...' : 'Brief problem description...'}
                required
                style={{ flex: 1 }}
              />
              <VoiceInput
                onTranscript={(text) => update('title', form.title + ' ' + text)}
                lang={form.sourceLang as 'hi' | 'en' | 'or' | 'sat'}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              पूरा विवरण <span style={{ color: '#FF4757' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                id="problem-description"
                className="form-textarea"
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder={form.sourceLang === 'hi'
                  ? 'समस्या विस्तार से लिखें — कब से हो रही है, कितने लोग प्रभावित हैं, क्या कोशिश की...'
                  : 'Describe the problem in detail...'}
                required
                rows={5}
                style={{ paddingRight: '3.5rem' }}
              />
              <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem' }}>
                <VoiceInput
                  onTranscript={(text) => update('description', form.description + ' ' + text)}
                  lang={form.sourceLang as 'hi' | 'en' | 'or' | 'sat'}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#607080' }}>{form.description.length} अक्षर</span>
            </div>
          </div>

          {/* Live domain preview */}
          {livePreview && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(30,144,255,0.06)',
              border: '1px solid rgba(30,144,255,0.15)',
              borderRadius: '10px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.8rem',
            }}>
              <span>🤖</span>
              <div>
                <span style={{ color: '#607080' }}>AI पूर्वावलोकन: </span>
                <span className="domain-tag" style={{ marginLeft: '0.3rem' }}>{livePreview.domain}</span>
                <span style={{ color: '#607080', marginLeft: '0.5rem' }}>→ {livePreview.routedTo}</span>
              </div>
            </div>
          )}

          {/* District */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              जिला <span style={{ color: '#FF4757' }}>*</span>
            </label>
            <select
              id="problem-district"
              className="form-select"
              value={form.districtId}
              onChange={e => update('districtId', e.target.value)}
              required
            >
              <option value="">— जिला चुनें —</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.nameHi} ({d.name})</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              if (!form.title.trim() || !form.description.trim() || !form.districtId) {
                setError('कृपया सभी आवश्यक फ़ील्ड भरें')
                return
              }
              setError(null)
              setStep(2)
            }}
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem', fontSize: '1rem' }}
          >
            अगला चरण →
          </button>
          {error && <div className="alert alert-error" style={{ marginTop: '1rem', fontSize: '0.85rem' }}><span>⚠️</span><span>{error}</span></div>}
        </div>
      )}

      {/* ── STEP 2: Urgency ── */}
      {step === 2 && (
        <div className="card animate-fade-up" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>तात्कालिकता स्तर</h3>
          <p style={{ color: '#607080', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            यह समस्या कितनी जरूरी है?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {URGENCY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                id={`urgency-${opt.label.toLowerCase()}`}
                onClick={() => update('urgencyScore', opt.value)}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: form.urgencyScore === opt.value
                    ? '1.5px solid rgba(30,144,255,0.5)'
                    : '1.5px solid rgba(255,255,255,0.08)',
                  background: form.urgencyScore === opt.value
                    ? 'rgba(30,144,255,0.1)'
                    : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  transition: 'all 0.2s',
                  color: '#fff',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{opt.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#607080' }}>{opt.desc}</div>
                </div>
                {form.urgencyScore === opt.value && <span style={{ marginLeft: 'auto', color: '#1E90FF' }}>✓</span>}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1 }}>← वापस</button>
            <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2, padding: '0.875rem' }}>
              पुष्टि करें →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirm ── */}
      {step === 3 && (
        <div className="card animate-fade-up" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>सबमिट करने से पहले जांचें</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'शीर्षक', value: form.title },
              { label: 'विवरण', value: form.description.slice(0, 120) + (form.description.length > 120 ? '…' : '') },
              { label: 'जिला', value: districts.find(d => d.id === form.districtId)?.nameHi || '-' },
              { label: 'भाषा', value: LANG_OPTIONS.find(l => l.code === form.sourceLang)?.label || form.sourceLang },
              { label: 'तात्कालिकता', value: URGENCY_OPTIONS.find(o => o.value === form.urgencyScore)?.label || '-' },
              ...(livePreview ? [{ label: 'AI Domain Preview', value: livePreview.domain }] : []),
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', gap: '0.75rem',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ fontSize: '0.78rem', color: '#607080', minWidth: '90px', flexShrink: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: '0.15rem' }}>
                  {row.label}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#B0BEC5', lineHeight: 1.5 }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(0,196,140,0.08)',
            border: '1px solid rgba(0,196,140,0.2)',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            color: '#00C48C',
          }}>
            ✓ सबमिट करने पर आपको <strong>+10 पॉइंट्स</strong> मिलेंगे
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setStep(2)} className="btn btn-ghost" style={{ flex: 1 }}>← वापस</button>
            <button
              id="submit-problem-btn"
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 2, padding: '0.875rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="spinner" />
                  दर्ज हो रहा है...
                </span>
              ) : '✓ समस्या दर्ज करें'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
