import Link from 'next/link'

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

interface ProblemCardProps {
  problem: Problem
  showActions?: boolean
  onVerify?: (id: string) => void
  onReject?: (id: string) => void
  compact?: boolean
  href?: string
}

const DOMAIN_ICONS: Record<string, string> = {
  'Roads & Infrastructure': '🛣️',
  'Water Supply & Sanitation': '💧',
  'Electricity': '⚡',
  'Waste Management': '♻️',
  'Public Health': '🏥',
  'Law & Order': '🚔',
  'Education': '📚',
  'Transport': '🚌',
  'Agriculture': '🌾',
  'Environment': '🌳',
  'General': '📋',
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING:        { label: 'समीक्षा में',   cls: 'badge-pending' },
  PENDING_REVIEW: { label: 'समीक्षा में',   cls: 'badge-pending' },
  VERIFIED:       { label: 'सत्यापित',      cls: 'badge-verified' },
  PUBLIC:         { label: 'सार्वजनिक',     cls: 'badge-public' },
  ASSIGNED:       { label: 'आवंटित',        cls: 'badge-assigned' },
  IN_PROGRESS:    { label: 'प्रगति में',    cls: 'badge-progress' },
  RESOLVED:       { label: 'हल हुआ',        cls: 'badge-resolved' },
  REJECTED:       { label: 'अस्वीकृत',      cls: 'badge-rejected' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1)  return 'अभी'
  if (mins < 60) return `${mins} मिनट पहले`
  if (hrs < 24)  return `${hrs} घंटे पहले`
  return `${days} दिन पहले`
}

export default function ProblemCard({ problem, showActions, onVerify, onReject, compact, href }: ProblemCardProps) {
  const statusKey = problem.visibility || problem.status
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING
  const icon = DOMAIN_ICONS[problem.domain || 'General'] || '📋'
  const urgency = problem.urgencyScore ?? 0

  const cardContent = (
    <div className={`card${compact ? '' : ''}`} style={{
      position: 'relative',
      overflow: 'hidden',
      cursor: href ? 'pointer' : 'default',
    }}>
      {/* Urgency indicator bar */}
      {urgency > 60 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: urgency > 80
            ? 'linear-gradient(90deg, #FF4757, #FF6B7A)'
            : 'linear-gradient(90deg, #F5A623, #FFD700)',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
        {/* Domain icon */}
        <div style={{
          width: compact ? '36px' : '44px',
          height: compact ? '36px' : '44px',
          borderRadius: '10px',
          background: 'rgba(30,144,255,0.1)',
          border: '1px solid rgba(30,144,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: compact ? '16px' : '20px',
          flexShrink: 0,
        }}>
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <h3 style={{
              fontSize: compact ? '0.9rem' : '1rem',
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              lineHeight: 1.35,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {problem.title}
            </h3>
            <span className={`badge ${statusCfg.cls}`} style={{ flexShrink: 0 }}>
              {statusCfg.label}
            </span>
          </div>

          {/* AI Summary or description */}
          {!compact && (
            <p style={{
              fontSize: '0.85rem',
              color: '#B0BEC5',
              margin: '0 0 0.75rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.55,
            }}>
              {problem.aiSummary || problem.description}
            </p>
          )}

          {/* Metadata row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {problem.domain && (
              <span className="domain-tag">{problem.domain}</span>
            )}
            <span style={{ fontSize: '0.75rem', color: '#607080', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              📍 {problem.district.nameHi || problem.district.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#607080' }}>
              🕐 {timeAgo(problem.createdAt)}
            </span>
            {urgency > 60 && (
              <span style={{
                fontSize: '0.7rem',
                color: urgency > 80 ? '#FF4757' : '#F5A623',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}>
                🔥 {urgency > 80 ? 'अत्यंत जरूरी' : 'जरूरी'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons (Regional Head view) */}
      {showActions && (
        <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.preventDefault(); onVerify?.(problem.id) }}
            style={{ flex: 1 }}
          >
            ✓ सत्यापित करें
          </button>
          <button
            className="btn btn-sm"
            onClick={(e) => { e.preventDefault(); onReject?.(problem.id) }}
            style={{ flex: 1, background: 'rgba(255,71,87,0.1)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.25)' }}
          >
            ✗ अस्वीकार
          </button>
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{cardContent}</Link>
  }
  return cardContent
}
