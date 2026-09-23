import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [
      totalProblems,
      verifiedProblems,
      hackathonSolutions,
      partnerUniversities,
      industryPartners,
      activeDistricts,
    ] = await Promise.all([
      // Total problems submitted
      prisma.problem.count(),

      // Problems that have been verified (status not PENDING or REJECTED)
      prisma.problem.count({
        where: {
          status: {
            in: ['VERIFIED', 'ROUTED', 'IN_PROGRESS', 'RESOLVED'],
          },
        },
      }),

      // Total solutions submitted across all hackathons
      prisma.solution.count(),

      // Distinct universities that have created at least one hackathon
      prisma.user.count({
        where: {
          role: 'UNIVERSITY',
        },
      }),

      // Distinct industry partners registered
      prisma.user.count({
        where: {
          role: 'INDUSTRY',
        },
      }),

      // Districts that have at least one problem submitted
      prisma.problem.findMany({
        distinct: ['districtId'],
        select: { districtId: true },
      }),
    ])

    return NextResponse.json({
      totalProblems,
      verifiedProblems,
      hackathonSolutions,
      partnerUniversities,
      industryPartners,
      activeDistricts: activeDistricts.length,
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
