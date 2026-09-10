import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get('phone')

  if (!phone) {
    return NextResponse.json({ error: 'phone query param required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { phone },
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
