'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

type Segment = 'INDUSTRY' | 'UNIVERSITY' | 'STUDENT' | 'DISTRICT'

interface LeaderRow {
  rank: number
  id: string
  name: string
  orgName?: string
  points?: number
  totalPoints?: number
  nameHi?: string
  userCount?: number
  _count?: { hackathons?: number; solutions?: number }
}

const SEGMENT_TABS: { key: Segment; label: string; icon: string }[] = [
  { key: 'INDUSTRY',   label: 'Industry',    icon: '🏭' },
  { key: 'UNIVERSITY', label: 'University',  icon: '🎓' },
  { key: 'STUDENT',    label: 'Students',    icon: '👩‍💻' },
  { key: 'DISTRICT',   label: 'Districts',   icon: '🗺️' },
]

const BADGE_COLOR = ['rank-1', 'rank-2', 'rank-3']

export default function LeaderboardPage() {
  const [segment, setSegment] = useState<Segment>('INDUSTRY')
  const [data, setData]       = useState<LeaderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?segment=${segment}&limit=25`)
      .then(r => r.json())
      .then(d => { setData(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [segment])

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingBottom: 80 }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0D1B2A, #1a2b1a)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '48px 0 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
            width: 500, height: 300,
            background: 'radial-gradient(ellipse, rgba(245,166,35,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div className="container" style={{ position: 'relative' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏆</div>
            <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: 10 }}>
              Live Leaderboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Government-backed innovation points driving collaborative excellence across Jharkhand.
            </p>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 32 }}>
          {/* Segment Tabs */}
          <div className="tabs" style={{ marginBottom: 32, display: 'inline-flex' }}>
            {SEGMENT_TABS.map(t => (
              <button
                key={t.key}
                className={`tab-btn ${segment === t.key ? 'active' : ''}`}
                onClick={() => setSegment(t.key)}
                id={`tab-${t.key.toLowerCase()}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Context blurb */}
          <div className="card" style={{ marginBottom: 24, padding: '14px 20px', background: 'var(--color-gold-dim)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gold)', margin: 0 }}>
              {segment === 'INDUSTRY' && '⭐ Higher rank = more priority for government contract recommendations'}
              {segment === 'UNIVERSITY' && '📈 Rank improves eligibility for budget grants and NIRF accreditation bonuses'}
              {segment === 'STUDENT' && '🎓 Top students get preference for government internships and scholarships'}
              {segment === 'DISTRICT' && '🗺️ District rank reflects total community engagement in problem-solving'}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-sm)' }} />
              ))}
            </div>
          )}

          {/* Leaderboard Table */}
          {!loading && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Top 3 podium */}
              {data.length >= 3 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 20,
                  padding: '32px 24px',
                  background: 'linear-gradient(180deg, rgba(245,166,35,0.06) 0%, transparent 100%)',
                  borderBottom: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                }}>
                  {/* 2nd */}
                  <PodiumCard row={data[1]} rank={2} />
                  {/* 1st */}
                  <PodiumCard row={data[0]} rank={1} />
                  {/* 3rd */}
                  <PodiumCard row={data[2]} rank={3} />
                </div>
              )}

              {/* Rest of table */}
              <table className="table-dark">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Rank</th>
                    <th>{segment === 'DISTRICT' ? 'District' : 'Name'}</th>
                    <th>{segment === 'DISTRICT' ? 'Users' : segment === 'UNIVERSITY' ? 'Hackathons' : 'Org'}</th>
                    <th style={{ textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(3).map(row => (
                    <tr key={row.id}>
                      <td>
                        <div className={`rank-badge rank-n`} style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                          {row.rank}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {segment === 'DISTRICT' ? row.nameHi || row.name : row.orgName || row.name}
                        </div>
                        {segment === 'DISTRICT' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.name}</div>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {segment === 'DISTRICT' && `${row.userCount ?? 0} users`}
                        {segment === 'UNIVERSITY' && `${row._count?.hackathons ?? 0} hackathons`}
                        {segment === 'INDUSTRY' && (row.orgName || '—')}
                        {segment === 'STUDENT' && `${row._count?.solutions ?? 0} solutions`}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 700,
                          color: 'var(--color-gold)',
                          fontSize: '1rem',
                        }}>
                          {(segment === 'DISTRICT' ? row.totalPoints : row.points)?.toLocaleString('en-IN') ?? 0}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 4 }}>pts</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No data yet — be the first to earn points!
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function PodiumCard({ row, rank }: { row: LeaderRow; rank: number }) {
  const isFirst = rank === 1
  const pts = (row.totalPoints ?? row.points ?? 0)
  return (
    <div style={{
      textAlign: 'center',
      padding: isFirst ? '24px 20px' : '16px 20px',
      transform: isFirst ? 'translateY(-12px)' : 'none',
      minWidth: 140,
    }}>
      <div className={`rank-badge ${BADGE_COLOR[rank - 1]}`} style={{
        margin: '0 auto 12px',
        width: isFirst ? 48 : 38,
        height: isFirst ? 48 : 38,
        fontSize: isFirst ? '1.1rem' : '0.9rem',
      }}>
        {rank === 1 ? '👑' : rank}
      </div>
      <div style={{ fontWeight: 700, fontSize: isFirst ? '1rem' : '0.85rem', color: 'var(--text-primary)', marginBottom: 4 }}>
        {row.orgName || row.nameHi || row.name}
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-gold)', fontSize: isFirst ? '1.4rem' : '1.1rem' }}>
        {pts.toLocaleString('en-IN')}
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 3 }}>pts</span>
      </div>
    </div>
  )
}
