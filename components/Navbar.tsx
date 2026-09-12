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
  CITIZEN: '/citizen/submit',
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
    // Load user from localStorage token
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
    const handleScroll = () => setScrolled(window.scrollY > 20)
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
    { href: '/', label: 'होम', labelEn: 'Home' },
    { href: '/hub', label: 'समस्या हब', labelEn: 'Problem Hub' },
    ...(user ? [{ href: ROLE_DASHBOARD[user.role] || '/', label: 'डैशबोर्ड', labelEn: 'Dashboard' }] : []),
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
      background: scrolled
        ? 'rgba(13, 27, 42, 0.92)'
        : 'rgba(13, 27, 42, 0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(30,144,255,0.2)' : 'rgba(30,144,255,0.08)'}`,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1E90FF, #00D2FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 0 16px rgba(30,144,255,0.4)',
          }}>
            🌉
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              समाधान-सेतु
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(176,190,197,0.8)', letterSpacing: '0.06em', fontWeight: 500 }}>
              SIH 2026 · SIH-26043
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center' }}
             className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '0.45rem 0.875rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: pathname === link.href ? '#1E90FF' : '#B0BEC5',
                background: pathname === link.href ? 'rgba(30,144,255,0.12)' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {user ? (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                id="navbar-profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.45rem 0.875rem 0.45rem 0.625rem',
                  background: 'rgba(30,144,255,0.1)',
                  border: '1px solid rgba(30,144,255,0.25)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#fff',
                  fontFamily: 'var(--font-inter), sans-serif',
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1E90FF, #00D2FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="profile-name">
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>{user.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#B0BEC5' }}>{ROLE_LABELS[user.role] || user.role}</div>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#B0BEC5', transition: 'transform 0.2s', display: 'inline-block', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '220px',
                  background: 'rgba(26,43,60,0.97)',
                  border: '1px solid rgba(30,144,255,0.2)',
                  borderRadius: '14px',
                  backdropFilter: 'blur(20px)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,144,255,0.05)',
                  animation: 'fade-up 0.15s ease both',
                }}>
                  {/* User info */}
                  <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#B0BEC5', marginBottom: '0.5rem' }}>{ROLE_LABELS[user.role]}</div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.2rem 0.6rem',
                      background: 'rgba(245,166,35,0.12)',
                      border: '1px solid rgba(245,166,35,0.25)',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      color: '#F5A623',
                      fontWeight: 600,
                    }}>
                      ⭐ {user.points || 0} अंक
                    </div>
                  </div>

                  {/* Links */}
                  <div style={{ padding: '0.5rem' }}>
                    <Link
                      href={ROLE_DASHBOARD[user.role] || '/'}
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 0.75rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: '#B0BEC5',
                        fontSize: '0.875rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      📊 डैशबोर्ड
                    </Link>
                    {user.role === 'CITIZEN' && (
                      <Link
                        href="/citizen/submit"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.625rem 0.75rem',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          color: '#B0BEC5',
                          fontSize: '0.875rem',
                          transition: 'all 0.15s',
                        }}
                      >
                        ✍️ समस्या दर्ज करें
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div style={{ padding: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      id="navbar-logout-btn"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 0.75rem',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#FF4757',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                      }}
                    >
                      🚪 लॉग आउट
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm" style={{ fontSize: '0.85rem' }}>
                लॉग इन
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm" style={{ fontSize: '0.85rem' }}>
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
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#fff',
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
          background: 'rgba(13,27,42,0.98)',
          borderTop: '1px solid rgba(30,144,255,0.1)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: pathname === link.href ? '#1E90FF' : '#B0BEC5',
                background: pathname === link.href ? 'rgba(30,144,255,0.1)' : 'transparent',
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn btn-ghost" style={{ marginTop: '0.5rem' }}>लॉग इन</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary">रजिस्टर</Link>
            </>
          )}
          {user && (
            <button onClick={handleLogout} className="btn btn-ghost" style={{ color: '#FF4757' }}>🚪 लॉग आउट</button>
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
