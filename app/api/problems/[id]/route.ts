import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendNotification, awardPoints } from '@/lib/notifications'

// ─────────────────────────────────────────────────────────────
//  GET /api/problems/[id]  — Full problem detail
// ─────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        submitter: { select: { id: true, name: true, phone: true } },
        district:  true,
        hackathon: { select: { id: true, title: true, status: true, university: { select: { name: true, orgName: true } } } },
        solutions: {
          include: { submitter: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        teamRegistrations: {
          include: { members: { include: { user: { select: { name: true } } } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    return NextResponse.json({ problem })
  } catch (err) {
    console.error('[GET /api/problems/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────
//  PATCH /api/problems/[id]  — Regional Head / Admin actions
//    - verify:  status=VERIFIED, visibility=VERIFIED
//    - route:   status=ROUTED, visibility=PUBLIC, routingPath=HUB|MINISTRY, routedTo=...
//    - reject:  status=REJECTED, rejectionReason=...
// ─────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!['REGIONAL_HEAD', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const {
      status,
      visibility,
      routingPath,
      routedTo,
      rejectionReason,
      hackathonId,
      domain,
    } = body

    // Fetch existing problem to get submitterId for notifications
    const existing = await prisma.problem.findUnique({
      where: { id },
      select: { id: true, title: true, submitterId: true, status: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Build update payload — only include provided fields
    const data: Record<string, unknown> = {}
    if (status)          data.status          = status
    if (visibility)      data.visibility      = visibility
    if (routingPath)     data.routingPath     = routingPath
    if (routedTo)        data.routedTo        = routedTo
    if (rejectionReason) data.rejectionReason = rejectionReason
    if (hackathonId)     data.hackathonId     = hackathonId
    if (domain)          data.domain          = domain

    const problem = await prisma.problem.update({ where: { id }, data })

    // ── Side effects: notifications + points ──────────────────
    if (status === 'VERIFIED') {
      await Promise.all([
        sendNotification({
          userId:  existing.submitterId,
          type:    'PROBLEM_VERIFIED',
          title:   'समस्या सत्यापित हुई',
          message: `आपकी समस्या "${existing.title}" सत्यापित कर दी गई है।`,
          link:    `/citizen/dashboard`,
        }),
        awardPoints(existing.submitterId, 20, 'PROBLEM_VERIFIED', id),
      ])
    }

    if (status === 'REJECTED') {
      await sendNotification({
        userId:  existing.submitterId,
        type:    'PROBLEM_REJECTED',
        title:   'समस्या अस्वीकृत हुई',
        message: `आपकी समस्या "${existing.title}" अस्वीकृत कर दी गई। कारण: ${rejectionReason || 'अनिर्दिष्ट'}`,
        link:    `/citizen/dashboard`,
      })
    }

    if (status === 'ROUTED' && routingPath === 'HUB') {
      await sendNotification({
        userId:  existing.submitterId,
        type:    'PROBLEM_ROUTED',
        title:   'समस्या हब पर भेजी गई',
        message: `आपकी समस्या सार्वजनिक हब पर प्रकाशित हो गई है।`,
        link:    `/hub`,
      })
    }

    return NextResponse.json({ success: true, problem })
  } catch (err) {
    console.error('[PATCH /api/problems/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
