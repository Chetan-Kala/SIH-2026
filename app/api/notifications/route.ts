import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// ─────────────────────────────────────────────────────────────
//  GET  /api/notifications        — Paginated list for current user
//  PATCH /api/notifications       — Mark all as read
// ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit  = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const unread = searchParams.get('unread') === 'true'

  const where: Record<string, unknown> = { userId: session.id }
  if (unread) where.read = false

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take:    limit,
    }),
    prisma.notification.count({ where: { userId: session.id, read: false } }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { ids } = body  // Optional: specific IDs to mark read. If absent, marks all.

  if (ids?.length) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: session.id },
      data: { read: true },
    })
  } else {
    await prisma.notification.updateMany({
      where: { userId: session.id, read: false },
      data: { read: true },
    })
  }

  return NextResponse.json({ success: true })
}
