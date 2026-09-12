interface StatsCardProps {
  icon: string
  value: string | number
  label: string
  sublabel?: string
  color?: 'blue' | 'gold' | 'green' | 'cyan' | 'red'
  trend?: string
}

const COLOR_MAP = {
  blue:  { accent: '#1E90FF', bg: 'rgba(30,144,255,0.1)',  border: 'rgba(30,144,255,0.25)', glow: '0 0 20px rgba(30,144,255,0.2)' },
  gold:  { accent: '#F5A623', bg: 'rgba(245,166,35,0.1)',  border: 'rgba(245,166,35,0.25)', glow: '0 0 20px rgba(245,166,35,0.2)' },
  green: { accent: '#00C48C', bg: 'rgba(0,196,140,0.1)',   border: 'rgba(0,196,140,0.25)',  glow: '0 0 20px rgba(0,196,140,0.2)' },
  cyan:  { accent: '#00D2FF', bg: 'rgba(0,210,255,0.1)',   border: 'rgba(0,210,255,0.25)',  glow: '0 0 20px rgba(0,210,255,0.2)' },
  red:   { accent: '#FF4757', bg: 'rgba(255,71,87,0.1)',   border: 'rgba(255,71,87,0.25)',  glow: '0 0 20px rgba(255,71,87,0.2)'  },
}

export default function StatsCard({ icon, value, label, sublabel, color = 'blue', trend }: StatsCardProps) {
  const c = COLOR_MAP[color]
  return (
    <div className="card" style={{ border: `1px solid ${c.border}`, position: 'relative', overflow: 'hidden' }}>
      {/* Glow accent top-right */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: c.bg,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: c.accent, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '0.3rem' }}>
            {value}
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: sublabel ? '0.2rem' : 0 }}>
            {label}
          </div>
          {sublabel && <div style={{ fontSize: '0.75rem', color: '#607080' }}>{sublabel}</div>}
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
          background: c.bg,
          border: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
          boxShadow: c.glow,
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}
