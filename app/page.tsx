'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Stat {
  value: string
  label: string
  icon: string
}

const FEATURES = [
  { icon: '📥', title: 'समस्या दर्ज करें', titleEn: 'Collect', desc: 'नागरिक किसी भी भाषा में — टेक्स्ट, वॉइस, फोटो, वीडियो के ज़रिए स्थानीय समस्या दर्ज कर सकते हैं।', color: '#00D2FF' },
  { icon: '🤖', title: 'AI वर्गीकरण', titleEn: 'Classify & Route', desc: 'भाषिणी AI स्वत: अनुवाद, सारांश, वर्गीकरण, और सही विभाग तक रूटिंग करता है।', color: '#1E90FF' },
  { icon: '🌐', title: 'सार्वजनिक हब', titleEn: 'Publish', desc: 'सत्यापित समस्याएं राष्ट्रीय पब्लिक हब पर प्रकाशित होती हैं — सभी को दिखती हैं।', color: '#7C3AED' },
  { icon: '🏆', title: 'हैकाथॉन', titleEn: 'Orchestrate', desc: 'विश्वविद्यालय संरचित हैकाथॉन आयोजित करते हैं — छात्र टीमें समाधान बनाती हैं।', color: '#F5A623' },
  { icon: '🤝', title: 'उद्योग सहयोग', titleEn: 'Enforce Collaboration', desc: 'उद्योग अकेले नहीं बना सकते — उन्हें छात्र टीम के साथ मिलकर काम करना होगा।', color: '#00C48C' },
  { icon: '⭐', title: 'पुरस्कार प्रणाली', titleEn: 'Reward', desc: 'सरकार समर्थित पॉइंट्स और लीडरबोर्ड सिस्टम — हर भागीदार को इनसेंटिव मिलता है।', color: '#FF6B6B' },
]

const STAKEHOLDERS = [
  { icon: '👥', role: 'नागरिक', desc: 'समस्याएं दर्ज करें', color: '#00D2FF' },
  { icon: '🏛️', role: 'क्षेत्रीय अध्यक्ष', desc: 'सत्यापन करें', color: '#F5A623' },
  { icon: '🎓', role: 'विश्वविद्यालय', desc: 'हैकाथॉन चलाएं', color: '#00C48C' },
  { icon: '🏭', role: 'उद्योग', desc: 'समाधान में भागीदार बनें', color: '#FF8C42' },
  { icon: '🏛️', role: 'सरकार', desc: 'निगरानी और पुरस्कार', color: '#1E90FF' },
]

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const startTime = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count.toLocaleString('hi-IN')}</span>
}

const STATS: (Stat & { numericValue: number })[] = [
  { value: '24', numericValue: 24, label: 'जिले', icon: '📍' },
  { value: '5', numericValue: 5,   label: 'भूमिकाएं', icon: '👤' },
  { value: '8', numericValue: 8,   label: 'डोमेन', icon: '🏷️' },
  { value: '2', numericValue: 2,   label: 'चरण (Summer/Winter)', icon: '🌐' },
]

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const h = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const parallax = -scrollY * 0.25

  return (
    <div>
      {/* ─── HERO ─── */}
      <section style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '4rem 1.5rem',
      }}>
        {/* Animated background blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '10%', left: '5%',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30,144,255,0.12) 0%, transparent 70%)',
            transform: `translateY(${parallax * 0.5}px)`,
            transition: 'transform 0.1s linear',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '5%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)',
            transform: `translateY(${-parallax * 0.3}px)`,
            transition: 'transform 0.1s linear',
          }} />
          <div style={{
            position: 'absolute', top: '40%', right: '20%',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,196,140,0.06) 0%, transparent 70%)',
          }} />
        </div>

        <div style={{ maxWidth: '900px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div className="animate-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(30,144,255,0.1)',
            border: '1px solid rgba(30,144,255,0.3)',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#1E90FF',
            marginBottom: '1.5rem',
            letterSpacing: '0.05em',
          }}>
            🏆 Smart India Hackathon 2026 · SIH-26043
          </div>

          {/* Main heading */}
          <h1 className="animate-fade-up" style={{
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            marginBottom: '0.75rem',
            letterSpacing: '-0.03em',
            animationDelay: '0.1s',
          }}>
            <span style={{ color: '#fff' }}>समाधान</span>
            <span className="text-gradient">-सेतु</span>
          </h1>

          {/* English subtitle */}
          <div className="animate-fade-up" style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            fontWeight: 300,
            color: '#B0BEC5',
            marginBottom: '1.5rem',
            letterSpacing: '0.02em',
            animationDelay: '0.2s',
          }}>
            SamadhanSetu
          </div>

          {/* Tagline */}
          <p className="animate-fade-up" style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#B0BEC5',
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
            animationDelay: '0.25s',
          }}>
            नागरिकों की समस्याओं को विश्वविद्यालयों और उद्योगों से जोड़ने का{' '}
            <span style={{ color: '#F5A623', fontWeight: 600 }}>AI-संचालित</span> डिजिटल मंच
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up" style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.875rem',
            justifyContent: 'center',
            animationDelay: '0.35s',
          }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              🚀 शुरू करें
            </Link>
            <Link href="/hub" className="btn btn-outline btn-lg">
              🌐 समस्या हब देखें
            </Link>
            <Link href="/login" className="btn btn-ghost btn-lg">
              लॉग इन करें
            </Link>
          </div>

          {/* Bhashini badge */}
          <div className="animate-fade-up" style={{
            marginTop: '2.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(245,166,35,0.08)',
            border: '1px solid rgba(245,166,35,0.2)',
            borderRadius: '999px',
            fontSize: '0.75rem',
            color: '#F5A623',
            fontWeight: 500,
            animationDelay: '0.45s',
          }}>
            🎤 भाषिणी AI · बहुभाषी समर्थन · Hindi · Santali · Odia · English
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section style={{
        background: 'rgba(26,43,60,0.5)',
        borderTop: '1px solid rgba(30,144,255,0.1)',
        borderBottom: '1px solid rgba(30,144,255,0.1)',
        padding: '2rem 1.5rem',
      }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center',
        }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{s.icon}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1E90FF', lineHeight: 1 }}>
                <AnimatedCounter end={s.numericValue} />
                {s.numericValue >= 100 && '+'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#B0BEC5', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge badge-verified" style={{ marginBottom: '1rem' }}>हमारा तरीका</div>
          <h2>यह कैसे काम करता है?</h2>
          <p style={{ color: '#B0BEC5', marginTop: '0.75rem', maxWidth: '540px', margin: '0.75rem auto 0' }}>
            6 सरल चरणों में — समस्या दर्ज करने से लेकर समाधान लागू करने तक
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
        }} className="stagger-children">
          {FEATURES.map((f, i) => (
            <div key={f.titleEn} className="card animate-fade-up" style={{ borderColor: `${f.color}22` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: `0 0 16px ${f.color}22`,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700,
                      color: f.color,
                      background: `${f.color}18`,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      border: `1px solid ${f.color}33`,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      {String(i + 1).padStart(2, '0')} · {f.titleEn}
                    </span>
                  </div>
                  <h4 style={{ marginBottom: '0.4rem', fontSize: '1rem' }}>{f.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#B0BEC5', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── STAKEHOLDERS ─── */}
      <section style={{
        background: 'rgba(26,43,60,0.3)',
        borderTop: '1px solid rgba(30,144,255,0.08)',
        padding: '4rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-public" style={{ marginBottom: '1rem' }}>भागीदार</div>
            <h2>इस मंच पर कौन है?</h2>
            <p style={{ color: '#B0BEC5', marginTop: '0.75rem' }}>
              हर भागीदार की एक स्पष्ट भूमिका है — और हर भागीदार को एक मजबूत कारण मिलता है
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
          }}>
            {STAKEHOLDERS.map(s => (
              <div key={s.role} style={{
                background: 'rgba(26,43,60,0.7)',
                border: `1px solid ${s.color}25`,
                borderRadius: '16px',
                padding: '1.5rem 1.75rem',
                textAlign: 'center',
                minWidth: '160px',
                flex: '1 1 160px',
                maxWidth: '200px',
                transition: 'all 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${s.color}55`
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${s.color}20`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${s.color}25`
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.625rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: s.color, marginBottom: '0.3rem' }}>{s.role}</div>
                <div style={{ fontSize: '0.78rem', color: '#607080' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI SECTION ─── */}
      <section className="section container">
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,144,255,0.08) 0%, rgba(124,58,237,0.08) 100%)',
          border: '1px solid rgba(30,144,255,0.2)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
        }}>
          <div>
            <div className="badge badge-assigned" style={{ marginBottom: '1rem' }}>AI संचालित</div>
            <h2 style={{ marginBottom: '1rem' }}>
              भाषिणी AI —<br />
              <span className="text-gradient">हर कदम पर</span>
            </h2>
            <p style={{ color: '#B0BEC5', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              भाषिणी के बिना, एक अनपढ़ नागरिक इस मंच का उपयोग नहीं कर सकता। AI हर चरण को
              कुशल और वास्तव में समावेशी बनाता है।
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(245,166,35,0.1)',
              border: '1px solid rgba(245,166,35,0.25)',
              borderRadius: '999px',
              fontSize: '0.8rem',
              color: '#F5A623',
              fontWeight: 600,
            }}>
              ⏳ Bhashini API integration in progress
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { icon: '🌐', title: 'बहुभाषी LLM', desc: 'हिंदी, संताली, ओडिया में वॉइस/टेक्स्ट इनपुट' },
              { icon: '🏷️', title: 'स्वत: वर्गीकरण', desc: 'शिक्षा/स्वास्थ्य/कृषि/जल में रूटिंग' },
              { icon: '🔍', title: 'डुप्लीकेशन रोधी', desc: 'समान समस्याओं को पहचाने और मर्ज करें' },
              { icon: '📊', title: 'ट्रेंड विश्लेषण', desc: 'जिला और क्षेत्र के अनुसार हीटमैप' },
            ].map(item => (
              <div key={item.title} style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
              }}>
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#607080' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FOOTER ─── */}
      <section style={{
        background: 'rgba(26,43,60,0.5)',
        borderTop: '1px solid rgba(30,144,255,0.1)',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.25rem', animation: 'float 3s ease-in-out infinite' }}>🌉</div>
          <h2 style={{ marginBottom: '1rem' }}>
            झारखंड की समस्याओं को{' '}
            <span className="text-gradient">भारत के नवाचार</span> में बदलें
          </h2>
          <p style={{ color: '#B0BEC5', marginBottom: '2rem', lineHeight: 1.7 }}>
            &ldquo;हम सिर्फ एक मंच नहीं बनाना चाहते। हम एक ऐसा आंदोलन बनाना चाहते हैं जहाँ
            हर नागरिक की आवाज़ एक हल बन जाए।&rdquo;
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              अभी जुड़ें →
            </Link>
            <Link href="/hub" className="btn btn-ghost btn-lg">
              समस्याएं देखें
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '1.5rem',
        textAlign: 'center',
        color: '#607080',
        fontSize: '0.8rem',
      }}>
        <div>Smart India Hackathon 2026 · Problem Statement <strong style={{ color: '#B0BEC5' }}>SIH-26043</strong></div>
        <div style={{ marginTop: '0.3rem' }}>Ministry of Education · Government of Jharkhand</div>
      </footer>
    </div>
  )
}
