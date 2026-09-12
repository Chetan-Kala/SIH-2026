'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProblemCard from '@/components/ProblemCard'
import StatsCard from '@/components/StatsCard'

interface Problem {
  id: string; title: string; description: string; domain?: string;
  status: string; visibility: string; district: { name: string; nameHi: string };
  submitter?: { name: string }; createdAt: string; urgencyScore?: number; aiSummary?: string;
}

export default function UniversityDashboard() {
  const router = useRouter()
  const [user, setUser]         = useState<{ name: string; orgName?: string } | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login?from=/university/dashboard'); return }
    try {
      const p = JSON.parse(atob(token.split('.')[1]))
      if (p.role !== 'UNIVERSITY' && p.role !== 'ADMIN') { router.push('/'); return }
      setUser(p)
    } catch { router.push('/login') }
  }, [router])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetch('/api/problems?visibility=PUBLIC&limit=20')
      .then(r => r.json())
      .then(d => { setProblems(d.problems || []); setLoading(false) })
  }, [user])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="badge badge-public" style={{ marginBottom: '0.6rem' }}>विश्वविद्यालय</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {user?.orgName || user?.name || 'विश्वविद्यालय'} — डैशबोर्ड
        </h1>
        <p style={{ color: '#607080', fontSize: '0.875rem' }}>
          उपलब्ध समस्याएं देखें और हैकाथॉन शुरू करें
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatsCard icon="🌐" value={problems.length} label="उपलब्ध समस्याएं"  color="blue"  sublabel="Public Problem Hub" />
        <StatsCard icon="🏆" value="0"               label="हैकाथॉन"          color="gold"  sublabel="आयोजित" />
        <StatsCard icon="👥" value="0"               label="टीम रजिस्ट्रेशन"  color="green" sublabel="इस सत्र में" />
        <StatsCard icon="⭐" value="0"               label="विजेता टीमें"      color="cyan"  sublabel="अब तक" />
      </div>

      {/* Bhashini notice */}
      <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
        <span>🎤</span>
        <span>Bhashini API integration आने पर समस्याओं का स्वत: हिंदी/क्षेत्रीय भाषा में अनुवाद मिलेगा</span>
      </div>

      {/* Available problems */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        🌐 उपलब्ध सार्वजनिक समस्याएं
      </h2>

      {loading ? (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: '130px', borderRadius: '16px' }} className="skeleton" />)}
        </div>
      ) : problems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#607080' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
          <div style={{ fontWeight: 700, color: '#B0BEC5' }}>अभी कोई सार्वजनिक समस्या नहीं</div>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>क्षेत्रीय अध्यक्ष के सत्यापन के बाद समस्याएं यहाँ आएंगी</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {problems.map(p => <ProblemCard key={p.id} problem={p} compact />)}
        </div>
      )}

      {/* Hackathon placeholder */}
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏆</div>
        <h3 style={{ marginBottom: '0.5rem' }}>हैकाथॉन मॉड्यूल — जल्द आ रहा है</h3>
        <p style={{ color: '#607080', fontSize: '0.875rem' }}>
          Phase 3 में: हैकाथॉन बनाएं, टीमें रजिस्टर करें, राउंड प्रबंधित करें, विजेता घोषित करें
        </p>
      </div>
    </div>
  )
}
