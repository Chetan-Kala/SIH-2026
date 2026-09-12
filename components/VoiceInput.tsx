'use client'

import { useState, useRef } from 'react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  lang?: 'hi' | 'en' | 'or' | 'sat'
  disabled?: boolean
  className?: string
}

export default function VoiceInput({ onTranscript: _onTranscript, lang: _lang = 'hi', disabled = false }: VoiceInputProps) {
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const BHASHINI_ACTIVE = false // TODO: BHASHINI — set to `true` once API key is configured

  const startRecording = async () => {
    if (disabled || !BHASHINI_ACTIVE) {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        setProcessing(true)
        const _blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())
        try {
          // TODO: BHASHINI — send blob to /api/bhashini/translate for ASR
          // const formData = new FormData()
          // formData.append('audio', blob)
          // formData.append('lang', lang)
          // const res = await fetch('/api/bhashini/asr', { method: 'POST', body: formData })
          // const data = await res.json()
          // onTranscript(data.transcript)
          console.log('[VoiceInput] Bhashini ASR not yet active')
        } finally {
          setProcessing(false)
        }
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
    } catch (err) {
      console.error('[VoiceInput] Microphone error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const handleClick = () => {
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        id="voice-input-btn"
        type="button"
        onClick={handleClick}
        disabled={disabled || processing}
        title={BHASHINI_ACTIVE ? (recording ? 'रोकें' : 'बोलें') : 'Bhashini API key pending — voice input coming soon'}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: recording
            ? '2px solid #FF4757'
            : BHASHINI_ACTIVE
            ? '2px solid rgba(30,144,255,0.4)'
            : '2px solid rgba(176,190,197,0.25)',
          background: recording
            ? 'rgba(255,71,87,0.15)'
            : BHASHINI_ACTIVE
            ? 'rgba(30,144,255,0.1)'
            : 'rgba(176,190,197,0.06)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          transition: 'all 0.2s',
          flexShrink: 0,
          position: 'relative',
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {processing ? (
          <span style={{
            width: '16px', height: '16px',
            border: '2px solid rgba(255,255,255,0.2)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }} />
        ) : recording ? (
          <span style={{ animation: 'pulse-glow 1s ease-in-out infinite', fontSize: '12px' }}>⏹</span>
        ) : (
          '🎤'
        )}

        {/* Pulsing ring when recording */}
        {recording && (
          <span style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '50%',
            border: '2px solid rgba(255,71,87,0.4)',
            animation: 'pulse-glow 1.2s ease-in-out infinite',
          }} />
        )}
      </button>

      {/* Tooltip on click when Bhashini not yet active */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(13,27,42,0.97)',
          border: '1px solid rgba(245,166,35,0.3)',
          borderRadius: '10px',
          padding: '0.625rem 0.875rem',
          width: '220px',
          fontSize: '0.75rem',
          color: '#F5A623',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 10,
          lineHeight: 1.5,
          animation: 'fade-up 0.2s ease both',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>🎤 वॉइस इनपुट जल्द आ रहा है</div>
          <div style={{ color: '#B0BEC5' }}>Bhashini API key मिलने पर यह सुविधा सक्रिय होगी</div>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(245,166,35,0.3)',
          }} />
        </div>
      )}
    </div>
  )
}
