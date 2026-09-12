'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PointRule {
  id: string
  action: string
  actionLabel: string
  points: number
  description: string
  enabled: boolean
  icon: string
  category: 'citizen' | 'student' | 'university' | 'industry' | 'admin'
}

const DEFAULT_RULES: PointRule[] = [
  // Citizen
  { id: 'problem_submitted',     action: 'problem_submitted',     actionLabel: 'समस्या दर्ज की',          points: 10,  description: 'जब कोई नागरिक एक समस्या दर्ज करता है',                         enabled: true,  icon: '📝', category: 'citizen' },
  { id: 'problem_verified',      action: 'problem_verified',      actionLabel: 'समस्या सत्यापित हुई',      points: 5,   description: 'जब नागरिक की समस्या Regional Head द्वारा सत्यापित होती है',   enabled: true,  icon: '✅', category: 'citizen' },
  { id: 'problem_resolved',      action: 'problem_resolved',      actionLabel: 'समस्या हल हुई',            points: 25,  description: 'जब नागरिक की समस्या का समाधान लागू होता है',                   enabled: true,  icon: '🏆', category: 'citizen' },
  { id: 'citizen_solution_given',action: 'citizen_solution_given',actionLabel: 'नागरिक ने समाधान दिया',   points: 10,  description: 'जब कोई नागरिक स्वतंत्र समाधान submit करता है',                  enabled: true,  icon: '💡', category: 'citizen' },
  // Student/Team
  { id: 'solution_submitted',    action: 'solution_submitted',    actionLabel: 'समाधान submit किया',      points: 15,  description: 'जब टीम हैकाथॉन में समाधान submit करती है',                     enabled: true,  icon: '📤', category: 'student' },
  { id: 'solution_won',          action: 'solution_won',          actionLabel: 'हैकाथॉन जीता',             points: 50,  description: 'जब टीम हैकाथॉन की ग्रैंड फिनाले जीतती है',                  enabled: true,  icon: '🥇', category: 'student' },
  { id: 'solution_deployed',     action: 'solution_deployed',     actionLabel: 'समाधान deploy हुआ',        points: 30,  description: 'जब जीती हुई टीम का समाधान पायलट में deploy होता है',           enabled: true,  icon: '🚀', category: 'student' },
  { id: 'shortlisted',           action: 'shortlisted',           actionLabel: 'shortlist में',            points: 10,  description: 'जब टीम quarterfinals के लिए shortlist होती है',                enabled: true,  icon: '📋', category: 'student' },
  // University
  { id: 'hackathon_organized',   action: 'hackathon_organized',   actionLabel: 'हैकाथॉन आयोजित',          points: 100, description: 'जब विश्वविद्यालय एक हैकाथॉन सफलतापूर्वक आयोजित करता है',     enabled: true,  icon: '🎓', category: 'university' },
  { id: 'problem_assigned',      action: 'problem_assigned',      actionLabel: 'समस्या स्वीकार की',        points: 20,  description: 'जब विश्वविद्यालय एक समस्या हैकाथॉन में शामिल करता है',       enabled: true,  icon: '🎯', category: 'university' },
  // Industry
  { id: 'co_mentored',           action: 'co_mentored',           actionLabel: 'सह-मार्गदर्शन किया',       points: 50,  description: 'जब उद्योग हैकाथॉन विजेता टीम का सह-मार्गदर्शन करता है',   enabled: true,  icon: '🤝', category: 'industry' },
  { id: 'co_funded',             action: 'co_funded',             actionLabel: 'सह-वित्तपोषण किया',        points: 75,  description: 'जब उद्योग हैकाथॉन का सह-वित्तपोषण करता है',                 enabled: true,  icon: '💰', category: 'industry' },
  { id: 'prototype_deployed',    action: 'prototype_deployed',    actionLabel: 'prototype deploy',         points: 100, description: 'जब उद्योग + टीम का prototype जिले में deploy होता है',        enabled: true,  icon: '🏗️', category: 'industry' },
]

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  citizen:    { label: 'नागरिक', color: '#00D2FF' },
  student:    { label: 'छात्र/टीम', color: '#1E90FF' },
  university: { label: 'विश्वविद्यालय', color: '#00C48C' },
  industry:   { label: 'उद्योग', color: '#FF8C42' },
  admin:      { label: 'Admin', color: '#FF4757' },
}

export default function AdminPointsPage() {
  const router = useRouter()
  const [rules, setRules]       = useState<PointRule[]>(DEFAULT_RULES)
  const [saved, setSaved]       = useState(false)
  const [filter, setFilter]     = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPoints, setEditPoints] = useState<number>(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login?from=/admin/points'); return }
    try {
      const p = JSON.parse(atob(token.split('.')[1]))
      if (p.role !== 'ADMIN') { router.push('/'); return }
    } catch { router.push('/login') }

    // Load saved config from localStorage (placeholder — in prod: DB table)
    const saved = localStorage.getItem('sih_points_config')
    if (saved) {
      try { setRules(JSON.parse(saved)) } catch {}
    }
  }, [router])

  const updatePoints = (id: string, value: number) => {
    setRules(r => r.map(rule => rule.id === id ? { ...rule, points: value } : rule))
  }

  const toggleRule = (id: string) => {
    setRules(r => r.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
  }

  const handleSave = () => {
    // Save to localStorage (placeholder — TODO: save to DB via API)
    localStorage.setItem('sih_points_config', JSON.stringify(rules))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const filtered = filter === 'all' ? rules : rules.filter(r => r.category === filter)

  const totalEnabled = rules.filter(r => r.enabled).length

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/dashboard" style={{ fontSize: '0.8rem', color: '#607080', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
          ← Admin डैशबोर्ड
        </Link>
        <div className="badge badge-public" style={{ marginBottom: '0.75rem', background: 'rgba(0,196,140,0.15)', color: '#00C48C', borderColor: 'rgba(0,196,140,0.3)' }}>
          ⭐ पॉइंट्स कॉन्फ़िगरेशन
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          पुरस्कार नियम सेट करें
        </h1>
        <p style={{ color: '#607080', fontSize: '0.875rem' }}>
          प्रत्येक कार्य के लिए पॉइंट्स की संख्या निर्धारित करें। ये पॉइंट्स लीडरबोर्ड में उपयोग होंगे।
        </p>
      </div>

      {/* Summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.875rem', marginBottom: '1.5rem',
      }}>
        {Object.entries(CATEGORY_LABELS).map(([cat, cfg]) => {
          const catRules = rules.filter(r => r.category === cat && r.enabled)
          const total = catRules.reduce((s, r) => s + r.points, 0)
          return (
            <div key={cat} className="card" style={{ padding: '1rem', borderColor: `${cfg.color}22` }}>
              <div style={{ fontSize: '0.7rem', color: '#607080', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>{cfg.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: cfg.color }}>{total}</div>
              <div style={{ fontSize: '0.72rem', color: '#607080' }}>max पॉइंट्स</div>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[{ value: 'all', label: `सभी (${totalEnabled} सक्रिय)` }, ...Object.entries(CATEGORY_LABELS).map(([v, c]) => ({ value: v, label: c.label }))].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            style={{ fontSize: '0.8rem' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {filtered.map(rule => {
          const catCfg = CATEGORY_LABELS[rule.category]
          const isEditing = editingId === rule.id
          return (
            <div key={rule.id} className="card" style={{
              padding: '1.25rem',
              opacity: rule.enabled ? 1 : 0.5,
              borderColor: rule.enabled ? `${catCfg.color}22` : 'rgba(255,255,255,0.06)',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Icon + label */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: `${catCfg.color}18`, border: `1px solid ${catCfg.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {rule.icon}
                </div>

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rule.actionLabel}</span>
                    <span className="badge" style={{
                      fontSize: '0.65rem', padding: '0.15rem 0.5rem',
                      background: `${catCfg.color}18`, color: catCfg.color, border: `1px solid ${catCfg.color}22`,
                    }}>
                      {catCfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#607080' }}>{rule.description}</div>
                </div>

                {/* Points editor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={editPoints}
                        onChange={e => setEditPoints(parseInt(e.target.value) || 0)}
                        className="form-input"
                        style={{ width: '80px', padding: '0.4rem 0.6rem', textAlign: 'center' }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => { updatePoints(rule.id, editPoints); setEditingId(null) }}
                      >
                        ✓
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingId(null)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(rule.id); setEditPoints(rule.points) }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}
                      title="पॉइंट्स बदलें"
                    >
                      <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#F5A623' }}>{rule.points}</span>
                      <span style={{ fontSize: '0.7rem', color: '#607080' }}>pts ✏️</span>
                    </button>
                  )}

                  {/* Toggle */}
                  <button
                    onClick={() => toggleRule(rule.id)}
                    style={{
                      width: '44px', height: '24px',
                      borderRadius: '999px',
                      background: rule.enabled ? '#00C48C' : 'rgba(255,255,255,0.1)',
                      border: 'none', cursor: 'pointer',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                    title={rule.enabled ? 'अक्षम करें' : 'सक्षम करें'}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '3px',
                      left: rule.enabled ? '22px' : '3px',
                      width: '18px', height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Save button */}
      <div style={{ position: 'sticky', bottom: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button onClick={() => setRules(DEFAULT_RULES)} className="btn btn-ghost">
          🔄 डिफ़ॉल्ट रीसेट
        </button>
        <button
          id="save-points-config"
          onClick={handleSave}
          className={saved ? 'btn btn-ghost' : 'btn btn-primary'}
          style={{ minWidth: '160px', padding: '0.875rem' }}
        >
          {saved ? '✓ सहेजा गया!' : '💾 कॉन्फ़िगरेशन सहेजें'}
        </button>
      </div>

      {/* Note */}
      <div className="alert alert-info" style={{ marginTop: '1rem' }}>
        <span>ℹ️</span>
        <span style={{ fontSize: '0.8rem' }}>
          अभी कॉन्फ़िगरेशन browser में save होती है। Production में यह DB table में store होगी और API के ज़रिए Points Engine को feed करेगी।
        </span>
      </div>
    </div>
  )
}
