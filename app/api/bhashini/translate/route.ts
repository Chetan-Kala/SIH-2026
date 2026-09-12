import { NextRequest, NextResponse } from 'next/server'
import { translateToEnglish, translateFromEnglish, isBhashiniConfigured, type BhashiniLang } from '@/lib/bhashini'

/**
 * POST /api/bhashini/translate
 * Body: { text: string, direction: 'toEnglish' | 'fromEnglish', lang: BhashiniLang }
 *
 * Server-side proxy to keep BHASHINI_API_KEY out of the browser bundle.
 */
export async function POST(req: NextRequest) {
  try {
    const { text, direction, lang } = await req.json() as {
      text: string
      direction: 'toEnglish' | 'fromEnglish'
      lang: BhashiniLang
    }

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const isConfigured = isBhashiniConfigured()

    let result
    if (direction === 'toEnglish') {
      result = await translateToEnglish(text, lang || 'hi')
    } else {
      result = await translateFromEnglish(text, lang || 'hi')
    }

    return NextResponse.json({
      ...result,
      bhashiniActive: isConfigured,
      // Useful for the frontend to show a "stub mode" warning
      stubMessage: result.isStub
        ? 'Bhashini API not configured. Set BHASHINI_API_KEY in .env to enable real translation.'
        : undefined,
    })
  } catch (err) {
    console.error('[/api/bhashini/translate] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
