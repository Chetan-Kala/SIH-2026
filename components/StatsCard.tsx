interface StatsCardProps {
  icon: string
  value: string | number
  label: string
  sublabel?: string
  color?: 'blue' | 'gold' | 'green' | 'cyan' | 'red'
  trend?: string
}

const COLOR_MAP = {
  blue:  { accent: 'var(--accent-ink)',   bg: 'var(--bg-secondary)', border: 'var(--border)' },
  gold:  { accent: 'var(--accent-terra)', bg: 'var(--bg-secondary)', border: 'var(--border)' },
  green: { accent: 'var(--accent-sage)',  bg: 'var(--bg-secondary)', border: 'var(--border)' },
  cyan:  { accent: 'var(--accent-ink)',   bg: 'var(--bg-secondary)', border: 'var(--border)' },
  red:   { accent: 'var(--accent-red)',   bg: 'var(--bg-secondary)', border: 'var(--border)' },
}

export default function StatsCard({ icon, value, label, sublabel, color = 'blue', trend }: StatsCardProps) {
  const c = COLOR_MAP[color]
  return (
    <div className="card" style={{ border: `1px solid ${c.border}`, position: 'relative', overflow: 'hidden', background: c.bg }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: c.accent, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '0.3rem' }}>
            {value}
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: sublabel ? '0.2rem' : 0, fontFamily: 'var(--font-sans)' }}>
            {label}
          </div>
          {sublabel && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sublabel}</div>}
          {trend && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: c.accent, fontWeight: 600 }}>
              {trend}
            </div>
          )}
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'var(--bg-tertiary)',
          border: `1px solid var(--border)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}
