'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface SessionUser {
  id: string
  name: string
  phone: string
  role: string
  orgName?: string | null
}

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  link?: string | null
}

const ROLE_HOME: Record<string, string> = {
  CITIZEN:       '/citizen/dashboard',
  REGIONAL_HEAD: '/regional',
  UNIVERSITY:    '/university/dashboard',
  INDUSTRY:      '/industry/dashboard',
  ADMIN:         '/admin/dashboard',
}

const ROLE_LABEL_HI: Record<string, string> = {
  CITIZEN:       'नागरिक',
  REGIONAL_HEAD: 'क्षेत्रीय अधिकारी',
  UNIVERSITY:    'विश्वविद्यालय',
  INDUSTRY:      'उद्योग',
  ADMIN:         'प्रशासक',
}

const NAV_LINKS = [
  { href: '/',            label: 'मुखपृष्ठ',    labelEn: 'Home' },
  { href: '/hub',         label: 'समस्या हब',   labelEn: 'Problem Hub' },
  { href: '/leaderboard', label: 'लीडरबोर्ड',  labelEn: 'Leaderboard' },
  { href: '/status',      label: 'स्थिति जांचें', labelEn: 'Track' },
]

export default function GovHeader() {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser]           = useState<SessionUser | null>(null)
  const [loading, setLoading]     = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [fontSize, setFontSize]           = useState(100)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { setUser(d.user ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [pathname])

  useEffect(() => {
    if (!user) return
    fetch('/api/notifications?limit=8')
      .then(r => r.json())
      .then(d => { setNotifications(d.notifications ?? []); setUnreadCount(d.unreadCount ?? 0) })
      .catch(() => {})
  }, [user, pathname])

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`
  }, [fontSize])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setUnreadCount(0)
    setNotifications(p => p.map(n => ({ ...n, read: true })))
  }

  return (
    <>
      {/* ── Accessibility Bar ──────────────────────────── */}
      <div className="gov-accessibility-bar">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ marginRight: 6 }}>Text Size:</span>
            <button className="font-size-btn" onClick={() => setFontSize(f => Math.max(80, f - 10))} aria-label="Decrease font size">A-</button>
            <button className="font-size-btn" onClick={() => setFontSize(100)} aria-label="Reset font size">A</button>
            <button className="font-size-btn" onClick={() => setFontSize(f => Math.min(130, f + 10))} aria-label="Increase font size">A+</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>Smart India Hackathon 2026 · Problem ID: SIH-26043</span>
            <a href="#main-content" className="skip-link">Skip to Main Content »</a>
          </div>
        </div>
      </div>

      {/* ── Government Header ──────────────────────────── */}
      <div className="gov-header">
        <div className="gov-header-top">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

              {/* Brand */}
              <div className="gov-header-brand">
                {/* Emblem */}
                <div className="gov-emblem" aria-hidden="true">🏛️</div>
                <div className="gov-title-block">
                  <div className="gov-title-hi">समाधान-सेतु</div>
                  <div className="gov-title-en">SamadhanSetu · Government of Jharkhand</div>
                  <div className="gov-subtitle">सार्वजनिक शिकायत एवं नवाचार पोर्टल · Public Grievance & Innovation Portal</div>
                </div>
              </div>

              {/* Right: Auth + Notif */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Notification Bell */}
                {user && (
                  <div ref={notifRef} style={{ position: 'relative' }}>
                    <button
                      id="notif-bell-btn"
                      onClick={() => setNotifOpen(!notifOpen)}
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '7px 10px',
                        cursor: 'pointer',
                        position: 'relative',
                        fontSize: '15px',
                        lineHeight: 1,
                      }}
                    >
                      🔔
                      {unreadCount > 0 && (
                        <span style={{
                          position: 'absolute', top: -5, right: -5,
                          background: '#E8821A', color: '#fff',
                          borderRadius: '50%', width: 17, height: 17,
                          fontSize: '0.6rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid var(--gov-navy-dark)',
                        }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                      )}
                    </button>

                    {notifOpen && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        width: 320, background: '#fff',
                        border: '1px solid var(--gov-border)',
                        borderRadius: '6px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        animation: 'slideDown 0.2s ease',
                        zIndex: 300, overflow: 'hidden',
                      }}>
                        <div style={{
                          padding: '10px 14px',
                          background: 'var(--gradient-gov-header)',
                          color: '#fff',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>सूचनाएं / Notifications</span>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#FFD54F', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                              सभी पढ़ें
                            </button>
                          )}
                        </div>
                        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                          {notifications.length === 0 ? (
                            <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              कोई सूचना नहीं / No notifications
                            </div>
                          ) : notifications.map(n => (
                            <div key={n.id} style={{
                              padding: '10px 14px',
                              borderBottom: '1px solid #EEF2F6',
                              background: n.read ? '#fff' : '#EBF3FF',
                              cursor: n.link ? 'pointer' : 'default',
                            }}
                            onClick={() => { if (n.link) { router.push(n.link); setNotifOpen(false) } }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 2 }}>
                                {!n.read && <span style={{ color: 'var(--gov-amber)', marginRight: 5 }}>●</span>}
                                {n.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.message}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Auth */}
                {loading ? (
                  <div style={{ width: 100, height: 34, background: 'rgba(255,255,255,0.12)', borderRadius: 4 }} />
                ) : user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      padding: '5px 12px',
                    }}>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.65)', display: 'block', lineHeight: 1, fontFamily: 'var(--font-devanagari)' }}>
                        {ROLE_LABEL_HI[user.role] ?? user.role}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                        {user.name.split(' ')[0]}
                      </span>
                    </div>
                    <Link
                      href={ROLE_HOME[user.role] ?? '/'}
                      style={{
                        padding: '6px 14px',
                        background: 'var(--gov-amber)',
                        color: '#fff',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                    }}>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href="/login" style={{
                      padding: '7px 16px',
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}>लॉगिन / Login</Link>
                    <Link href="/register" style={{
                      padding: '7px 16px',
                      background: 'var(--gov-amber)',
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}>पंजीकरण / Register</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tricolor strip */}
        <div className="tricolor-strip" />

        {/* ── Navigation Bar ──────────────────── */}
        <nav className="gov-nav" aria-label="Main navigation">
          <div className="container">
            <div className="gov-nav-links">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`gov-nav-link${pathname === link.href ? ' active' : ''}`}
                >
                  <span style={{ fontFamily: 'var(--font-devanagari)' }}>{link.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', margin: '0 2px' }}>/</span>
                  <span style={{ fontSize: '0.78rem' }}>{link.labelEn}</span>
                </Link>
              ))}
              {user && (
                <Link
                  href={ROLE_HOME[user.role] ?? '/'}
                  className="gov-nav-link highlighted"
                >
                  मेरा डैशबोर्ड / My Dashboard
                </Link>
              )}
            </div>

            {/* Live timestamp */}
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <LiveTime />
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}

function LiveTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }))
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])
  return <>{time}</>
}
