'use client'

import { useEffect, useState } from 'react'

interface Problem {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  submitter: {
    name: string
    phone: string
  }
  district: {
    nameHi: string
    name: string
  }
}

type Lang = 'hi' | 'en'

const t = {
  hi: {
    title: 'क्षेत्रीय अधिकारी पोर्टल',
    subtitle: 'लंबित समस्याएँ — सत्यापन / अस्वीकृति',
    loading: 'लोड हो रहा है...',
    empty: 'कोई लंबित समस्या नहीं है।',
    toastVerified: 'समस्या सत्यापित कर दी गई।',
    toastRejected: 'समस्या अस्वीकृत कर दी गई।',
    verify: '✓ सत्यापित करें',
    reject: '✗ अस्वीकार करें',
    badge: 'लंबित',
    toggleLabel: 'English',
    dateLocale: 'hi-IN',
    dateOptions: { day: '2-digit' as const, month: 'long' as const, year: 'numeric' as const },
  },
  en: {
    title: 'Regional Officer Portal',
    subtitle: 'Pending Problems — Verify / Reject',
    loading: 'Loading...',
    empty: 'No pending problems.',
    toastVerified: 'Problem verified successfully.',
    toastRejected: 'Problem rejected successfully.',
    verify: '✓ Verify',
    reject: '✗ Reject',
    badge: 'Pending',
    toggleLabel: 'हिन्दी',
    dateLocale: 'en-IN',
    dateOptions: { day: '2-digit' as const, month: 'short' as const, year: 'numeric' as const },
  },
}

export default function RegionalPage() {
  const [lang, setLang] = useState<Lang>('hi')
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  // Load persisted language preference
  useEffect(() => {
    const saved = localStorage.getItem('regional-lang')
    if (saved === 'en' || saved === 'hi') setLang(saved)
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'hi' ? 'en' : 'hi'
    setLang(next)
    localStorage.setItem('regional-lang', next)
  }

  const fetchProblems = () => {
    setLoading(true)
    fetch('/api/problems')
      .then(r => r.json())
      .then(data => {
        const pending = (data.problems as Problem[]).filter(p => p.status === 'PENDING')
        setProblems(pending)
        setLoading(false)
      })
  }

  useEffect(() => { fetchProblems() }, [])

  const handleAction = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setActionId(id)
    const res = await fetch(`/api/problems/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const msg = status === 'VERIFIED' ? t[lang].toastVerified : t[lang].toastRejected
      setActionMsg(msg)
      setProblems(prev => prev.filter(p => p.id !== id))
      setTimeout(() => setActionMsg(null), 3000)
    }
    setActionId(null)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(t[lang].dateLocale, t[lang].dateOptions)

  const tx = t[lang]

  return (
    <main style={{ fontFamily: 'var(--font-noto-devanagari), sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{
          borderBottom: '2px solid #1a56db',
          paddingBottom: '12px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a56db', margin: 0 }}>
              {tx.title}
            </h1>
            <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 0' }}>
              {tx.subtitle}
            </p>
          </div>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            style={{
              padding: '6px 14px',
              border: '1px solid #1a56db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#1a56db',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'var(--font-noto-devanagari), sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {tx.toggleLabel}
          </button>
        </div>

        {/* Toast */}
        {actionMsg && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #16a34a',
            borderRadius: '4px',
            padding: '10px 16px',
            marginBottom: '20px',
            color: '#15803d',
            fontWeight: '600',
            fontSize: '14px',
          }}>
            ✓ {actionMsg}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p style={{ color: '#666', fontSize: '15px' }}>{tx.loading}</p>
        )}

        {/* Empty state */}
        {!loading && problems.length === 0 && (
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '32px',
            textAlign: 'center',
            backgroundColor: '#fff',
          }}>
            <p style={{ color: '#555', margin: 0 }}>{tx.empty}</p>
          </div>
        )}

        {/* Problem list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {problems.map(p => (
            <div key={p.id} style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '16px',
            }}>
              {/* Title row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>
                  {p.title}
                </h2>
                <span style={{
                  fontSize: '12px',
                  backgroundColor: '#fef9c3',
                  color: '#854d0e',
                  border: '1px solid #fde68a',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  whiteSpace: 'nowrap',
                  marginLeft: '8px',
                }}>
                  {tx.badge}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: '14px', color: '#444', margin: '0 0 12px', lineHeight: '1.6' }}>
                {p.description}
              </p>

              {/* Meta — district always shows both scripts */}
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '14px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <span>📍 <strong>{p.district.nameHi}</strong> ({p.district.name})</span>
                <span>👤 {p.submitter.name}</span>
                <span>📞 {p.submitter.phone}</span>
                <span>📅 {formatDate(p.createdAt)}</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleAction(p.id, 'VERIFIED')}
                  disabled={actionId === p.id}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: actionId === p.id ? '#86efac' : '#16a34a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: actionId === p.id ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-noto-devanagari), sans-serif',
                  }}
                >
                  {tx.verify}
                </button>
                <button
                  onClick={() => handleAction(p.id, 'REJECTED')}
                  disabled={actionId === p.id}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: actionId === p.id ? '#fca5a5' : '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: actionId === p.id ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-noto-devanagari), sans-serif',
                  }}
                >
                  {tx.reject}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
