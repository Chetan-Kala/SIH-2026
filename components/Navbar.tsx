'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface UserInfo {
  id: string
  name: string
  role: string
  points: number
}

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: 'नागरिक',
  REGIONAL_HEAD: 'क्षेत्रीय अध्यक्ष',
  UNIVERSITY: 'विश्वविद्यालय',
  INDUSTRY: 'उद्योग',
  ADMIN: 'Admin',
}

const ROLE_DASHBOARD: Record<string, string> = {
  CITIZEN: '/citizen/dashboard',
  REGIONAL_HEAD: '/regional/dashboard',
  UNIVERSITY: '/university/dashboard',
  INDUSTRY: '/industry/dashboard',
  ADMIN: '/admin/dashboard',
}

export default function Navbar() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      }
    } catch {
      setUser(null)
    }
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setProfileOpen(false)
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: 'होम' },
    { href: '/hub', label: 'समस्या हब' },
    ...(user ? [{ href: ROLE_DASHBOARD[user.role] || '/', label: 'डैशबोर्ड' }] : []),
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'var(--bg-primary)',
      borderBottom: scrolled ? '1px solid var(--border-dark)' : '1px solid var(--border)',
      transition: 'var(--transition)',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 2rem',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 500,
            fontSize: '1.25rem',
            color: 'var(--accent-ink)',
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}>
            समाधान-सेतु
          </div>
          <div style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
            borderLeft: '1px solid var(--border)',
            paddingLeft: '0.75rem',
            lineHeight: 1.1
          }}>
            SIH 2026<br/>EDITION
          </div>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1, justifyContent: 'center' }}
             className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: pathname === link.href ? 600 : 400,
                color: pathname === link.href ? 'var(--accent-ink)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'var(--transition)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          {user ? (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                id="navbar-profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1rem 0.5rem 0.5rem',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '2px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  flexShrink: 0,
                  color: 'var(--accent-ink)'
                }}>
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="profile-name">
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.2 }}>{user.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{ROLE_LABELS[user.role] || user.role}</div>
                </div>
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: '0',
                  boxShadow: 'none',
                }}>
                  {/* User info */}
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', fontFamily: 'var(--font-sans)', color: 'var(--accent-ink)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ROLE_LABELS[user.role]}</div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.25rem 0.75rem',
                      background: 'transparent',
                      border: '1px solid var(--accent-sage)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-sage)',
                      fontWeight: 500,
                    }}>
                      {user.points || 0} अंक
                    </div>
                  </div>

                  {/* Links */}
                  <div style={{ padding: '0.5rem' }}>
                    <Link
                      href={ROLE_DASHBOARD[user.role] || '/'}
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.75rem 1rem',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        transition: 'background 0.2s',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      डैशबोर्ड
                    </Link>
                    {user.role === 'CITIZEN' && (
                      <Link
                        href="/citizen/submit"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'block',
                          padding: '0.75rem 1rem',
                          textDecoration: 'none',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          transition: 'background 0.2s',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        समस्या दर्ज करें
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)' }}>
                    <button
                      id="navbar-logout-btn"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'block',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-red)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        textAlign: 'left',
                      }}
                    >
                      लॉग आउट
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                लॉग इन
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                रजिस्टर
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            id="navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              width: '36px',
              height: '36px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: 'var(--accent-ink)',
            }}
            className="hamburger-btn"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: 'none',
                color: pathname === link.href ? 'var(--accent-ink)' : 'var(--text-secondary)',
                fontWeight: pathname === link.href ? 600 : 400,
                fontSize: '1rem',
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>लॉग इन</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ flex: 1 }}>रजिस्टर</Link>
            </div>
          )}
          {user && (
            <button onClick={handleLogout} className="btn btn-ghost" style={{ color: 'var(--accent-red)', marginTop: '1rem', textAlign: 'left', padding: '0' }}>लॉग आउट</button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 900px) {
          .profile-name { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
