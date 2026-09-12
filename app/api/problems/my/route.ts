import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      problems: {
        include: { district: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ problems: [] })
  }

  return NextResponse.json({ problems: user.problems })
}
