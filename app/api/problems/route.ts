import { NextRequest, NextResponse } from 'next/server'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { classify } from '@/lib/classifier'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, submitterName, submitterPhone, districtId } = body

    if (!title || !description || !submitterName || !submitterPhone || !districtId) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({ where: { phone: submitterPhone } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: submitterPhone,
          name: submitterName,
          role: 'CITIZEN',
          districtId,
        }
      })
    }

    const { domain, routedTo } = classify(title, description)

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        submitterId: user.id,
        districtId,
        status: 'PENDING',
        domain,
        routedTo,
      }
    })

    return NextResponse.json({ success: true, problem }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  const problems = await prisma.problem.findMany({
    include: { submitter: true, district: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json({ problems })
}
