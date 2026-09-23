'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ── Animated Counter ─────────────────────────────────────── */
function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref     = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const dur   = 1800
        const tick  = (now: number) => {
          const t = Math.min((now - start) / dur, 1)
          const e = 1 - Math.pow(1 - t, 3)
          setCount(Math.floor(e * end))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end])

  return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>
}

/* ── Data ─────────────────────────────────────────────────── */

const STATS = [
  {
    icon: '📋', color: 'blue',
    value: 4286, suffix: '',
    labelHi: 'कुल समस्याएं दर्ज', labelEn: 'Total Problems Received',
    href: '/hub',
  },
  {
    icon: '✅', color: 'green',
    value: 3142, suffix: '',
    labelHi: 'समस्याएं सत्यापित', labelEn: 'Problems Verified',
    href: '/hub',
  },
  {
    icon: '🏆', color: 'amber',
    value: 156, suffix: '',
    labelHi: 'हैकाथॉन समाधान', labelEn: 'Hackathon Solutions',
    href: '/leaderboard',
  },
  {
    icon: '🎓', color: 'teal',
    value: 48, suffix: '',
    labelHi: 'भागीदार विश्वविद्यालय', labelEn: 'Partner Universities',
    href: '/leaderboard',
  },
  {
    icon: '🏭', color: 'orange',
    value: 32, suffix: '',
    labelHi: 'उद्योग भागीदार', labelEn: 'Industry Partners',
    href: '/leaderboard',
  },
  {
    icon: '📍', color: 'red',
    value: 24, suffix: '',
    labelHi: 'जिले सक्रिय', labelEn: 'Districts Active',
    href: '/hub',
  },
]

const PORTAL_TABS = [
  {
    id: 'citizen',
    labelHi: 'नागरिक पोर्टल',
    labelEn: 'Citizen Portal',
    icon: '👤',
    content: {
      heading: 'नागरिक पोर्टल / Citizen Portal',
      desc: 'अपनी स्थानीय समस्याएं दर्ज करें — हिंदी, संताली, ओडिया, या किसी भी भाषा में। AI आपकी मदद करेगा।',
      links: [
        { href: '/citizen/submit', label: 'समस्या दर्ज करें / Submit Problem', primary: true },
        { href: '/citizen/dashboard', label: 'मेरी समस्याएं / My Problems', primary: false },
      ],
      note: 'पंजीकरण आवश्यक है · Registration required',
    },
  },
  {
    id: 'officer',
    labelHi: 'अधिकारी लॉगिन',
    labelEn: 'Officer Login',
    icon: '🏛️',
    content: {
      heading: 'अधिकारी / Officer Login',
      desc: 'क्षेत्रीय अध्यक्ष, मंत्रालय अधिकारी और प्रशासक — समस्याओं की समीक्षा और रूटिंग करें।',
      links: [
        { href: '/login?role=REGIONAL_HEAD', label: 'अधिकारी लॉगिन / Officer Login', primary: true },
        { href: '/regional', label: 'पोर्टल खोलें / Open Portal', primary: false },
      ],
      note: 'पोर्टल ID आवश्यक है · Portal ID required',
    },
  },
  {
    id: 'university',
    labelHi: 'विश्वविद्यालय',
    labelEn: 'University',
    icon: '🎓',
    content: {
      heading: 'विश्वविद्यालय पोर्टल / University Portal',
      desc: 'हैकाथॉन आयोजित करें, छात्र टीमें बनाएं, और वास्तविक समस्याओं का समाधान निकालें।',
      links: [
        { href: '/register?role=UNIVERSITY', label: 'पंजीकरण / Register', primary: true },
        { href: '/university/dashboard', label: 'डैशबोर्ड / Dashboard', primary: false },
      ],
      note: 'विश्वविद्यालय ईमेल आवश्यक · University email required',
    },
  },
  {
    id: 'industry',
    labelHi: 'उद्योग',
    labelEn: 'Industry',
    icon: '🏭',
    content: {
      heading: 'उद्योग पोर्टल / Industry Portal',
      desc: 'विजेता टीमों के साथ सहयोग करें — मेंटर या फंडर के रूप में — और सरकारी प्राथमिकता पाएं।',
      links: [
        { href: '/register?role=INDUSTRY', label: 'पंजीकरण / Register', primary: true },
        { href: '/industry/dashboard', label: 'हैकाथॉन देखें / Browse', primary: false },
      ],
      note: 'MSME / PSU / Private sector · सभी उद्योग',
    },
  },
  {
    id: 'track',
    labelHi: 'स्थिति जांचें',
    labelEn: 'Track Status',
    icon: '🔍',
    content: {
      heading: 'समस्या स्थिति / Track Problem',
      desc: 'अपनी समस्या का नंबर (Problem ID) दर्ज करें और वर्तमान स्थिति जानें।',
      links: [
        { href: '/status', label: 'स्थिति जांचें / Track Now', primary: true },
        { href: '/hub', label: 'सार्वजनिक हब / Public Hub', primary: false },
      ],
      note: 'पंजीकरण की आवश्यकता नहीं · No login needed',
    },
  },
]

const FEATURES = [
  { no: '01', icon: '📝', titleHi: 'समस्या दर्ज', titleEn: 'Collect', desc: 'नागरिक किसी भी भाषा में — टेक्स्ट, वॉइस, फोटो के ज़रिए समस्या दर्ज करते हैं।' },
  { no: '02', icon: '🤖', titleHi: 'AI वर्गीकरण', titleEn: 'AI Classify', desc: 'Bhashini AI स्वत: अनुवाद, वर्गीकरण, urgency scoring, और deduplication करता है।' },
  { no: '03', icon: '✅', titleHi: 'सत्यापन', titleEn: 'Verify & Route', desc: 'क्षेत्रीय अधिकारी समीक्षा करते हैं — मंत्रालय या सार्वजनिक हब पर रूट करते हैं।' },
  { no: '04', icon: '🌐', titleHi: 'सार्वजनिक हब', titleEn: 'Public Hub', desc: 'सत्यापित समस्याएं राष्ट्रीय हब पर — विश्वविद्यालय और उद्योग देख सकते हैं।' },
  { no: '05', icon: '⚡', titleHi: 'हैकाथॉन', titleEn: 'Hackathon', desc: 'विश्वविद्यालय हैकाथॉन चलाते हैं — QF → SF → Finale — छात्र समाधान बनाते हैं।' },
  { no: '06', icon: '🤝', titleHi: 'सहयोग', titleEn: 'Enforce Collab', desc: 'उद्योग अकेले नहीं बना सकते — छात्र टीम के साथ अनिवार्य सहयोग।' },
]

const MARQUEE_TEXT = [
  '📢 नागरिक अपनी समस्याएं अब हिंदी, संताली, और ओडिया में भी दर्ज कर सकते हैं',
  '🏆 SIH 2026 हैकाथॉन पंजीकरण शुरू हो गया है — आज ही जुड़ें',
  '📋 Problem ID: SIH-26043 | Government of Jharkhand | Ministry of Education',
  '⚡ Bhashini AI द्वारा संचालित — 13 भाषाओं में सहायता उपलब्ध',
].join('   ·   ')


export default function HomePage() {
  const [activeTab, setActiveTab] = useState('citizen')
  const currentTab = PORTAL_TABS.find(t => t.id === activeTab)!

  return (
    <div>
      {/* ── Marquee / Notice Strip ─────────────────────────── */}
      <div className="gov-marquee-strip">
        <div className="marquee-label">नोटिस</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="marquee-text">{MARQUEE_TEXT}</div>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #002060 0%, #003580 50%, #004EA0 100%)',
        padding: '40px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative Ashoka wheel */}
        <div style={{
          position: 'absolute', right: -80, top: -80,
          width: 400, height: 400, opacity: 0.04,
          fontSize: '400px', lineHeight: 1, pointerEvents: 'none',
          userSelect: 'none',
        }}>☸</div>

        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}>

            {/* Left: Description + Quick links */}
            <div>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                padding: '6px 14px',
                display: 'inline-block',
                fontSize: '0.75rem',
                color: '#FFD54F',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}>
                Smart India Hackathon 2026 · SIH-26043
              </div>

              <h1 style={{
                fontFamily: 'var(--font-devanagari)',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                color: '#FFFFFF',
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: 8,
              }}>
                समाधान-सेतु
              </h1>
              <div style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500,
                marginBottom: 16,
              }}>
                SamadhanSetu — Connecting Citizens, Universities &amp; Industry
              </div>

              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                maxWidth: 560,
                marginBottom: 24,
              }}>
                झारखंड की सामाजिक समस्याओं को AI-संचालित तकनीक से विश्वविद्यालयों और उद्योगों से जोड़ने का
                राष्ट्रीय मंच। नागरिक दर्ज करें, अधिकारी सत्यापित करें, छात्र हल करें।
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/citizen/submit" className="btn btn-amber btn-lg">
                  📝 समस्या दर्ज करें
                </Link>
                <Link href="/hub" className="btn btn-lg" style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                }}>
                  🌐 समस्या हब देखें
                </Link>
                <Link href="/status" className="btn btn-lg" style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.8)',
                }}>
                  🔍 स्थिति जांचें
                </Link>
              </div>

              {/* Quick nav hints */}
              <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { icon: '▸', text: 'आप अपनी समस्या किसी भी जिले से दर्ज कर सकते हैं' },
                  { icon: '▸', text: 'Bhashini के ज़रिए 13 भाषाओं में वॉइस सपोर्ट' },
                ].map(h => (
                  <div key={h.text} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span style={{ color: '#FFD54F', flexShrink: 0 }}>{h.icon}</span>
                    <span>{h.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Portal Tabs (like CM Window login panel) */}
            <div style={{
              width: 340,
              flexShrink: 0,
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
            className="hide-on-mobile"
            >
              {/* Tab bar */}
              <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {PORTAL_TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      padding: '10px 12px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: activeTab === t.id ? 'var(--gov-navy)' : 'var(--text-secondary)',
                      background: activeTab === t.id ? '#fff' : 'var(--gov-blue-tint)',
                      border: 'none',
                      borderBottom: activeTab === t.id ? '2px solid var(--gov-amber)' : '2px solid transparent',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-body)',
                      flex: '1 0 auto',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t.icon} {t.labelEn}
                  </button>
                ))}
              </div>

              {/* Panel header */}
              <div style={{
                background: 'var(--gradient-gov-header)',
                color: '#fff',
                padding: '10px 16px',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-devanagari)', fontSize: '0.95rem', fontWeight: 700 }}>
                  {currentTab.content.heading.split('/')[0]}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)' }}>
                  {currentTab.content.heading.split('/')[1]}
                </div>
              </div>

              {/* Panel content */}
              <div style={{ padding: 20 }}>
                <p style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: 16,
                  fontFamily: 'var(--font-devanagari)',
                }}>
                  {currentTab.content.desc}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentTab.content.links.map(l => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`btn btn-full ${l.primary ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                <div style={{
                  marginTop: 14,
                  padding: '8px 12px',
                  background: '#FFF8E1',
                  border: '1px solid #FFE082',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  color: '#795548',
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                }}>
                  <span>ℹ️</span>
                  <span>{currentTab.content.note}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Stats Strip (like CM Window counters) ─────── */}
      <div className="stats-strip">
        <div className="container">
          <div className="grid-3" style={{ gap: 12 }}>
            {STATS.map(s => (
              <Link key={s.labelEn} href={s.href} className="stat-card" style={{ textDecoration: 'none' }}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div>
                  <span className="stat-number">
                    <AnimatedCounter end={s.value} suffix={s.suffix} />
                  </span>
                  <span className="stat-label-hi">{s.labelHi}</span>
                  <span className="stat-label">{s.labelEn}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Process: How It Works ──────────────────────────── */}
      <section style={{ padding: '48px 0', background: '#fff', borderBottom: '1px solid var(--gov-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              display: 'inline-block',
              background: 'var(--gov-blue-tint)',
              border: '1px solid var(--gov-border)',
              borderRadius: '4px',
              padding: '3px 14px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--gov-navy)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}>
              प्रक्रिया / Process
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--gov-navy)',
              fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
              marginBottom: 8,
            }}>
              यह कैसे काम करता है? / How It Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', fontSize: '0.9rem' }}>
              6 सरल चरणों में — दर्ज करने से लेकर समाधान लागू होने तक
            </p>
          </div>

          <div className="grid-3" style={{ gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.no} style={{
                background: '#fff',
                border: '1px solid var(--gov-border)',
                borderRadius: '8px',
                padding: '20px',
                borderTop: `3px solid ${i < 2 ? 'var(--gov-navy)' : i < 4 ? 'var(--gov-amber)' : 'var(--gov-green)'}`,
                boxShadow: 'var(--shadow-card)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,53,128,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: i < 2 ? 'rgba(0,53,128,0.1)' : i < 4 ? 'rgba(232,130,26,0.1)' : 'rgba(19,136,8,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Step {f.no} · {f.titleEn}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--gov-navy)', fontFamily: 'var(--font-devanagari)', fontSize: '0.95rem' }}>
                      {f.titleHi}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontFamily: 'var(--font-devanagari)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stakeholders (Official India map style) ─────────── */}
      <section style={{ padding: '40px 0', background: 'var(--gov-blue-tint)', borderBottom: '1px solid var(--gov-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--gov-navy)', fontSize: '1.5rem', marginBottom: 6 }}>
              पारिस्थितिकी तंत्र / Stakeholder Ecosystem
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              हर भागीदार की स्पष्ट भूमिका — Every stakeholder has a defined role &amp; incentive
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {[
              { icon: '👤', role: 'नागरिक', en: 'Citizen', color: '#1565C0', bg: '#E3F2FD', action: 'समस्या दर्ज करें' },
              { icon: '🏛️', role: 'क्षेत्रीय अधिकारी', en: 'Regional Head', color: '#6A1B9A', bg: '#F3E5F5', action: 'सत्यापन करें' },
              { icon: '🎓', role: 'विश्वविद्यालय', en: 'University', color: '#00695C', bg: '#E0F2F1', action: 'हैकाथॉन चलाएं' },
              { icon: '🏭', role: 'उद्योग', en: 'Industry', color: '#E65100', bg: '#FFF3E0', action: 'सहयोग करें' },
              { icon: '🏦', role: 'सरकार', en: 'Government', color: '#1B5E20', bg: '#F1F8E9', action: 'निगरानी & पुरस्कार' },
            ].map(s => (
              <div key={s.en} style={{
                background: s.bg,
                border: `1.5px solid ${s.color}22`,
                borderRadius: '10px',
                padding: '20px 24px',
                textAlign: 'center',
                width: 160,
                boxShadow: 'var(--shadow-card)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-devanagari)', fontWeight: 700, color: s.color, fontSize: '0.9rem', marginBottom: 4 }}>
                  {s.role}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>{s.en}</div>
                <div style={{
                  background: s.color, color: '#fff',
                  borderRadius: '4px', padding: '3px 8px',
                  fontSize: '0.7rem', fontFamily: 'var(--font-devanagari)',
                  fontWeight: 600,
                }}>
                  {s.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Technology Section ───────────────────────────── */}
      <section style={{ padding: '40px 0', background: '#fff', borderBottom: '1px solid var(--gov-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-block',
                background: 'rgba(0,53,128,0.08)',
                border: '1px solid var(--gov-border)',
                borderRadius: '4px',
                padding: '3px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--gov-navy)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 14,
              }}>AI Technology · भाषिणी</div>

              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--gov-navy)', fontSize: '1.6rem', marginBottom: 14, lineHeight: 1.3 }}>
                भाषिणी AI — हर चरण में
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.7, fontFamily: 'var(--font-devanagari)' }}>
                भाषिणी के बिना, एक निरक्षर नागरिक इस मंच का उपयोग नहीं कर सकता। AI हर चरण को
                कुशल और समावेशी बनाता है — 13 भाषाओं में।
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['हिंदी', 'संताली', 'ओडिया', 'बंगाली', 'तेलुगु', 'English', '+8 more'].map(lang => (
                  <div key={lang} style={{
                    padding: '4px 12px',
                    background: 'var(--gov-blue-tint)',
                    border: '1px solid var(--gov-border)',
                    borderRadius: '100px',
                    fontSize: '0.78rem',
                    color: 'var(--gov-navy)',
                    fontFamily: 'var(--font-devanagari)',
                    fontWeight: 500,
                  }}>
                    {lang}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '🌐', title: 'बहुभाषी अनुवाद', en: 'Multilingual Translation', desc: 'Bhashini ULCA API — voice & text in any Indian language' },
                { icon: '🎯', title: 'स्वत: वर्गीकरण', en: 'Auto Classification', desc: '8 domains — Roads, Water, Health, Education, Electricity...' },
                { icon: '🔄', title: 'डुप्लीकेट रोकें', en: 'Deduplication', desc: 'TF-IDF cosine similarity — prevents redundant submissions' },
                { icon: '⚡', title: 'Urgency Scoring', en: 'Priority Ranking', desc: '0-100 score — CRITICAL issues surface immediately' },
              ].map(item => (
                <div key={item.title} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  background: 'var(--gov-light-bg)',
                  border: '1px solid var(--gov-border)',
                  borderRadius: '6px', padding: '12px 14px',
                }}>
                  <div style={{
                    width: 36, height: 36,
                    background: 'var(--gradient-gov-header)',
                    borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0, color: '#fff',
                  }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--gov-navy)', fontFamily: 'var(--font-devanagari)', marginBottom: 2 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section style={{
        background: 'var(--gradient-gov-header)',
        padding: '40px 0',
        textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-devanagari)', fontSize: '1.6rem', marginBottom: 8 }}>
            झारखंड की समस्याओं को नवाचार में बदलें
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 24, fontSize: '0.9rem' }}>
            Join thousands of citizens, universities, and industries building Jharkhand&apos;s future
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-amber btn-xl">
              पंजीकरण करें / Register Now
            </Link>
            <Link href="/hub" className="btn btn-xl" style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
            }}>
              समस्याएं देखें / View Problems
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hide-on-mobile { display: none !important; }
        }
        @media (max-width: 640px) {
          section { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>
    </div>
  )
}
