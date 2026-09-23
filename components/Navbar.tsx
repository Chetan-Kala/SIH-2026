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
  type: string
  read: boolean
  link?: string | null
  createdAt: string
}

const ROLE_HOME: Record<string, string> = {
  CITIZEN:       '/citizen/dashboard',
  REGIONAL_HEAD: '/regional',
  UNIVERSITY:    '/university/dashboard',
  INDUSTRY:      '/industry/dashboard',
  ADMIN:         '/admin/dashboard',
}

const ROLE_LABEL: Record<string, string> = {
  CITIZEN:       'नागरिक',
  REGIONAL_HEAD: 'क्षेत्रीय अध्यक्ष',
  UNIVERSITY:    'विश्वविद्यालय',
  INDUSTRY:      'उद्योग',
  ADMIN:         'Admin',
}

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser]           = useState<SessionUser | null>(null)
  const [loading, setLoading]     = useState(true)

  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  // Fetch session
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { setUser(d.user); setLoading(false) })
      .catch(() => setLoading(false))
  }, [pathname])

  // Fetch notifications when logged in
  useEffect(() => {
    if (!user) return
    fetch('/api/notifications?limit=10')
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications ?? [])
        setUnreadCount(d.unreadCount ?? 0)
      })
      .catch(() => {})
  }, [user, pathname])

  // Close notif dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('sih_token')
    setUser(null)
    router.push('/login')
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleNotifClick = (notif: Notification) => {
    setNotifOpen(false)
    if (notif.link) router.push(notif.link)
  }

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(13, 27, 42, 0.92)',
        borderBottom: '1px solid rgba(30,144,255,0.12)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1E90FF, #0d7ae6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 0 16px rgba(30,144,255,0.4)',
              flexShrink: 0,
            }}>🌉</div>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.05rem',
                color: '#fff',
                lineHeight: 1,
              }}>SamadhanSetu</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                समाधान-सेतु • SIH 2026
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="nav-links">
            <NavLink href="/hub" active={pathname === '/hub'}>🌐 Hub</NavLink>
            <NavLink href="/leaderboard" active={pathname === '/leaderboard'}>🏆 Leaderboard</NavLink>
            {user && (
              <NavLink href={ROLE_HOME[user.role] ?? '/'} active={pathname.startsWith('/citizen') || pathname.startsWith('/regional') || pathname.startsWith('/university') || pathname.startsWith('/industry') || pathname.startsWith('/admin')}>
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Notification bell */}
            {user && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  id="notif-bell-btn"
                  onClick={() => setNotifOpen(!notifOpen)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    position: 'relative',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    fontSize: '16px',
                    lineHeight: 1,
                  }}
                  aria-label="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      background: 'var(--color-red)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--color-navy)',
                    }}>{Math.min(unreadCount, 9)}{unreadCount > 9 && '+'}</span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notifOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 340,
                    background: 'var(--color-navy-light)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    animation: 'slideDown 0.2s ease',
                    overflow: 'hidden',
                    zIndex: 200,
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-blue)',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}>Mark all read</button>
                      )}
                    </div>

                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          No notifications yet
                        </div>
                      ) : notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(30,144,255,0.06)',
                            cursor: n.link ? 'pointer' : 'default',
                            background: n.read ? 'transparent' : 'rgba(30,144,255,0.06)',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,144,255,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(30,144,255,0.06)')}
                        >
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                            {!n.read && <span style={{ color: 'var(--color-blue)', marginRight: 6 }}>●</span>}
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth section */}
            {loading ? (
              <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 8 }} />
            ) : user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  padding: '6px 12px',
                  background: 'var(--color-blue-dim)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', lineHeight: 1 }}>
                    {ROLE_LABEL[user.role]}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/login"  className="btn btn-ghost btn-sm">Login</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: none; }
        }
      `}</style>
    </>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        padding: '6px 12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: active ? 'var(--color-blue)' : 'var(--text-secondary)',
        background: active ? 'var(--color-blue-dim)' : 'transparent',
        transition: 'all 0.15s',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Link>
  )
}
