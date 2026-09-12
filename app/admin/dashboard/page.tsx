'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StatsCard from '@/components/StatsCard'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser]   = useState<{ name: string } | null>(null)
  const [stats, setStats] = useState({ problems: 0, users: 0, pending: 0 })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login?from=/admin/dashboard'); return }
    try {
      const p = JSON.parse(atob(token.split('.')[1]))
      if (p.role !== 'ADMIN') { router.push('/'); return }
      setUser(p)
    } catch { router.push('/login') }
  }, [router])

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch('/api/problems?limit=1').then(r => r.json()),
      fetch('/api/problems?visibility=PENDING_REVIEW&limit=1').then(r => r.json()),
    ]).then(([all, pending]) => {
      setStats({ problems: all.total || 0, users: 0, pending: pending.total || 0 })
    })
  }, [user])

  const ADMIN_MODULES = [
    { href: '/regional/dashboard',  icon: '📥', title: 'समस्या समीक्षा',     desc: 'समस्याएं सत्यापित करें और रूट करें',     color: '#F5A623', badge: stats.pending > 0 ? String(stats.pending) : null },
    { href: '/hub',                 icon: '🌐', title: 'पब्लिक हब',          desc: 'सार्वजनिक समस्याओं का हब',               color: '#1E90FF', badge: null },
    { href: '/admin/points',        icon: '⭐', title: 'पॉइंट्स कॉन्फ़िगरेशन', desc: 'पुरस्कार और लीडरबोर्ड नियम सेट करें',    color: '#00C48C', badge: null },
    { href: '/admin/dashboard',     icon: '👤', title: 'उपयोगकर्ता प्रबंधन',   desc: 'सभी उपयोगकर्ताओं को देखें और प्रबंधित करें', color: '#00D2FF', badge: null },
  ]

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="badge badge-rejected" style={{ marginBottom: '0.6rem' }}>Admin</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Admin पैनल 🛡️
        </h1>
        <p style={{ color: '#607080', fontSize: '0.875rem' }}>
          SamadhanSetu — SIH-26043 · प्लेटफ़ॉर्म प्रशासन
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatsCard icon="📊" value={stats.problems} label="कुल समस्याएं"    color="blue"  />
        <StatsCard icon="⏳" value={stats.pending}  label="समीक्षा में"      color="gold"  />
        <StatsCard icon="🎓" value="—"              label="विश्वविद्यालय"     color="green" sublabel="Phase 3" />
        <StatsCard icon="🏭" value="—"              label="उद्योग भागीदार"   color="cyan"  sublabel="Phase 3" />
      </div>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>मॉड्यूल</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {ADMIN_MODULES.map(m => (
          <Link key={m.href} href={m.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '1.5rem', borderColor: `${m.color}22`, position: 'relative', overflow: 'hidden' }}>
              {m.badge && (
                <div style={{
                  position: 'absolute', top: '0.875rem', right: '0.875rem',
                  background: '#FF4757', color: '#fff', borderRadius: '999px',
                  padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 800,
                }}>
                  {m.badge}
                </div>
              )}
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `${m.color}18`, border: `1px solid ${m.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', marginBottom: '0.875rem',
              }}>
                {m.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{m.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#607080' }}>{m.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
