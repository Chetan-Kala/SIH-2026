'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Problem {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  domain: string | null
  routedTo: string | null
  district: { nameHi: string }
}

const STATUS_MAP: Record<string, { label: string, step: number }> = {
  PENDING: { label: 'सत्यापन के लिए लंबित', step: 1 },
  VERIFIED: { label: 'सत्यापित', step: 2 },
  ROUTED: { label: 'विभाग को भेजा गया', step: 2 },
  IN_PROGRESS: { label: 'समाधान पर काम जारी', step: 3 },
  RESOLVED: { label: 'समाधान लागू किया गया', step: 4 },
  REJECTED: { label: 'अस्वीकृत', step: -1 },
}

export default function CitizenDashboard() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reRaising, setReRaising] = useState<string | null>(null)
  const router = useRouter()

  const fetchProblems = async () => {
    try {
      const res = await fetch('/api/problems/my')
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setProblems(data.problems || [])
    } catch (_err) {
      setError('समस्याओं को लोड करने में विफल')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchProblems()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleReRaise = async (id: string) => {
    if (!confirm('क्या आप सुनिश्चित हैं कि आप इस समस्या पर पुनर्विचार चाहते हैं? यह वापस क्षेत्रीय अध्यक्ष के पास जाएगी।')) return
    
    setReRaising(id)
    try {
      const res = await fetch(`/api/problems/${id}/reraise`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to re-raise')
      await fetchProblems() // Refresh list
    } catch (_err) {
      alert('कुछ गलत हुआ। कृपया पुनः प्रयास करें।')
    } finally {
      setReRaising(null)
    }
  }

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>लोड हो रहा है...</div>
  if (error) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--accent-red)' }}>{error}</div>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 400, color: 'var(--accent-ink)', marginBottom: '0.5rem' }}>मेरा डैशबोर्ड</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>आपके द्वारा दर्ज की गई सभी समस्याओं की स्थिति ट्रैक करें।</p>
        </div>
        <Link href="/citizen/submit" className="btn btn-primary">
          + नई समस्या दर्ज करें
        </Link>
      </div>

      {problems.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-ink)', marginBottom: '0.5rem' }}>कोई समस्या नहीं मिली</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>आपने अभी तक कोई समस्या दर्ज नहीं की है।</p>
          <Link href="/citizen/submit" className="btn btn-outline">
            अपनी पहली समस्या दर्ज करें
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {problems.map(p => {
            const statusInfo = STATUS_MAP[p.status] || { label: p.status, step: 0 }
            const currentStep = statusInfo.step
            const isRejected = currentStep === -1
            
            return (
              <div key={p.id} style={{ border: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-ink)', marginBottom: '0.5rem' }}>{p.title}</h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>📍 {p.district?.nameHi || '-'}</span>
                      <span>📅 {new Date(p.createdAt).toLocaleDateString('hi-IN')}</span>
                      <span>🏷️ {p.domain || 'वर्गीकरण लंबित'}</span>
                    </div>
                  </div>
                  {isRejected ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-red)', border: '1px solid var(--accent-red)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {statusInfo.label}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: currentStep === 4 ? 'var(--accent-sage)' : 'var(--text-secondary)', border: '1px solid var(--border)', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'var(--bg-primary)' }}>
                      {statusInfo.label}
                    </span>
                  )}
                </div>

                {/* Tracker */}
                {!isRejected && (
                  <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    
                    {/* Line behind steps */}
                    <div className="tracker-line" style={{ position: 'absolute', top: '50%', left: '3rem', right: '3rem', height: '1px', background: 'var(--border)', zIndex: 0 }} />
                    <div className="tracker-line" style={{ position: 'absolute', top: '50%', left: '3rem', width: `${((currentStep - 1) / 3) * 100}%`, height: '2px', background: 'var(--accent-ink)', zIndex: 0, transition: 'width 0.5s ease' }} />

                    {[
                      { num: 1, label: 'दर्ज किया गया' },
                      { num: 2, label: 'सत्यापित' },
                      { num: 3, label: 'काम जारी' },
                      { num: 4, label: 'समाधान' },
                    ].map(step => {
                      const isActive = currentStep >= step.num
                      return (
                        <div key={step.num} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0 0.5rem' }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 600,
                            background: isActive ? 'var(--accent-ink)' : 'var(--bg-primary)',
                            color: isActive ? '#fff' : 'var(--text-muted)',
                            border: `1px solid ${isActive ? 'var(--accent-ink)' : 'var(--border)'}`,
                            transition: 'all 0.3s ease'
                          }}>
                            {isActive ? '✓' : step.num}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: isActive ? 'var(--accent-ink)' : 'var(--text-muted)', fontWeight: isActive ? 500 : 400 }}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Re-Raise Action */}
                {currentStep === 4 && (
                  <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      क्या आप प्रदान किए गए समाधान से संतुष्ट नहीं हैं?
                    </p>
                    <button 
                      onClick={() => handleReRaise(p.id)} 
                      disabled={reRaising === p.id}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        background: 'transparent',
                        border: '1px solid var(--accent-terra)',
                        color: 'var(--accent-terra)',
                        cursor: reRaising === p.id ? 'not-allowed' : 'pointer',
                        fontWeight: 500
                      }}
                    >
                      {reRaising === p.id ? 'भेजा जा रहा है...' : 'पुनर्विचार हेतु भेजें'}
                    </button>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
