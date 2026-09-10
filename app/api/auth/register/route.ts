import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { phone, name, password, role, orgName, districtId } = await req.json()

    if (!phone || !name || !password) {
      return NextResponse.json({ error: 'Name, phone and password required' }, { status: 400 })
    }

    // Only allow UNIVERSITY and INDUSTRY self-registration
    // REGIONAL_HEAD and ADMIN are created by seeding / admin panel
    const allowedRoles = ['CITIZEN', 'UNIVERSITY', 'INDUSTRY']
    if (role && !allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 })
    }

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        password: hashed,
        role: role || 'CITIZEN',
        orgName: orgName || null,
        districtId: districtId || null,
      },
    })

    await setSessionCookie({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      orgName: user.orgName,
    })

    return NextResponse.json({ success: true, role: user.role }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
