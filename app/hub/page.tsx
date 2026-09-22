'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Problem {
  id: string
  title: string
  description: string
  domain?: string
  urgencyScore: number
  status: string
  visibility: string
  phase: string
  aiSummary?: string
  createdAt: string
  district: { name: string; nameHi: string }
  solutions: { id: string; status: string }[]
}

const DOMAIN_EMOJI: Record<string, string> = {
  'Roads & Infrastructure': '🛣️',
  'Water Supply & Sanitation': '💧',
  'Electricity': '⚡',
  'Waste Management': '🗑️',
  'Public Health': '🏥',
  'Law & Order': '🚔',
  'Education': '📚',
  'Transport': '🚌',
  'General': '📋',
}

function urgencyLevel(score: number) {
  if (score >= 80) return { label: 'CRITICAL', cls: 'urgency-critical' }
  if (score >= 50) return { label: 'HIGH', cls: 'urgency-high' }
  if (score >= 20) return { label: 'MEDIUM', cls: 'urgency-medium' }
  return { label: 'LOW', cls: 'urgency-low' }
}

export default function PublicHub() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [domain, setDomain]     = useState('')
  const [phase, setPhase]       = useState('')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ visibility: 'PUBLIC', page: String(page), limit: '18' })
    if (domain) params.set('domain', domain)
    if (phase)  params.set('phase', phase)

    fetch(`/api/problems?${params}`)
      .then(r => r.json())
      .then(data => {
        setProblems(data.problems ?? [])
        setTotal(data.total ?? 0)
        setLoading(false)
      })
  }, [page, domain, phase])

  const filtered = search
    ? problems.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.aiSummary ?? '').toLowerCase().includes(search.toLowerCase()))
    : problems

  const domains = [
    'Roads & Infrastructure', 'Water Supply & Sanitation', 'Electricity',
    'Waste Management', 'Public Health', 'Law & Order', 'Education', 'Transport',
  ]

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '100vh', paddingBottom: 80 }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0D1B2A 0%, #0a1a30 60%, #0D1B2A 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '48px 0 40px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative glow */}
          <div style={{
            position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 300,
            background: 'radial-gradient(ellipse, rgba(30,144,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center', display: 'flex', marginBottom: 12 }}>
              🌐 Public Problem Hub
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem,4vw,2.5rem)', marginBottom: 12 }}>
              सार्वजनिक समस्या हब
            </h1>
            <p style={{ maxWidth: 560, margin: '0 auto 24px', color: 'var(--text-secondary)' }}>
              Verified societal challenges from across Jharkhand — open for universities,
              industries, and citizens to solve.
            </p>

            {/* Search */}
            <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
              <input
                className="form-input"
                style={{ paddingLeft: 40, borderRadius: 'var(--radius-lg)' }}
                placeholder="Search problems..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Stat */}
            <div style={{ marginTop: 20, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--color-blue)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                {total}
              </span>{' '}verified problems awaiting innovative solutions
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 32 }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="tabs">
              <button className={`tab-btn ${phase === '' ? 'active' : ''}`} onClick={() => setPhase('')}>All</button>
              <button className={`tab-btn ${phase === 'SUMMER' ? 'active' : ''}`} onClick={() => setPhase('SUMMER')}>☀️ Summer</button>
              <button className={`tab-btn ${phase === 'WINTER' ? 'active' : ''}`} onClick={() => setPhase('WINTER')}>❄️ Winter</button>
            </div>

            <select value={domain} onChange={e => setDomain(e.target.value)} className="form-select" style={{ maxWidth: 220 }}>
              <option value="">All Domains</option>
              {domains.map(d => <option key={d} value={d}>{DOMAIN_EMOJI[d] || '📋'} {d}</option>)}
            </select>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid-3" style={{ gap: 20 }}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 240, borderRadius: 'var(--radius-md)' }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔭</div>
              <h3>No problems found</h3>
              <p style={{ marginTop: 8 }}>Try changing the filters or check back later.</p>
            </div>
          )}

          {/* Problem Grid */}
          {!loading && (
            <div className="grid-3" style={{ gap: 20 }}>
              {filtered.map(p => {
                const dom = p.domain || 'General'
                const urg = urgencyLevel(p.urgencyScore)
                return (
                  <Link
                    key={p.id}
                    href={`/hub/${p.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="card glow-border" style={{ height: '100%', cursor: 'pointer', position: 'relative', padding: 0, overflow: 'hidden' }}>
                      {/* Urgency top bar */}
                      <div style={{
                        height: 3,
                        background: p.urgencyScore >= 80 ? '#FF4757' : p.urgencyScore >= 50 ? '#F5A623' : '#1E90FF',
                      }} />

                      <div style={{ padding: 20 }}>
                        {/* Badges */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                          <span className={`badge ${urg.cls}`} style={{ fontSize: '0.65rem' }}>{urg.label}</span>
                          <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{DOMAIN_EMOJI[dom] || '📋'} {dom}</span>
                          <span className={`badge ${p.phase === 'SUMMER' ? 'badge-gold' : 'badge-grey'}`} style={{ fontSize: '0.65rem' }}>
                            {p.phase === 'SUMMER' ? '☀️' : '❄️'} {p.phase}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: '0.95rem', marginBottom: 8, lineHeight: 1.4 }}>{p.title}</h3>

                        {/* AI Summary */}
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                          {p.aiSummary || p.description.slice(0, 120) + '...'}
                        </p>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            📍 {p.district.nameHi}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            💡 {p.solutions.length} solution{p.solutions.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && total > 18 && (
            <div className="flex-center" style={{ gap: 10, marginTop: 40 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline btn-sm"
              >← Prev</button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Page {page} of {Math.ceil(total / 18)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 18)}
                className="btn btn-outline btn-sm"
              >Next →</button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
