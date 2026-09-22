import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { runAIPipeline } from '@/lib/ai-pipeline'
import { awardPoints, sendNotification } from '@/lib/notifications'

// ─────────────────────────────────────────────────────────────
//  POST /api/problems  — Citizen submits a new problem
// ─────────────────────────────────────────────────────────────
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
    const { title, description, districtId, sourceLang, mediaUrls } = body

    if (!title?.trim() || !description?.trim() || !districtId) {
      return NextResponse.json(
        { error: 'Title, description and district are required' },
        { status: 400 },
      )
    }

    // 1. Save raw problem immediately (always succeeds)
    const problem = await prisma.problem.create({
      data: {
        title:       title.trim(),
        description: description.trim(),
        sourceLang:  sourceLang || 'en',
        submitterId: session.id,
        districtId,
        status:     'PENDING',
        visibility: 'PENDING_REVIEW',
        phase:       getCurrentPhase(),
        mediaUrls:   mediaUrls ?? [],
      },
    })

    // 2. Run AI pipeline (non-blocking update)
    runAIPipeline({
      problemId:   problem.id,
      title:       title.trim(),
      description: description.trim(),
      sourceLang:  sourceLang || 'en',
      districtId,
    }).then(async (result) => {
      await prisma.problem.update({
        where: { id: problem.id },
        data: {
          title:             result.titleEn,
          description:       result.descEn,
          titleHi:           result.titleHi  ?? null,
          descriptionHi:     result.descHi   ?? null,
          aiSummary:         result.aiSummary,
          aiClassifiedDomain: result.domain,
          domain:            result.domain,
          routedTo:          result.routedTo,
          urgencyScore:      result.urgencyScore,
          dedupGroupId:      result.dedupGroupId ?? null,
        },
      })
    }).catch(err => console.error('[AI Pipeline] Failed to update problem:', err))

    // 3. Award points for submission
    await awardPoints(session.id, 10, 'PROBLEM_SUBMITTED', problem.id)

    return NextResponse.json(
      { success: true, problem: { id: problem.id } },
      { status: 201 },
    )
  } catch (err) {
    console.error('[POST /api/problems]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────
//  GET /api/problems  — List problems with filters + pagination
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain     = searchParams.get('domain')
  const districtId = searchParams.get('districtId')
  const status     = searchParams.get('status')
  const visibility = searchParams.get('visibility')
  const phase      = searchParams.get('phase')
  const page       = Math.max(1, parseInt(searchParams.get('page')  || '1'))
  const limit      = Math.min(50, parseInt(searchParams.get('limit') || '20'))
  const skip       = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (domain)     where.domain     = domain
  if (districtId) where.districtId = districtId
  if (status)     where.status     = status
  if (visibility) where.visibility = visibility
  if (phase)      where.phase      = phase

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      include: {
        submitter: { select: { name: true } },
        district:  true,
        solutions: { select: { id: true, status: true } },
      },
      orderBy: [{ urgencyScore: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.problem.count({ where }),
  ])

  return NextResponse.json({ problems, total, page, limit, totalPages: Math.ceil(total / limit) })
}

// ── Helpers ──────────────────────────────────────────────────

/** Summer = Apr–Sep (months 4–9), Winter = Oct–Mar */
function getCurrentPhase(): 'SUMMER' | 'WINTER' {
  const month = new Date().getMonth() + 1
  return month >= 4 && month <= 9 ? 'SUMMER' : 'WINTER'
}
