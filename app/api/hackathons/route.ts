import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// ─────────────────────────────────────────────────────────────
//  GET /api/hackathons  — List hackathons
//  POST /api/hackathons — University creates a hackathon
// ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const phase  = searchParams.get('phase')
  const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'))
  const limit  = Math.min(50, parseInt(searchParams.get('limit') || '20'))
  const skip   = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (phase)  where.phase  = phase

  const [hackathons, total] = await Promise.all([
    prisma.hackathon.findMany({
      where,
      include: {
        university: { select: { name: true, orgName: true } },
        problems:   { select: { id: true, title: true, domain: true } },
        _count: {
          select: {
            teamRegistrations: true,
            solutions: true,
            industryApplications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.hackathon.count({ where }),
  ])

  return NextResponse.json({ hackathons, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['UNIVERSITY', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Only universities can create hackathons' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const {
      title,
      description,
      problemIds,
      prizePool,
      registrationDeadline,
      startDate,
      endDate,
    } = body

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        title:               title.trim(),
        description:         description.trim(),
        universityId:        session.id,
        phase:               getCurrentPhase(),
        status:              'OPEN',
        prizePool:           prizePool ?? null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        startDate:           startDate ? new Date(startDate) : null,
        endDate:             endDate   ? new Date(endDate)   : null,
      },
    })

    // Link problems to hackathon if provided
    if (problemIds?.length) {
      await prisma.problem.updateMany({
        where: { id: { in: problemIds } },
        data: {
          hackathonId: hackathon.id,
          visibility:  'ASSIGNED',
          status:      'ROUTED',
        },
      })
    }

    // Award points
    await prisma.user.update({
      where: { id: session.id },
      data: { points: { increment: 50 } },
    })
    await prisma.pointsTransaction.create({
      data: { userId: session.id, delta: 50, reason: 'HACKATHON_CREATED', refId: hackathon.id },
    })

    return NextResponse.json({ success: true, hackathon }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/hackathons]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

function getCurrentPhase(): 'SUMMER' | 'WINTER' {
  const month = new Date().getMonth() + 1
  return month >= 4 && month <= 9 ? 'SUMMER' : 'WINTER'
}
