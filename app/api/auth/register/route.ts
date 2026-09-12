import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, setSessionCookie, signToken } from '@/lib/auth'

/**
 * Special portal IDs for elevated roles.
 * These are set here in the server — citizens cannot self-assign elevated roles.
 *
 * Regional Head and Admin accounts require a portal ID issued by the Government of Jharkhand.
 * Format: RH-XXXXX for Regional Heads, AD-XXXXX for Admins, MN-XXXXX for Ministry officials.
 *
 * TODO: In production, move these to a separate `PortalCode` DB table
 *       so codes can be issued and revoked by the Admin panel.
 */
const PORTAL_ID_ROLES: Record<string, string> = {
  'RH-JHKD-2026': 'REGIONAL_HEAD',
  'MN-EDUC-2026': 'REGIONAL_HEAD',  // Ministry education nodal officer
  'AD-SIH-2026':  'ADMIN',
}

export async function POST(req: NextRequest) {
  try {
    const { phone, name, nameHi, password, role, orgName, districtId, portalId } = await req.json()

    if (!phone || !name || !password) {
      return NextResponse.json({ error: 'नाम, मोबाइल और पासवर्ड आवश्यक हैं' }, { status: 400 })
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: '10 अंकों का मोबाइल नंबर दर्ज करें' }, { status: 400 })
    }

    // Determine actual role
    let resolvedRole: string = 'CITIZEN'

    if (portalId && portalId.trim()) {
      // User provided a portal ID — verify it
      const mappedRole = PORTAL_ID_ROLES[portalId.trim().toUpperCase()]
      if (!mappedRole) {
        return NextResponse.json({
          error: 'अमान्य पोर्टल ID — कृपया अपने विभाग से सही ID प्राप्त करें',
        }, { status: 400 })
      }
      resolvedRole = mappedRole
    } else if (role && ['UNIVERSITY', 'INDUSTRY'].includes(role)) {
      // University and Industry can self-register
      resolvedRole = role
    } else if (role && ['REGIONAL_HEAD', 'ADMIN'].includes(role)) {
      // These require a portal ID — reject if none provided
      return NextResponse.json({
        error: 'क्षेत्रीय अध्यक्ष/Admin के लिए पोर्टल ID अनिवार्य है',
      }, { status: 403 })
    }

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      return NextResponse.json({ error: 'यह मोबाइल नंबर पहले से रजिस्टर है' }, { status: 409 })
    }

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        nameHi: nameHi || null,
        password: hashed,
        role: resolvedRole as 'CITIZEN' | 'REGIONAL_HEAD' | 'UNIVERSITY' | 'INDUSTRY' | 'ADMIN',
        orgName: orgName || null,
        districtId: districtId || null,
      },
    })

    const sessionPayload = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      orgName: user.orgName,
      points: user.points,
    }

    await setSessionCookie(sessionPayload)
    const token = signToken(sessionPayload)

    return NextResponse.json({ success: true, role: user.role, name: user.name, token }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
