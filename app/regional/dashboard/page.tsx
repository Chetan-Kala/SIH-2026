'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ProblemCard from '@/components/ProblemCard'
import StatsCard from '@/components/StatsCard'

interface Problem {
  id: string
  title: string
  description: string
  domain?: string
  status: string
  visibility: string
  urgencyScore?: number
  aiSummary?: string
  sourceLang?: string
  district: { name: string; nameHi: string }
  submitter?: { name: string }
  createdAt: string
}

interface Stats {
  pending: number
  verified: number
  rejected: number
  total: number
}

const ROUTE_OPTIONS = [
  { value: 'Ministry/Government Board', label: '🏛️ Ministry/Govt Board' },
  { value: 'Public Problem Hub', label: '🌐 Public Problem Hub' },
  { value: 'Education Department', label: '📚 Education Dept' },
  { value: 'Health Department', label: '🏥 Health Dept' },
  { value: 'Public Works Department', label: '🛣️ Public Works' },
  { value: 'Water & Sewerage Department', label: '💧 Water Dept' },
  { value: 'District Collector Office', label: '🏢 District Collector' },
]

export default function RegionalDashboard() {
  const router = useRouter()
  const [user, setUser]         = useState<{ name: string; role: string } | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [stats, setStats]       = useState<Stats>({ pending: 0, verified: 0, rejected: 0, total: 0 })
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'>('PENDING_REVIEW')
  const [routeModal, setRouteModal] = useState<{ problemId: string } | null>(null)
  const [routeTo, setRouteTo]   = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login?from=/regional/dashboard'); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'REGIONAL_HEAD' && payload.role !== 'ADMIN') {
        router.push('/?error=unauthorized')
        return
      }
      setUser(payload)
    } catch {
      router.push('/login')
    }
  }, [router])

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/problems?visibility=${tab}&limit=50`)
    const data = await res.json()
    setProblems(data.problems || [])

    // Load stats
    const [p, v, r] = await Promise.all([
      fetch('/api/problems?visibility=PENDING_REVIEW&limit=1').then(r => r.json()),
      fetch('/api/problems?visibility=VERIFIED&limit=1').then(r => r.json()),
      fetch('/api/problems?status=REJECTED&limit=1').then(r => r.json()),
    ])
    setStats({
      pending:  p.total || 0,
      verified: v.total || 0,
      rejected: r.total || 0,
      total:    (p.total || 0) + (v.total || 0) + (r.total || 0),
    })
    setLoading(false)
  }, [tab])

  useEffect(() => { if (user) load() }, [user, load])

  const handleVerify = async (id: string) => {
    setRouteModal({ problemId: id })
  }

  const confirmVerify = async () => {
    if (!routeModal) return
    setActionLoading(routeModal.problemId)
    await fetch(`/api/problems/${routeModal.problemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'VERIFIED', visibility: 'VERIFIED', routedTo: routeTo || 'Public Problem Hub' }),
    })
    setRouteModal(null)
    setRouteTo('')
    setActionLoading(null)
    load()
  }

  const handleReject = async (id: string) => {
    if (!confirm('क्या आप इस समस्या को अस्वीकार करना चाहते हैं?')) return
    setActionLoading(id)
    await fetch(`/api/problems/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', visibility: 'PENDING_REVIEW' }),
    })
    setActionLoading(null)
    load()
  }

  const TABS = [
    { key: 'PENDING_REVIEW' as const, label: 'समीक्षा में', count: stats.pending, color: '#F5A623' },
    { key: 'VERIFIED' as const,       label: 'सत्यापित',    count: stats.verified, color: '#1E90FF' },
    { key: 'REJECTED' as const,       label: 'अस्वीकृत',    count: stats.rejected, color: '#FF4757' },
  ]

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-pending" style={{ marginBottom: '0.6rem' }}>क्षेत्रीय अध्यक्ष</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {user?.name ? `नमस्ते, ${user.name} 👋` : 'डैशबोर्ड'}
            </h1>
            <p style={{ color: '#607080', fontSize: '0.875rem' }}>
              समस्याओं की समीक्षा करें, सत्यापित करें, और सही विभाग तक रूट करें
            </p>
          </div>
          <button onClick={load} className="btn btn-ghost btn-sm">🔄 ताज़ा करें</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <StatsCard icon="📥" value={stats.pending}  label="समीक्षा में"  color="gold"  sublabel="Pending review" />
        <StatsCard icon="✅" value={stats.verified} label="सत्यापित"    color="blue"  sublabel="Verified" />
        <StatsCard icon="✗"  value={stats.rejected} label="अस्वीकृत"   color="red"   sublabel="Rejected" />
        <StatsCard icon="📊" value={stats.total}    label="कुल समस्याएं" color="cyan"  sublabel="Total processed" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setProblems([]) }}
            style={{
              padding: '0.625rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.key ? `2px solid ${t.color}` : '2px solid transparent',
              color: tab === t.key ? t.color : '#607080',
              fontWeight: tab === t.key ? 700 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: 'inherit',
              marginBottom: '-1px',
            }}
          >
            {t.label}
            <span style={{
              padding: '0.1rem 0.45rem', borderRadius: '999px',
              background: tab === t.key ? `${t.color}22` : 'rgba(255,255,255,0.06)',
              color: tab === t.key ? t.color : '#607080',
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Problems list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: '120px', borderRadius: '16px' }} className="skeleton" />
          ))}
        </div>
      ) : problems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#607080' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
          <div style={{ fontWeight: 700, color: '#B0BEC5' }}>
            {tab === 'PENDING_REVIEW' ? 'समीक्षा की कोई समस्या नहीं' : 'कोई रिकॉर्ड नहीं'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {problems.map(p => (
            <div key={p.id}>
              <ProblemCard
                problem={p}
                showActions={tab === 'PENDING_REVIEW'}
                onVerify={handleVerify}
                onReject={handleReject}
              />
              {actionLoading === p.id && (
                <div style={{ textAlign: 'center', padding: '0.5rem', color: '#1E90FF', fontSize: '0.8rem' }}>
                  <span className="spinner" style={{ width: '14px', height: '14px', marginRight: '0.5rem', display: 'inline-block' }} />
                  प्रक्रिया हो रही है...
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Route Modal */}
      {routeModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>✅ सत्यापित करें और रूट करें</h3>
            <p style={{ color: '#607080', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              इस समस्या को किस विभाग / मंच पर भेजना है?
            </p>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">भेजें</label>
              <select
                className="form-select"
                value={routeTo}
                onChange={e => setRouteTo(e.target.value)}
              >
                <option value="">— विकल्प चुनें —</option>
                {ROUTE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setRouteModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>रद्द करें</button>
              <button onClick={confirmVerify} className="btn btn-primary" style={{ flex: 2 }}>
                ✓ सत्यापित करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
