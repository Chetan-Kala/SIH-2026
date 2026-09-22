/**
 * ============================================================
 *  NOTIFICATIONS — lib/notifications.ts
 * ============================================================
 *
 *  In-app notification helper. Writes to the Notification table.
 *  Called throughout the system whenever a significant event
 *  occurs (problem verified, hackathon updated, points awarded, etc.)
 * ============================================================
 */

import { prisma } from './prisma'
import type { NotificationType } from '@prisma/client'

export interface SendNotificationOptions {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

/**
 * Create a notification for a single user.
 */
export async function sendNotification(opts: SendNotificationOptions): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId:  opts.userId,
        type:    opts.type,
        title:   opts.title,
        message: opts.message,
        link:    opts.link ?? null,
      },
    })
  } catch (err) {
    // Notifications are non-critical — log but don't throw
    console.error('[Notifications] Failed to create notification:', err)
  }
}

/**
 * Create notifications for multiple users at once (bulk).
 */
export async function sendBulkNotifications(
  userIds: string[],
  opts: Omit<SendNotificationOptions, 'userId'>,
): Promise<void> {
  if (userIds.length === 0) return
  try {
    await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type:    opts.type,
        title:   opts.title,
        message: opts.message,
        link:    opts.link ?? null,
      })),
    })
  } catch (err) {
    console.error('[Notifications] Failed to send bulk notifications:', err)
  }
}

/**
 * Award points to a user and log the transaction.
 */
export async function awardPoints(
  userId: string,
  delta: number,
  reason: import('@prisma/client').PointsReason,
  refId?: string,
): Promise<void> {
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { points: { increment: delta } },
      }),
      prisma.pointsTransaction.create({
        data: { userId, delta, reason, refId: refId ?? null },
      }),
    ])
  } catch (err) {
    console.error('[Points] Failed to award points:', err)
  }
}
