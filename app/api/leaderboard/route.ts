import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// ─────────────────────────────────────────────────────────────
//  GET /api/leaderboard?segment=INDUSTRY|UNIVERSITY|STUDENT|DISTRICT
// ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const segment = (searchParams.get('segment') ?? 'INDUSTRY').toUpperCase()
  const limit   = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

  try {
    switch (segment) {
      case 'INDUSTRY': {
        const rows = await prisma.user.findMany({
          where:   { role: 'INDUSTRY' },
          orderBy: { points: 'desc' },
          take:    limit,
          select:  { id: true, name: true, orgName: true, points: true, districtId: true },
        })
        return NextResponse.json({ segment, data: rows.map((r, i) => ({ rank: i + 1, ...r })) })
      }

      case 'UNIVERSITY': {
        const rows = await prisma.user.findMany({
          where:   { role: 'UNIVERSITY' },
          orderBy: { points: 'desc' },
          take:    limit,
          select:  {
            id: true, name: true, orgName: true, points: true,
            _count: { select: { hackathons: true } },
          },
        })
        return NextResponse.json({ segment, data: rows.map((r, i) => ({ rank: i + 1, ...r })) })
      }

      case 'STUDENT': {
        const rows = await prisma.user.findMany({
          where:   { role: 'CITIZEN' },
          orderBy: { points: 'desc' },
          take:    limit,
          select:  {
            id: true, name: true, points: true, districtId: true,
            _count: { select: { solutions: true } },
          },
        })
        return NextResponse.json({ segment, data: rows.map((r, i) => ({ rank: i + 1, ...r })) })
      }

      case 'DISTRICT': {
        // Aggregate points by district
        const districts = await prisma.district.findMany({
          include: {
            users: { select: { points: true } },
          },
        })

        const data = districts
          .map(d => ({
            id:          d.id,
            name:        d.name,
            nameHi:      d.nameHi,
            totalPoints: d.users.reduce((sum, u) => sum + u.points, 0),
            userCount:   d.users.length,
          }))
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .slice(0, limit)
          .map((d, i) => ({ rank: i + 1, ...d }))

        return NextResponse.json({ segment, data })
      }

      default:
        return NextResponse.json({ error: 'Invalid segment. Use INDUSTRY | UNIVERSITY | STUDENT | DISTRICT' }, { status: 400 })
    }
  } catch (err) {
    console.error('[GET /api/leaderboard]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
