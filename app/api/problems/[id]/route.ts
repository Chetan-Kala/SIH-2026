import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedRoles = ['REGIONAL_HEAD', 'ADMIN']
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { status, visibility, routedTo, hackathonId } = body

    const data: Record<string, unknown> = {}
    if (status)      data.status      = status
    if (visibility)  data.visibility  = visibility
    if (routedTo)    data.routedTo    = routedTo
    if (hackathonId) data.hackathonId = hackathonId

    const problem = await prisma.problem.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ success: true, problem })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
      include: { submitter: { select: { name: true, phone: true } }, district: true },
    })
    if (!problem) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ problem })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
