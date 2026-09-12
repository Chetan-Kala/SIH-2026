import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, setSessionCookie, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { phone } })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'अमान्य क्रेडेंशियल — मोबाइल नंबर या पासवर्ड गलत है' }, { status: 401 })
    }

    const valid = await comparePassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'अमान्य क्रेडेंशियल — मोबाइल नंबर या पासवर्ड गलत है' }, { status: 401 })
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      orgName: user.orgName,
      points: user.points,
    }

    await setSessionCookie(sessionPayload)

    // Also return a token for localStorage (used by client-side Navbar)
    const token = signToken(sessionPayload)

    return NextResponse.json({ success: true, role: user.role, name: user.name, token })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
