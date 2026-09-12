import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { classify } from '@/lib/classifier'
import { getSession } from '@/lib/auth'
import { translateToEnglish } from '@/lib/bhashini'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (session.role !== 'CITIZEN') {
      return NextResponse.json({ error: 'Only citizens can submit problems' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, districtId, sourceLang, urgencyScore } = body

    if (!title || !description || !districtId) {
      return NextResponse.json({ error: 'Title, description and district are required' }, { status: 400 })
    }

    // ── Bhashini Pipeline ──────────────────────────────────────
    // If the source language is not English, attempt translation.
    // Falls back to passthrough if Bhashini API is not yet configured.
    let titleEn   = title
    let descEn    = description
    let titleHi: string | undefined
    let descHi: string | undefined

    const lang = sourceLang || 'hi'

    if (lang !== 'en') {
      // TODO: BHASHINI — translate to English for classification
      const tTitle = await translateToEnglish(title, lang)
      const tDesc  = await translateToEnglish(description, lang)
      if (!tTitle.isStub) titleEn = tTitle.translatedText
      if (!tDesc.isStub)  descEn  = tDesc.translatedText
      // Store Hindi originals
      titleHi = lang === 'hi' ? title : undefined
      descHi  = lang === 'hi' ? description : undefined
    }

    // ── Classification (keyword-based, upgrades to ML when Bhashini is live) ──
    const { domain, routedTo } = classify(titleEn, descEn)

    // ── AI summary stub ────────────────────────────────────────
    // TODO: Replace with actual LLM summarisation call
    const aiSummary = description.length > 120
      ? description.slice(0, 115).trim() + '...'
      : description

    // ── Compute urgency score ──────────────────────────────────
    // Simple heuristic: user-reported + keyword boost
    // TODO: Replace with ML urgency model
    const URGENT_KEYWORDS = ['emergency', 'urgent', 'death', 'hospital', 'fire', 'accident', 'flood',
      'जरूरी', 'आपातकाल', 'अस्पताल', 'मौत', 'आग', 'बाढ़', 'दुर्घटना']
    const textLower = `${titleEn} ${descEn}`.toLowerCase()
    const keywordBoost = URGENT_KEYWORDS.reduce((acc, kw) => acc + (textLower.includes(kw) ? 20 : 0), 0)
    const computedUrgency = Math.min(100, (urgencyScore || 0) + keywordBoost)

    const problem = await prisma.problem.create({
      data: {
        title: titleEn,
        description: descEn,
        titleHi:       titleHi || null,
        descriptionHi: descHi || null,
        aiSummary,
        urgencyScore: computedUrgency,
        submitterId: session.id,
        districtId,
        status: 'PENDING',
        visibility: 'PENDING_REVIEW',
        domain,
        routedTo,
        sourceLang: lang,
        phase: getCurrentPhase(),
      },
    })

    // Award 10 points for submission
    // TODO: Make point values configurable via Admin Points Portal
    await prisma.user.update({
      where: { id: session.id },
      data: { points: { increment: 10 } },
    })

    return NextResponse.json({ success: true, problem: { id: problem.id, domain, routedTo, urgencyScore: computedUrgency } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/problems]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain    = searchParams.get('domain')
  const districtId= searchParams.get('districtId')
  const status    = searchParams.get('status')
  const visibility= searchParams.get('visibility')
  const page      = parseInt(searchParams.get('page') || '1')
  const limit     = parseInt(searchParams.get('limit') || '20')
  const skip      = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (domain)     where.domain     = domain
  if (districtId) where.districtId = districtId
  if (status)     where.status     = status
  if (visibility) where.visibility = visibility

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      include: { submitter: { select: { name: true } }, district: true },
      orderBy: [{ urgencyScore: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.problem.count({ where }),
  ])

  return NextResponse.json({ problems, total, page, limit })
}

/** Determine current phase based on calendar (Summer = Apr-Sep, Winter = Oct-Mar) */
function getCurrentPhase(): 'SUMMER' | 'WINTER' {
  const month = new Date().getMonth() + 1 // 1-12
  return month >= 4 && month <= 9 ? 'SUMMER' : 'WINTER'
}
