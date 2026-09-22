import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendNotification, awardPoints } from '@/lib/notifications'

// ─────────────────────────────────────────────────────────────
//  POST /api/hackathons/[id]/apply  — Industry applies to mentor/fund
// ─────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'INDUSTRY') {
    return NextResponse.json({ error: 'Only industry partners can apply' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body   = await req.json()
    const { role, message } = body // role: MENTOR | FUNDER

    if (!['MENTOR', 'FUNDER'].includes(role)) {
      return NextResponse.json({ error: 'Role must be MENTOR or FUNDER' }, { status: 400 })
    }

    // Check hackathon exists and is open
    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
      select: { id: true, title: true, status: true, universityId: true },
    })
    if (!hackathon) return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    if (!['OPEN', 'SHORTLISTING'].includes(hackathon.status)) {
      return NextResponse.json({ error: 'Hackathon is no longer accepting applications' }, { status: 400 })
    }

    // Prevent duplicate applications
    const existing = await prisma.industryApplication.findFirst({
      where: { hackathonId: id, industryId: session.id },
    })
    if (existing) {
      return NextResponse.json({ error: 'You have already applied to this hackathon' }, { status: 409 })
    }

    const application = await prisma.industryApplication.create({
      data: {
        hackathonId: id,
        industryId:  session.id,
        role,
        message:     message ?? null,
        status:      'PENDING',
      },
    })

    // Notify the university
    await sendNotification({
      userId:  hackathon.universityId,
      type:    'INDUSTRY_APPLICATION',
      title:   'नई उद्योग आवेदन',
      message: `एक उद्योग ने हैकाथॉन "${hackathon.title}" के लिए ${role === 'MENTOR' ? 'मेंटर' : 'फंडर'} के रूप में आवेदन किया।`,
      link:    `/university/dashboard`,
    })

    return NextResponse.json({ success: true, application }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/hackathons/[id]/apply]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────
//  PATCH /api/hackathons/[id]/apply  — University approves/rejects
// ─────────────────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['UNIVERSITY', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id }                  = await params
    const { applicationId, status } = await req.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Status must be APPROVED or REJECTED' }, { status: 400 })
    }

    const application = await prisma.industryApplication.update({
      where: { id: applicationId },
      data:  { status },
      include: {
        industry: { select: { id: true, name: true } },
        hackathon: { select: { title: true, universityId: true } },
      },
    })

    // If approved, set industry org name on hackathon and award points
    if (status === 'APPROVED') {
      await prisma.hackathon.update({
        where: { id },
        data: { industryOrgName: application.industry.name },
      })

      const pointsReason = application.role === 'MENTOR' ? 'INDUSTRY_MENTORED' : 'INDUSTRY_FUNDED'
      await awardPoints(application.industryId, application.role === 'MENTOR' ? 75 : 60, pointsReason, id)

      await sendNotification({
        userId:  application.industryId,
        type:    'INDUSTRY_APPLICATION',
        title:   'आवेदन स्वीकृत!',
        message: `आपका ${application.role === 'MENTOR' ? 'मेंटर' : 'फंडर'} आवेदन "${application.hackathon.title}" के लिए स्वीकृत हो गया।`,
        link:    `/industry/dashboard`,
      })
    }

    return NextResponse.json({ success: true, application })
  } catch (err) {
    console.error('[PATCH /api/hackathons/[id]/apply]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
