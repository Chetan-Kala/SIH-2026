'use client'

import { useState, useEffect } from 'react'

export default function GovFooter() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null)

  useEffect(() => {
    // Simulate a visitor count from localStorage
    const key = 'sih_visitor_count'
    const stored = localStorage.getItem(key)
    const count = stored ? parseInt(stored) + 1 : 1
    localStorage.setItem(key, String(count))
    setVisitorCount(count)
  }, [])

  return (
    <footer className="gov-footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>

          {/* About */}
          <div>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 10, fontSize: '0.9rem', fontFamily: 'var(--font-devanagari)' }}>
              समाधान-सेतु के बारे में
            </div>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.65)' }}>
              A digital platform connecting citizens of Jharkhand with universities and industries
              to solve real-world societal problems through structured innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 10, fontSize: '0.9rem' }}>
              Quick Links
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { href: '/hub',         label: 'Public Problem Hub' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/status',      label: 'Track Problem Status' },
                { href: '/register',    label: 'Citizen Registration' },
                { href: '/login',       label: 'Officer / University Login' },
              ].map(l => (
                <li key={l.href}>
                  <a href={l.href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.8rem' }}>
                    › {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ministry Info */}
          <div>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 10, fontSize: '0.9rem' }}>
              Nodal Organisation
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.9 }}>
              <div>🏛️ <strong style={{ color: '#fff' }}>Government of Jharkhand</strong></div>
              <div>📋 Ministry of Education</div>
              <div>🎯 Problem ID: SIH-26043</div>
              <div>📅 Smart India Hackathon 2026</div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 10, fontSize: '0.9rem' }}>
              Help & Support
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', lineHeight: 2 }}>
              <div>📞 Toll Free: 1800-XXX-XXXX</div>
              <div>✉️ support@samadhan-setu.gov.in</div>
              <div>🕐 Mon–Fri: 9:00 AM – 6:00 PM</div>
            </div>
          </div>
        </div>

        <div className="gov-footer-bottom">
          <div>
            © 2026 SamadhanSetu — Government of Jharkhand &amp; Ministry of Education. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span>Last Updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            {visitorCount && (
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                Visitors: <strong style={{ color: 'var(--gov-amber-light)' }}>{visitorCount.toLocaleString('en-IN')}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
