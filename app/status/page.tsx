'use client'

import { useState } from 'react'

interface Problem {
  id: string
  title: string
  description: string
  domain: string | null
  routedTo: string | null
  status: string
  createdAt: string
  district: { name: string; nameHi: string }
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:     'लंबित',
  IN_PROGRESS: 'प्रक्रियाधीन',
  RESOLVED:    'हल हो गई',
  REJECTED:    'अस्वीकृत',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:     '#b45309',
  IN_PROGRESS: '#1d4ed8',
  RESOLVED:    '#15803d',
  REJECTED:    '#b91c1c',
}

const STATUS_BG: Record<string, string> = {
  PENDING:     '#fef3c7',
  IN_PROGRESS: '#dbeafe',
  RESOLVED:    '#dcfce7',
  REJECTED:    '#fee2e2',
}

export default function StatusPage() {
  const [phone, setPhone]       = useState('')
  const [problems, setProblems] = useState<Problem[] | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setProblems(null)

    try {
      const res = await fetch(`/api/problems/my?phone=${encodeURIComponent(phone)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'कुछ गलत हुआ')
      setProblems(data.problems)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'नेटवर्क त्रुटि')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('hi-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

  return (
    <main style={{ fontFamily: 'var(--font-noto-devanagari), sans-serif' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ borderBottom: '2px solid #1a56db', paddingBottom: '12px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a56db', margin: 0 }}>
            समस्या स्थिति
          </h1>
          <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 0' }}>
            अपना मोबाइल नंबर दर्ज कर दर्ज समस्याएं देखें
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="10 अंकों का मोबाइल नंबर"
            required
            pattern="[0-9]{10}"
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '15px',
              color: '#111',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#93c5fd' : '#1a56db',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'खोज रहे हैं...' : 'खोजें'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #dc2626',
            borderRadius: '4px', padding: '12px 16px', marginBottom: '20px',
          }}>
            <p style={{ color: '#b91c1c', margin: 0, fontSize: '14px' }}>✗ {error}</p>
          </div>
        )}

        {/* Results */}
        {problems !== null && (
          problems.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 16px',
              color: '#888', fontSize: '15px',
            }}>
              इस नंबर पर कोई समस्या दर्ज नहीं है।
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px' }}>
                कुल <strong>{problems.length}</strong> समस्या मिली
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {problems.map(p => (
                  <div key={p.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '16px',
                    backgroundColor: '#fff',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0, flex: 1 }}>
                        {p.title}
                      </h2>
                      <span style={{
                        fontSize: '12px', fontWeight: '600',
                        color: STATUS_COLOR[p.status] ?? '#555',
                        backgroundColor: STATUS_BG[p.status] ?? '#f3f4f6',
                        padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap',
                      }}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#444', margin: '0 0 10px', lineHeight: '1.5' }}>
                      {p.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: '12px', color: '#666' }}>
                      <span>📍 {p.district.nameHi} ({p.district.name})</span>
                      {p.domain    && <span>🏷 {p.domain}</span>}
                      {p.routedTo  && <span>📨 {p.routedTo}</span>}
                      <span>📅 {formatDate(p.createdAt)}</span>
                    </div>

                    <p style={{ fontSize: '11px', color: '#aaa', margin: '10px 0 0', fontFamily: 'monospace' }}>
                      ID: {p.id}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Back link */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#1a56db', fontSize: '14px', textDecoration: 'none' }}>
            ← समस्या दर्ज करें
          </a>
        </div>
      </div>
    </main>
  )
}
