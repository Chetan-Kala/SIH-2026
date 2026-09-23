'use client'

import { useState, useEffect, useCallback } from 'react'


interface Problem {
  id: string
  title: string
  description: string
  aiSummary?: string
  domain?: string
  aiClassifiedDomain?: string
  urgencyScore: number
  sourceLang: string
  titleHi?: string
  status: string
  createdAt: string
  submitter: { name: string; phone: string }
  district: { name: string; nameHi: string }
}

interface Stats {
  pending: number
  verifiedToday: number
  rejectedToday: number
  totalToday: number
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
  if (score >= 50) return { label: 'HIGH',     cls: 'urgency-high' }
  if (score >= 20) return { label: 'MEDIUM',   cls: 'urgency-medium' }
  return              { label: 'LOW',      cls: 'urgency-low' }
}

export default function RegionalDashboard() {
  const [problems, setProblems]           = useState<Problem[]>([])
  const [stats, setStats]                 = useState<Stats>({ pending: 0, verifiedToday: 0, rejectedToday: 0, totalToday: 0 })
  const [loading, setLoading]             = useState(true)
  const [actionId, setActionId]           = useState<string | null>(null)
  const [rejectModal, setRejectModal]     = useState<{ id: string; title: string } | null>(null)
  const [rejectReason, setRejectReason]   = useState('')
  const [routeModal, setRouteModal]       = useState<{ id: string; title: string } | null>(null)
  const [routingPath, setRoutingPath]     = useState<'HUB' | 'MINISTRY'>('HUB')
  const [routedTo, setRoutedTo]           = useState('')
  const [toast, setToast]                 = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [domainFilter, setDomainFilter]   = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchProblems = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ status: 'PENDING', limit: '50' })
    if (domainFilter) params.set('domain', domainFilter)
    const res = await fetch(`/api/problems?${params}`)
    const data = await res.json()
    let list: Problem[] = data.problems ?? []

    if (urgencyFilter === 'critical') list = list.filter(p => p.urgencyScore >= 80)
    else if (urgencyFilter === 'high') list = list.filter(p => p.urgencyScore >= 50 && p.urgencyScore < 80)
    else if (urgencyFilter === 'medium') list = list.filter(p => p.urgencyScore >= 20 && p.urgencyScore < 50)
    else if (urgencyFilter === 'low') list = list.filter(p => p.urgencyScore < 20)

    setProblems(list)
    setStats(s => ({ ...s, pending: data.total ?? list.length }))
    setLoading(false)
  }, [domainFilter, urgencyFilter])

  useEffect(() => { fetchProblems() }, [fetchProblems])

  const handleVerify = async (id: string) => {
    setActionId(id)
    const res = await fetch(`/api/problems/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'VERIFIED', visibility: 'VERIFIED' }),
    })
    if (res.ok) {
      showToast('✅ Problem verified!')
      setStats(s => ({ ...s, verifiedToday: s.verifiedToday + 1 }))
      setProblems(prev => prev.filter(p => p.id !== id))
    } else {
      showToast('Failed to verify', 'error')
    }
    setActionId(null)
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setActionId(rejectModal.id)
    const res = await fetch(`/api/problems/${rejectModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', rejectionReason: rejectReason }),
    })
    if (res.ok) {
      showToast('Problem rejected')
      setStats(s => ({ ...s, rejectedToday: s.rejectedToday + 1 }))
      setProblems(prev => prev.filter(p => p.id !== rejectModal.id))
    } else {
      showToast('Failed to reject', 'error')
    }
    setRejectModal(null)
    setRejectReason('')
    setActionId(null)
  }

  const handleRoute = async () => {
    if (!routeModal) return
    setActionId(routeModal.id)
    const res = await fetch(`/api/problems/${routeModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ROUTED',
        visibility: routingPath === 'HUB' ? 'PUBLIC' : 'VERIFIED',
        routingPath,
        routedTo: routedTo || (routingPath === 'HUB' ? 'Public Hub' : 'Ministry'),
      }),
    })
    if (res.ok) {
      showToast(`✅ Routed to ${routingPath === 'HUB' ? 'Public Hub' : 'Ministry'}`)
      setProblems(prev => prev.filter(p => p.id !== routeModal.id))
    } else {
      showToast('Routing failed', 'error')
    }
    setRouteModal(null)
    setRoutedTo('')
    setActionId(null)
  }

  const domains = Array.from(new Set(problems.map(p => p.domain || p.aiClassifiedDomain).filter(Boolean)))

  return (
    <>
      

      <main style={{ minHeight: '100vh', paddingBottom: 60 }}>
        {/* Header */}
        <div style={{
          background: 'var(--gradient-gov-header)',
          padding: '20px 0',
          borderBottom: '3px solid var(--gov-amber)',
        }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  क्षेत्रीय अधिकारी पोर्टल · Regional Head Portal
                </div>
                <h1 style={{ fontFamily: 'var(--font-devanagari)', fontSize: '1.5rem', marginBottom: 2, color: '#fff' }}>
                  समस्या समीक्षा डैशबोर्ड
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>
                  Review, verify and route citizen-submitted problems · SIH-26043
                </p>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'लंबित / Pending', value: stats.pending, bg: 'rgba(232,130,26,0.2)', border: 'rgba(232,130,26,0.4)', color: '#FFD54F' },
                  { label: 'आज सत्यापित', value: stats.verifiedToday, bg: 'rgba(19,136,8,0.2)', border: 'rgba(19,136,8,0.4)', color: '#69F0AE' },
                  { label: 'आज अस्वीकृत', value: stats.rejectedToday, bg: 'rgba(198,40,40,0.2)', border: 'rgba(198,40,40,0.4)', color: '#FF8A80' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderRadius: '6px',
                    padding: '8px 16px',
                    textAlign: 'center',
                    minWidth: 80,
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 2, fontFamily: 'var(--font-devanagari)' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 32 }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              className="form-select"
              style={{ maxWidth: 220 }}
            >
              <option value="">All Domains</option>
              {domains.map(d => <option key={d} value={d!}>{DOMAIN_EMOJI[d!] || '📋'} {d}</option>)}
            </select>
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
              className="form-select"
              style={{ maxWidth: 180 }}
            >
              <option value="">All Urgency</option>
              <option value="critical">🔴 Critical (80-100)</option>
              <option value="high">🟡 High (50-79)</option>
              <option value="medium">🔵 Medium (20-49)</option>
              <option value="low">⚪ Low (0-19)</option>
            </select>
            <button onClick={fetchProblems} className="btn btn-outline btn-sm">↻ Refresh</button>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-md)' }} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && problems.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
              <h3>No pending problems!</h3>
              <p style={{ marginTop: 8 }}>All problems have been reviewed. Check back later.</p>
            </div>
          )}

          {/* Problem Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {problems.map(p => {
              const domain = p.domain || p.aiClassifiedDomain || 'General'
              const urg    = urgencyLevel(p.urgencyScore)
              const isActing = actionId === p.id

              return (
                <div key={p.id} className="card slide-up" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Urgency stripe */}
                  <div style={{
                    height: 4,
                    background: p.urgencyScore >= 80 ? '#FF4757' : p.urgencyScore >= 50 ? '#F5A623' : p.urgencyScore >= 20 ? '#1E90FF' : '#607080',
                  }} />

                  <div style={{ padding: 20 }}>
                    {/* Top row */}
                    <div className="flex-between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className={`badge ${urg.cls}`}>{urg.label}</span>
                        <span className="badge badge-blue">{DOMAIN_EMOJI[domain] || '📋'} {domain}</span>
                        {p.sourceLang !== 'en' && (
                          <span className="badge badge-purple">🌐 {p.sourceLang.toUpperCase()}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Urgency Score:</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                          {p.urgencyScore}
                        </span>
                        <div className="progress-bar" style={{ width: 80 }}>
                          <div className="progress-fill" style={{ width: `${p.urgencyScore}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{ marginBottom: 6, fontSize: '1rem', fontWeight: 700 }}>{p.title}</h3>
                    {p.titleHi && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 8 }}>{p.titleHi}</p>
                    )}

                    {/* AI Summary */}
                    {p.aiSummary && (
                      <div style={{
                        background: 'rgba(155,89,182,0.08)',
                        border: '1px solid rgba(155,89,182,0.2)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        marginBottom: 10,
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                      }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9B59B6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          AI Summary •
                        </span>{' '}
                        {p.aiSummary}
                      </div>
                    )}

                    {/* Full description */}
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 12, color: 'var(--text-secondary)' }}>
                      {p.description.length > 250 ? p.description.slice(0, 247) + '...' : p.description}
                    </p>

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                      <span>📍 {p.district.nameHi} ({p.district.name})</span>
                      <span>👤 {p.submitter.name}</span>
                      <span>📞 {p.submitter.phone}</span>
                      <span>📅 {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        id={`verify-${p.id}`}
                        onClick={() => handleVerify(p.id)}
                        disabled={isActing}
                        className="btn btn-success btn-sm"
                      >
                        ✓ Verify
                      </button>
                      <button
                        id={`route-${p.id}`}
                        onClick={() => setRouteModal({ id: p.id, title: p.title })}
                        disabled={isActing}
                        className="btn btn-primary btn-sm"
                      >
                        → Route
                      </button>
                      <button
                        id={`reject-${p.id}`}
                        onClick={() => setRejectModal({ id: p.id, title: p.title })}
                        disabled={isActing}
                        className="btn btn-danger btn-sm"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModal && (
        <Modal title="Reject Problem" onClose={() => setRejectModal(null)}>
          <p style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Rejecting: <strong style={{ color: 'var(--text-primary)' }}>{rejectModal.title}</strong>
          </p>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Rejection Reason <span style={{ color: 'var(--color-red)' }}>*</span></label>
            <textarea
              className="form-textarea"
              placeholder="Explain why this problem is being rejected..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setRejectModal(null)} className="btn btn-ghost btn-sm">Cancel</button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionId !== null}
              className="btn btn-danger btn-sm"
            >
              Confirm Reject
            </button>
          </div>
        </Modal>
      )}

      {/* Route Modal */}
      {routeModal && (
        <Modal title="Route Problem" onClose={() => setRouteModal(null)}>
          <p style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Routing: <strong style={{ color: 'var(--text-primary)' }}>{routeModal.title}</strong>
          </p>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Routing Path</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['HUB', 'MINISTRY'] as const).map(path => (
                <button
                  key={path}
                  onClick={() => setRoutingPath(path)}
                  className={`btn btn-sm ${routingPath === path ? 'btn-primary' : 'btn-outline'}`}
                >
                  {path === 'HUB' ? '🌐 Public Hub' : '🏛️ Ministry'}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Route To (optional)</label>
            <input
              className="form-input"
              placeholder={routingPath === 'HUB' ? 'e.g., IIT Dhanbad' : 'e.g., Education Ministry'}
              value={routedTo}
              onChange={e => setRoutedTo(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setRouteModal(null)} className="btn btn-ghost btn-sm">Cancel</button>
            <button onClick={handleRoute} disabled={actionId !== null} className="btn btn-primary btn-sm">
              Confirm Route
            </button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, animation: 'slideUp 0.25s ease' }}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '1rem' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
