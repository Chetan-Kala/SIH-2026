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

export default function IndustryDashboard() {
  const router = useRouter()
  const [user, setUser]         = useState<{ name: string; orgName?: string } | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login?from=/industry/dashboard'); return }
    try {
      const p = JSON.parse(atob(token.split('.')[1]))
      if (p.role !== 'INDUSTRY' && p.role !== 'ADMIN') { router.push('/'); return }
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
        <div className="badge badge-assigned" style={{ marginBottom: '0.6rem', background: 'rgba(255,140,66,0.15)', color: '#FF8C42', borderColor: 'rgba(255,140,66,0.3)' }}>
          उद्योग / Industry
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {user?.orgName || user?.name || 'Industry'} — डैशबोर्ड
        </h1>
        <p style={{ color: '#607080', fontSize: '0.875rem' }}>
          छात्र टीमों को सह-मार्गदर्शन या सह-वित्तपोषण करके हैकाथॉन समाधानों को स्केल करें
        </p>
      </div>

      {/* Collaboration enforcement notice */}
      <div className="card" style={{ marginBottom: '2rem', borderColor: 'rgba(255,140,66,0.3)', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: '#FF8C42' }}>
              उद्योग सहयोग नीति — प्लेटफ़ॉर्म नियम
            </div>
            <p style={{ color: '#B0BEC5', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
              इस मंच पर उद्योग <strong>अकेले</strong> समाधान नहीं बना सकते। आपको या तो हैकाथॉन विजेता टीम का{' '}
              <strong>सह-मार्गदर्शन</strong> करना होगा या हैकाथॉन का <strong>सह-वित्तपोषण</strong> करना होगा।
              यह नीति प्लेटफ़ॉर्म के वर्कफ्लो में एन्फोर्स है।
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatsCard icon="🌐" value={problems.length} label="उपलब्ध समस्याएं" color="blue"  sublabel="भागीदारी के लिए" />
        <StatsCard icon="🤝" value="0"              label="सक्रिय साझेदारी" color="gold"  sublabel="Co-mentoring" />
        <StatsCard icon="💰" value="0"              label="वित्तपोषित हैकाथॉन" color="green" sublabel="Co-funded" />
        <StatsCard icon="⭐" value="0"              label="पॉइंट्स"           color="cyan"  sublabel="अर्जित" />
      </div>

      {/* Available problems */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        🌐 सार्वजनिक समस्याएं — भागीदारी के अवसर
      </h2>

      {loading ? (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: '130px', borderRadius: '16px' }} className="skeleton" />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {problems.map(p => <ProblemCard key={p.id} problem={p} compact />)}
        </div>
      )}

      {/* Partnership placeholder */}
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
        <h3 style={{ marginBottom: '0.5rem' }}>साझेदारी पोर्टल — जल्द आ रहा है</h3>
        <p style={{ color: '#607080', fontSize: '0.875rem' }}>
          Phase 3 में: हैकाथॉन में रजिस्ट्रेशन, टीम सलाह, सह-वित्तपोषण प्रस्ताव
        </p>
      </div>
    </div>
  )
}
