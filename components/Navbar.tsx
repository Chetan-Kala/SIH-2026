'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SessionUser {
  id: string
  name: string
  role: string
  orgName?: string | null
}

const ROLE_LABEL: Record<string, string> = {
  CITIZEN:       'नागरिक',
  REGIONAL_HEAD: 'क्षेत्रीय अधिकारी',
  UNIVERSITY:    'विश्वविद्यालय',
  INDUSTRY:      'उद्योग',
  ADMIN:         'Admin',
}

const ROLE_COLOR: Record<string, string> = {
  CITIZEN:       '#1a56db',
  REGIONAL_HEAD: '#7c3aed',
  UNIVERSITY:    '#0891b2',
  INDUSTRY:      '#d97706',
  ADMIN:         '#dc2626',
}

export default function Navbar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const [user, setUser]       = useState<SessionUser | null>(null)
  const [menuOpen, setMenu]   = useState(false)
  const [loggingOut, setOut]  = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setUser(d.user ?? null))
      .catch(() => setUser(null))
  }, [pathname])

  const logout = async () => {
    setOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/',          label: 'समस्या दर्ज करें', always: true },
    { href: '/status',    label: 'स्थिति देखें',      always: true },
    { href: '/hub',       label: 'समस्या हब',         always: true },
    { href: '/regional',  label: 'क्षेत्रीय पोर्टल',  roles: ['REGIONAL_HEAD', 'ADMIN'] },
    { href: '/dashboard', label: 'डैशबोर्ड',          roles: ['ADMIN'] },
  ]

  const visibleLinks = navLinks.filter(l =>
    l.always || (user && l.roles?.includes(user.role))
  )

  return (
    <nav style={{
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: 'var(--font-noto-devanagari), sans-serif',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>

        {/* Logo */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #1a56db, #7c3aed)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>🏛</div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '14px', lineHeight: 1 }}>
              SIH 2026
            </div>
            <div style={{ color: '#64748b', fontSize: '11px', lineHeight: 1.2 }}>
              झारखंड नवाचार पोर्टल
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {visibleLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                textDecoration: 'none',
                color: pathname === link.href ? '#f1f5f9' : '#94a3b8',
                backgroundColor: pathname === link.href ? '#1e293b' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenu(m => !m)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '8px', padding: '6px 12px',
                  cursor: 'pointer', color: '#f1f5f9', fontSize: '13px',
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: ROLE_COLOR[user.role] ?? '#1a56db',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700', color: '#fff',
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', lineHeight: 1 }}>
                    {user.name.split(' ')[0]}
                  </div>
                  <div style={{
                    fontSize: '10px', color: ROLE_COLOR[user.role] ?? '#94a3b8',
                    lineHeight: 1.2,
                  }}>
                    {ROLE_LABEL[user.role] ?? user.role}
                  </div>
                </div>
                <span style={{ color: '#64748b', fontSize: '10px' }}>▾</span>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '44px',
                  backgroundColor: '#1e293b', border: '1px solid #334155',
                  borderRadius: '8px', padding: '8px',
                  minWidth: '160px', zIndex: 200,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  <div style={{
                    padding: '8px 12px', borderBottom: '1px solid #334155',
                    marginBottom: '6px',
                  }}>
                    <div style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: '600' }}>
                      {user.name}
                    </div>
                    {user.orgName && (
                      <div style={{ color: '#64748b', fontSize: '11px' }}>{user.orgName}</div>
                    )}
                    <div style={{ color: '#64748b', fontSize: '11px' }}>
                      {ROLE_LABEL[user.role]}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    disabled={loggingOut}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '8px 12px', background: 'transparent',
                      border: 'none', color: '#f87171', fontSize: '13px',
                      cursor: 'pointer', borderRadius: '4px',
                      fontFamily: 'var(--font-noto-devanagari), sans-serif',
                    }}
                  >
                    {loggingOut ? 'लॉग आउट...' : '← लॉग आउट'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" style={{
              padding: '7px 16px',
              backgroundColor: '#1a56db',
              color: '#fff',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
            }}>
              लॉग इन
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
