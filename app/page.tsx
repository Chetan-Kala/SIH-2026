'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Stat {
  value: string
  label: string
}

const FEATURES = [
  { title: 'समस्या दर्ज करें', titleEn: 'Collect', desc: 'नागरिक किसी भी भाषा में — टेक्स्ट, वॉइस, फोटो, वीडियो के ज़रिए स्थानीय समस्या दर्ज कर सकते हैं।' },
  { title: 'AI वर्गीकरण', titleEn: 'Classify & Route', desc: 'भाषिणी AI स्वत: अनुवाद, सारांश, वर्गीकरण, और सही विभाग तक रूटिंग करता है।' },
  { title: 'सार्वजनिक हब', titleEn: 'Publish', desc: 'सत्यापित समस्याएं राष्ट्रीय पब्लिक हब पर प्रकाशित होती हैं — सभी को दिखती हैं।' },
  { title: 'हैकाथॉन', titleEn: 'Orchestrate', desc: 'विश्वविद्यालय संरचित हैकाथॉन आयोजित करते हैं — छात्र टीमें समाधान बनाती हैं।' },
  { title: 'उद्योग सहयोग', titleEn: 'Enforce', desc: 'उद्योग अकेले नहीं बना सकते — उन्हें छात्र टीम के साथ मिलकर काम करना होगा।' },
  { title: 'पुरस्कार प्रणाली', titleEn: 'Reward', desc: 'सरकार समर्थित पॉइंट्स और लीडरबोर्ड सिस्टम — हर भागीदार को इनसेंटिव मिलता है।' },
]

const STAKEHOLDERS = [
  { role: 'नागरिक', desc: 'समस्याएं दर्ज करें', category: 'Citizen' },
  { role: 'क्षेत्रीय अध्यक्ष', desc: 'सत्यापन करें', category: 'Authority' },
  { role: 'विश्वविद्यालय', desc: 'हैकाथॉन चलाएं', category: 'Academia' },
  { role: 'उद्योग', desc: 'समाधान में भागीदार बनें', category: 'Corporate' },
  { role: 'सरकार', desc: 'निगरानी और पुरस्कार', category: 'State' },
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
  { value: '24', numericValue: 24, label: 'जिले' },
  { value: '5', numericValue: 5,   label: 'भूमिकाएं' },
  { value: '8', numericValue: 8,   label: 'डोमेन' },
  { value: '2', numericValue: 2,   label: 'चरण' },
]

export default function HomePage() {
  return (
    <div>
      {/* ─── HERO ─── */}
      <section style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '6rem 2rem',
        borderBottom: '1px solid var(--border)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
          
          <div style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1rem',
            display: 'inline-block',
            maxWidth: 'max-content'
          }}>
            Smart India Hackathon 2026 / SIH-26043
          </div>

          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: 'var(--accent-ink)',
            maxWidth: '900px'
          }}>
            समाधान-सेतु
          </h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '500px',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic'
            }}>
              नागरिकों की समस्याओं को विश्वविद्यालयों और उद्योगों से जोड़ने का AI-संचालित डिजिटल मंच।
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-primary btn-lg">
                शुरू करें
              </Link>
              <Link href="/hub" className="btn btn-outline btn-lg">
                समस्या हब
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '3rem 2rem',
              borderRight: i !== STATS.length - 1 ? '1px solid var(--border)' : 'none',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-ink)', lineHeight: 1, marginBottom: '0.5rem' }}>
                <AnimatedCounter end={s.numericValue} />
                {s.numericValue >= 100 && '+'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-sans)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-sage)', marginBottom: '1rem' }}>प्रक्रिया</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>यह कैसे काम करता है</h2>
            </div>
            <p style={{ maxWidth: '400px', color: 'var(--text-secondary)' }}>
              6 सरल चरणों में — समस्या दर्ज करने से लेकर समाधान लागू करने तक का सफर।
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '0',
            borderTop: '1px solid var(--border)',
            borderLeft: '1px solid var(--border)'
          }}>
            {FEATURES.map((f, i) => (
              <div key={f.titleEn} style={{
                padding: '3rem 2rem',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                transition: 'background 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-primary)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              >
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-sans)', color: 'var(--accent-terra)', letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>
                  {String(i + 1).padStart(2, '0')} — {f.titleEn}
                </div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--accent-ink)' }}>{f.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STAKEHOLDERS ─── */}
      <section style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem' }}>
          
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>पारिस्थितिकी तंत्र</div>
            <h2 style={{ marginBottom: '2rem' }}>इस मंच पर कौन है?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              हर भागीदार की एक स्पष्ट भूमिका है — और हर भागीदार को एक मजबूत कारण मिलता है।
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {STAKEHOLDERS.map(s => (
              <div key={s.role} style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{s.category}</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--accent-ink)', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>{s.role}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── AI SECTION ─── */}
      <section style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4rem' }}>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-sage)', marginBottom: '1rem' }}>प्रौद्योगिकी</div>
              <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                भाषिणी AI<br/>
                <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>हर कदम पर</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1.1rem' }}>
                भाषिणी के बिना, एक अनपढ़ नागरिक इस मंच का उपयोग नहीं कर सकता। AI हर चरण को
                कुशल और वास्तव में समावेशी बनाता है।
              </p>
            </div>

            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
              {[
                { title: 'बहुभाषी LLM', desc: 'हिंदी, संताली, ओडिया में वॉइस/टेक्स्ट इनपुट' },
                { title: 'स्वत: वर्गीकरण', desc: 'शिक्षा/स्वास्थ्य/कृषि/जल में रूटिंग' },
                { title: 'डुप्लीकेशन रोधी', desc: 'समान समस्याओं को पहचाने और मर्ज करें' },
                { title: 'ट्रेंड विश्लेषण', desc: 'जिला और क्षेत्र के अनुसार हीटमैप' },
              ].map((item, idx) => (
                <div key={item.title} style={{
                  padding: '1.5rem 0',
                  borderTop: idx === 0 ? '1px solid var(--border)' : '1px solid var(--border)',
                  borderBottom: idx === 3 ? '1px solid var(--border)' : 'none'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--accent-ink)', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>{item.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ─── CTA FOOTER ─── */}
      <section style={{ padding: '8rem 2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '1.5rem' }}>
            झारखंड की समस्याओं को<br/>
            <span style={{ fontStyle: 'italic' }}>भारत के नवाचार</span> में बदलें
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.7, fontSize: '1.1rem' }}>
            &ldquo;हम सिर्फ एक मंच नहीं बनाना चाहते। हम एक ऐसा आंदोलन बनाना चाहते हैं जहाँ
            हर नागरिक की आवाज़ एक हल बन जाए।&rdquo;
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              अभी जुड़ें
            </Link>
            <Link href="/hub" className="btn btn-outline btn-lg">
              समस्याएं देखें
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-sans)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }}>
        <div>Smart India Hackathon 2026 / SIH-26043</div>
        <div style={{ marginTop: '0.5rem' }}>Ministry of Education / Government of Jharkhand</div>
      </footer>
    </div>
  )
}
