'use client'

import { useState, useEffect, useCallback } from 'react'
import ProblemCard from '@/components/ProblemCard'

interface Problem {
  id: string
  title: string
  description: string
  domain?: string
  status: string
  visibility: string
  district: { name: string; nameHi: string }
  submitter?: { name: string }
  createdAt: string
  urgencyScore?: number
  aiSummary?: string
}

const DOMAINS = [
  { value: '', label: 'सभी क्षेत्र' },
  { value: 'Roads & Infrastructure', label: '🛣️ सड़क' },
  { value: 'Water Supply & Sanitation', label: '💧 जल आपूर्ति' },
  { value: 'Electricity', label: '⚡ बिजली' },
  { value: 'Waste Management', label: '♻️ कचरा' },
  { value: 'Public Health', label: '🏥 स्वास्थ्य' },
  { value: 'Law & Order', label: '🚔 कानून' },
  { value: 'Education', label: '📚 शिक्षा' },
  { value: 'Transport', label: '🚌 परिवहन' },
  { value: 'Agriculture', label: '🌾 कृषि' },
  { value: 'General', label: '📋 सामान्य' },
]

export default function PublicHubPage() {
  const [problems, setProblems]   = useState<Problem[]>([])
  const [loading, setLoading]     = useState(true)
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [domain, setDomain]       = useState('')
  const [sortBy, setSortBy]       = useState<'urgency' | 'recent'>('recent')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      visibility: 'PUBLIC',
      page: String(page),
      limit: '15',
    })
    if (domain) params.set('domain', domain)

    const res = await fetch(`/api/problems?${params}`)
    const data = await res.json()
    setProblems(data.problems || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, domain])

  useEffect(() => { load() }, [load])

  const filtered = problems.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.district.nameHi.includes(q)
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'urgency') return (b.urgencyScore || 0) - (a.urgencyScore || 0)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div>
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(30,144,255,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(30,144,255,0.1)',
        padding: '3rem 1.5rem 2rem',
        textAlign: 'center',
      }}>
        <div className="badge badge-public" style={{ marginBottom: '1rem' }}>
          🌐 सार्वजनिक
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
          समस्या हब
        </h1>
        <p style={{ color: '#B0BEC5', maxWidth: '500px', margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.7 }}>
          झारखंड के नागरिकों द्वारा दर्ज सत्यापित समस्याएं — विश्वविद्यालय और उद्योग इन्हें हल कर सकते हैं
        </p>
        {total > 0 && (
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#607080' }}>
            कुल <strong style={{ color: '#1E90FF' }}>{total}</strong> समस्याएं
          </div>
        )}
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Filters */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
          marginBottom: '2rem', alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '0.875rem', top: '50%',
              transform: 'translateY(-50%)', color: '#607080', fontSize: '1rem',
              pointerEvents: 'none',
            }}>🔍</span>
            <input
              id="hub-search"
              type="text"
              className="form-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="खोजें — शीर्षक, जिला..."
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Domain filter */}
          <select
            id="hub-domain-filter"
            className="form-select"
            value={domain}
            onChange={e => { setDomain(e.target.value); setPage(1) }}
            style={{ flex: '0 1 180px' }}
          >
            {DOMAINS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          {/* Sort */}
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {[{ v: 'recent' as const, label: '🕐 नया' }, { v: 'urgency' as const, label: '🔥 जरूरी' }].map(s => (
              <button
                key={s.v}
                onClick={() => setSortBy(s.v)}
                className={sortBy === s.v ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: '140px', borderRadius: '16px' }} className="skeleton" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#607080' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#B0BEC5' }}>
              {search ? 'कोई परिणाम नहीं' : 'अभी कोई सार्वजनिक समस्या नहीं'}
            </div>
            <p style={{ fontSize: '0.875rem' }}>
              {search ? 'अलग खोज शब्द आज़माएं' : 'समस्याएं सत्यापन के बाद यहाँ दिखेंगी'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {sorted.map(p => (
              <ProblemCard key={p.id} problem={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 15 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', alignItems: 'center' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-ghost btn-sm"
            >
              ← पिछला
            </button>
            <span style={{ fontSize: '0.875rem', color: '#607080', padding: '0 0.5rem' }}>
              {page} / {Math.ceil(total / 15)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 15)}
              className="btn btn-ghost btn-sm"
            >
              अगला →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
