import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendBulkNotifications, awardPoints } from '@/lib/notifications'

// ─────────────────────────────────────────────────────────────
//  GET /api/hackathons/[id]
//  PATCH /api/hackathons/[id]  — advance status or update details
// ─────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
      include: {
        university: { select: { name: true, orgName: true } },
        problems:   { include: { district: true } },
        solutions:  { include: { submitter: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
        teamRegistrations: {
          include: {
            members: { include: { user: { select: { name: true, phone: true } } } },
            problem: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        industryApplications: {
          include: { industry: { select: { name: true, orgName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    }

    return NextResponse.json({ hackathon })
  } catch (err) {
    console.error('[GET /api/hackathons/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

const STATUS_PROGRESSION = [
  'OPEN', 'SHORTLISTING', 'QUARTERFINAL', 'SEMIFINAL', 'FINALE', 'COMPLETED',
] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()

    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
      select: { id: true, title: true, status: true, universityId: true },
    })
    if (!hackathon) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only the owning university or admin can update
    if (session.role !== 'ADMIN' && hackathon.universityId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data: Record<string, unknown> = {}
    if (body.title)               data.title               = body.title
    if (body.description)         data.description         = body.description
    if (body.prizePool)           data.prizePool           = body.prizePool
    if (body.registrationDeadline) data.registrationDeadline = new Date(body.registrationDeadline)
    if (body.startDate)           data.startDate           = new Date(body.startDate)
    if (body.endDate)             data.endDate             = new Date(body.endDate)
    if (body.industryOrgName)     data.industryOrgName     = body.industryOrgName

    // Status advancement — must follow defined progression
    if (body.advanceStatus) {
      const currentIdx = STATUS_PROGRESSION.indexOf(hackathon.status as typeof STATUS_PROGRESSION[number])
      if (currentIdx < STATUS_PROGRESSION.length - 1) {
        data.status = STATUS_PROGRESSION[currentIdx + 1]
      }
    } else if (body.status) {
      data.status = body.status
    }

    const updated = await prisma.hackathon.update({ where: { id }, data })

    // Notify all registered team members about status change
    if (data.status) {
      const members = await prisma.teamMember.findMany({
        where: { teamRegistration: { hackathonId: id } },
        select: { userId: true },
      })
      const userIds = Array.from(new Set(members.map(m => m.userId)))

      await sendBulkNotifications(userIds, {
        type:    'HACKATHON_STATUS_CHANGED',
        title:   'हैकाथॉन अपडेट',
        message: `हैकाथॉन "${hackathon.title}" अब ${data.status} चरण में है।`,
        link:    `/university/dashboard`,
      })
    }

    // Mark winning solution and award points
    if (body.winnerId) {
      const solution = await prisma.solution.update({
        where: { id: body.winnerId },
        data: { status: 'WINNER' },
        include: { submitter: true },
      })
      await awardPoints(solution.submitterId, 100, 'SOLUTION_WON', solution.id)

      // Update problem to IN_PROGRESS
      if (solution.problemId) {
        await prisma.problem.update({
          where: { id: solution.problemId },
          data: { status: 'IN_PROGRESS', visibility: 'IN_PROGRESS' },
        })
      }
    }

    return NextResponse.json({ success: true, hackathon: updated })
  } catch (err) {
    console.error('[PATCH /api/hackathons/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
