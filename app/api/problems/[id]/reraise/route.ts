import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const problemId = params.id
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    })

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    if (problem.submitterId !== session.id) {
      return NextResponse.json({ error: 'Forbidden: You can only re-raise your own problems' }, { status: 403 })
    }

    if (problem.status !== 'RESOLVED') {
      return NextResponse.json({ error: 'Only resolved problems can be re-raised' }, { status: 400 })
    }

    // Reset status to PENDING and visibility to PENDING_REVIEW
    // so it goes back to the Regional Head for verification
    const updated = await prisma.problem.update({
      where: { id: problemId },
      data: {
        status: 'PENDING',
        visibility: 'PENDING_REVIEW',
      },
    })

    return NextResponse.json({ success: true, problem: updated })
  } catch (error) {
    console.error('Error re-raising problem:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
