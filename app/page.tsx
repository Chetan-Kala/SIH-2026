'use client'

import { useEffect, useState } from 'react'

interface District {
  id: string
  name: string
  nameHi: string
}

interface SubmitResult {
  success: boolean
  problem?: { id: string; domain?: string; routedTo?: string }
  error?: string
}

export default function Home() {
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)

  const [form, setForm] = useState({
    submitterName: '',
    submitterPhone: '',
    districtId: '',
    title: '',
    description: '',
  })

  useEffect(() => {
    fetch('/api/districts')
      .then(r => r.json())
      .then(data => {
        setDistricts(data.districts)
        setLoading(false)
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ success: true, problem: data.problem })
        setForm({ submitterName: '', submitterPhone: '', districtId: '', title: '', description: '' })
      } else {
        setResult({ success: false, error: data.error })
      }
    } catch {
      setResult({ success: false, error: 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ fontFamily: 'var(--font-noto-devanagari), sans-serif' }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '24px 16px',
      }}>
        {/* Header */}
        <div style={{
          borderBottom: '2px solid #1a56db',
          paddingBottom: '12px',
          marginBottom: '24px',
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a56db', margin: 0 }}>
            नागरिक समस्या पोर्टल
          </h1>
          <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 0' }}>
            झारखंड सरकार — अपनी समस्या यहाँ दर्ज करें
          </p>
        </div>

        {/* Success message */}
        {result?.success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #16a34a',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '20px',
          }}>
            <p style={{ color: '#15803d', fontWeight: '600', margin: '0 0 8px' }}>
              ✓ समस्या सफलतापूर्वक दर्ज हो गई
            </p>
            <p style={{ color: '#555', fontSize: '13px', margin: '0 0 4px' }}>
              आपकी समस्या ID: <strong style={{ fontFamily: 'monospace' }}>{result.problem?.id}</strong>
            </p>
            {result.problem?.domain && (
              <p style={{ color: '#555', fontSize: '13px', margin: '0 0 4px' }}>
                क्षेत्र: <strong>{result.problem.domain}</strong>
              </p>
            )}
            {result.problem?.routedTo && (
              <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>
                भेजा गया: <strong>{result.problem.routedTo}</strong>
              </p>
            )}
          </div>
        )}

        {/* Error message */}
        {result?.success === false && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #dc2626',
            borderRadius: '4px',
            padding: '12px 16px',
            marginBottom: '20px',
          }}>
            <p style={{ color: '#b91c1c', margin: 0, fontSize: '14px' }}>
              ✗ {result.error || 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।'}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>
              पूरा नाम <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="submitterName"
              value={form.submitterName}
              onChange={handleChange}
              placeholder="अपना पूरा नाम लिखें"
              required
              style={inputStyle}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>
              मोबाइल नंबर <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="tel"
              name="submitterPhone"
              value={form.submitterPhone}
              onChange={handleChange}
              placeholder="10 अंकों का मोबाइल नंबर"
              required
              pattern="[0-9]{10}"
              style={inputStyle}
            />
          </div>

          {/* District */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>
              जिला <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              name="districtId"
              value={form.districtId}
              onChange={handleChange}
              required
              disabled={loading}
              style={inputStyle}
            >
              <option value="">— जिला चुनें —</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.nameHi} ({d.name})
                </option>
              ))}
            </select>
          </div>

          {/* Problem title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>
              समस्या का शीर्षक <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="समस्या का संक्षिप्त विवरण"
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              पूरा विवरण <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="अपनी समस्या विस्तार से लिखें..."
              required
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: submitting ? '#93c5fd' : '#1a56db',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-noto-devanagari), sans-serif',
            }}
          >
            {submitting ? 'दर्ज हो रहा है...' : 'समस्या दर्ज करें'}
          </button>
        </form>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#222',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '15px',
  color: '#111',
  backgroundColor: '#fff',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-noto-devanagari), sans-serif',
  outline: 'none',
}
