/**
 * ============================================================
 *  BHASHINI API INTEGRATION — lib/bhashini.ts
 * ============================================================
 *
 *  STATUS: PLACEHOLDER (stub mode)
 *  ─────────────────────────────────────────────────────────
 *  To activate the real Bhashini API:
 *  1. Get your credentials from https://bhashini.gov.in/ulca/user/register
 *  2. Add to your .env file:
 *       BHASHINI_API_KEY=<your-api-key>
 *       BHASHINI_USER_ID=<your-user-id>
 *  3. All functions below will automatically use the real API.
 *
 *  In stub mode, all functions return the input unchanged
 *  (passthrough), so the app works end-to-end without the key.
 * ============================================================
 */

const BHASHINI_API_KEY  = process.env.BHASHINI_API_KEY  || ''
const BHASHINI_USER_ID  = process.env.BHASHINI_USER_ID  || ''
const BHASHINI_PIPELINE = process.env.BHASHINI_PIPELINE_ID || ''

/** Supported language codes (Bhashini ISO 639 codes) */
export type BhashiniLang =
  | 'hi'   // Hindi
  | 'en'   // English
  | 'or'   // Odia
  | 'sat'  // Santali
  | 'bn'   // Bengali
  | 'te'   // Telugu
  | 'ta'   // Tamil
  | 'kn'   // Kannada
  | 'ml'   // Malayalam
  | 'gu'   // Gujarati
  | 'pa'   // Punjabi
  | 'mr'   // Marathi
  | 'ur'   // Urdu

export interface TranslationResult {
  translatedText: string
  detectedLang?: BhashiniLang
  isStub: boolean
}

export interface SpeechToTextResult {
  transcript: string
  confidence?: number
  isStub: boolean
}

export interface TextToSpeechResult {
  audioBase64: string
  isStub: boolean
}

/** Check whether the Bhashini API is configured */
export function isBhashiniConfigured(): boolean {
  return Boolean(BHASHINI_API_KEY && BHASHINI_USER_ID)
}

// ─────────────────────────────────────────────────
//  TRANSLATION  (Text → Text)
// ─────────────────────────────────────────────────

/**
 * Translate text from a source language to English.
 * TODO: BHASHINI — replace stub with real ULCA pipeline call.
 */
export async function translateToEnglish(
  text: string,
  sourceLang: BhashiniLang = 'hi',
): Promise<TranslationResult> {
  if (!isBhashiniConfigured()) {
    // TODO: BHASHINI — stub passthrough (no translation)
    return { translatedText: text, isStub: true }
  }

  // ── Real Bhashini ULCA Translation Call ──────────────────
  try {
    // Step 1: Get pipeline config
    const configRes = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ulcaApiKey': BHASHINI_API_KEY,
        'userID': BHASHINI_USER_ID,
      },
      body: JSON.stringify({
        pipelineTasks: [{ taskType: 'translation', config: { language: { sourceLanguage: sourceLang, targetLanguage: 'en' } } }],
        pipelineRequestConfig: { pipelineId: BHASHINI_PIPELINE },
      }),
    })
    const config = await configRes.json()
    const callbackUrl   = config.pipelineInferenceAPIEndPoint?.callbackUrl
    const inferenceKey  = config.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value
    const serviceId     = config.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId

    if (!callbackUrl || !inferenceKey || !serviceId) {
      console.error('[Bhashini] Pipeline config incomplete:', config)
      return { translatedText: text, isStub: true }
    }

    // Step 2: Call inference
    const inferRes = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: inferenceKey,
      },
      body: JSON.stringify({
        pipelineTasks: [{
          taskType: 'translation',
          config: {
            language: { sourceLanguage: sourceLang, targetLanguage: 'en' },
            serviceId,
          },
        }],
        inputData: { input: [{ source: text }] },
      }),
    })
    const result = await inferRes.json()
    const translated = result.pipelineResponse?.[0]?.output?.[0]?.target || text

    return { translatedText: translated, isStub: false }
  } catch (err) {
    console.error('[Bhashini] translateToEnglish error:', err)
    return { translatedText: text, isStub: true }
  }
}

export async function translateFromEnglish(
  text: string,
  targetLang: BhashiniLang = 'hi',
): Promise<TranslationResult> {
  if (!isBhashiniConfigured()) {
    return { translatedText: text, isStub: true }
  }

  try {
    const configRes = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ulcaApiKey': BHASHINI_API_KEY,
        'userID': BHASHINI_USER_ID,
      },
      body: JSON.stringify({
        pipelineTasks: [{ taskType: 'translation', config: { language: { sourceLanguage: 'en', targetLanguage: targetLang } } }],
        pipelineRequestConfig: { pipelineId: BHASHINI_PIPELINE },
      }),
    })
    const config = await configRes.json()
    const callbackUrl   = config.pipelineInferenceAPIEndPoint?.callbackUrl
    const inferenceKey  = config.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value
    const serviceId     = config.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId

    if (!callbackUrl || !inferenceKey || !serviceId) {
      console.error('[Bhashini] Pipeline config incomplete:', config)
      return { translatedText: text, isStub: true }
    }

    const inferRes = await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: inferenceKey },
      body: JSON.stringify({
        pipelineTasks: [{
          taskType: 'translation',
          config: { language: { sourceLanguage: 'en', targetLanguage: targetLang }, serviceId },
        }],
        inputData: { input: [{ source: text }] },
      }),
    })
    const result = await inferRes.json()
    const translated = result.pipelineResponse?.[0]?.output?.[0]?.target || text

    return { translatedText: translated, isStub: false }
  } catch (err) {
    console.error('[Bhashini] translateFromEnglish error:', err)
    return { translatedText: text, isStub: true }
  }
}

// ─────────────────────────────────────────────────
//  SPEECH TO TEXT  (Audio → Text)
// ─────────────────────────────────────────────────

export async function speechToText(
  audioBlob: Blob,
  lang: BhashiniLang = 'hi',
): Promise<SpeechToTextResult> {
  if (!isBhashiniConfigured()) {
    return { transcript: '', confidence: 0, isStub: true }
  }

  try {
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    const configRes = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ulcaApiKey': BHASHINI_API_KEY,
        'userID': BHASHINI_USER_ID,
      },
      body: JSON.stringify({
        pipelineTasks: [{ taskType: 'asr', config: { language: { sourceLanguage: lang } } }],
        pipelineRequestConfig: { pipelineId: BHASHINI_PIPELINE },
      }),
    })
    const config = await configRes.json()
    const callbackUrl   = config.pipelineInferenceAPIEndPoint?.callbackUrl
    const inferenceKey  = config.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value
    const serviceId     = config.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId

    if (!callbackUrl || !inferenceKey || !serviceId) {
      console.error('[Bhashini] Pipeline config incomplete (ASR):', config)
      return { transcript: '', confidence: 0, isStub: true }
    }

    const inferRes = await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: inferenceKey },
      body: JSON.stringify({
        pipelineTasks: [{
          taskType: 'asr',
          config: { language: { sourceLanguage: lang }, serviceId },
        }],
        inputData: { audio: [{ audioContent: base64Audio }] },
      }),
    })
    const result = await inferRes.json()
    const transcript = result.pipelineResponse?.[0]?.output?.[0]?.source || ''

    return { transcript, confidence: 1, isStub: false }
  } catch (err) {
    console.error('[Bhashini] ASR error:', err)
    return { transcript: '', confidence: 0, isStub: true }
  }
}

// ─────────────────────────────────────────────────
//  TEXT TO SPEECH  (Text → Audio)
// ─────────────────────────────────────────────────

export async function textToSpeech(
  text: string,
  lang: BhashiniLang = 'hi',
): Promise<TextToSpeechResult> {
  if (!isBhashiniConfigured()) {
    return { audioBase64: '', isStub: true }
  }

  try {
    const configRes = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ulcaApiKey': BHASHINI_API_KEY,
        'userID': BHASHINI_USER_ID,
      },
      body: JSON.stringify({
        pipelineTasks: [{ taskType: 'tts', config: { language: { sourceLanguage: lang } } }],
        pipelineRequestConfig: { pipelineId: BHASHINI_PIPELINE },
      }),
    })
    const config = await configRes.json()
    const callbackUrl   = config.pipelineInferenceAPIEndPoint?.callbackUrl
    const inferenceKey  = config.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value
    const serviceId     = config.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId

    if (!callbackUrl || !inferenceKey || !serviceId) {
      console.error('[Bhashini] Pipeline config incomplete (TTS):', config)
      return { audioBase64: '', isStub: true }
    }

    const inferRes = await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: inferenceKey },
      body: JSON.stringify({
        pipelineTasks: [{
          taskType: 'tts',
          config: { language: { sourceLanguage: lang }, serviceId },
        }],
        inputData: { input: [{ source: text }] },
      }),
    })
    const result = await inferRes.json()
    const audioBase64 = result.pipelineResponse?.[0]?.audio?.[0]?.audioContent || ''

    return { audioBase64, isStub: false }
  } catch (err) {
    console.error('[Bhashini] TTS error:', err)
    return { audioBase64: '', isStub: true }
  }
}
