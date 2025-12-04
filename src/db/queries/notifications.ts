/**
 * Notification Queries
 *
 * Database query helpers for managing user notifications.
 */

import { db } from '@/src/db';
import { notifications, NotificationType } from '@/src/db/schema';
import { eq, and, desc, sql, isNull, count } from 'drizzle-orm';

/**
 * Get notifications for a user
 *
 * @param userId - User ID
 * @param limit - Maximum number of notifications to return (default 20)
 * @returns Array of notifications, most recent first
 */
export async function getNotifications(userId: number, limit: number = 20) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at))
    .limit(limit);
}

/**
 * Get count of unread notifications for a user
 *
 * @param userId - User ID
 * @returns Count of unread notifications
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.user_id, userId),
        isNull(notifications.read_at)
      )
    );

  return result?.count ?? 0;
}

/**
 * Mark a single notification as read
 *
 * @param notificationId - Notification ID
 * @param userId - User ID (for security - ensures user owns notification)
 * @returns Updated notification or null if not found
 */
export async function markNotificationAsRead(notificationId: number, userId: number) {
  const [updated] = await db
    .update(notifications)
    .set({ read_at: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.user_id, userId),
        isNull(notifications.read_at)
      )
    )
    .returning();

  return updated ?? null;
}

/**
 * Mark all notifications as read for a user
 *
 * @param userId - User ID
 * @returns Number of notifications marked as read
 */
export async function markAllNotificationsAsRead(userId: number): Promise<number> {
  const result = await db
    .update(notifications)
    .set({ read_at: new Date() })
    .where(
      and(
        eq(notifications.user_id, userId),
        isNull(notifications.read_at)
      )
    )
    .returning({ id: notifications.id });

  return result.length;
}

/**
 * Create a new notification
 *
 * Used by the BullMQ notification worker to insert notifications.
 *
 * @param data - Notification data
 * @returns Created notification
 */
export async function createNotification(data: {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
}) {
  const [created] = await db
    .insert(notifications)
    .values({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link ?? null,
      data: data.data ?? null,
    })
    .returning();

  return created;
}

/**
 * Delete old read notifications
 *
 * Cleanup utility to remove notifications older than specified days.
 * Only deletes read notifications.
 *
 * @param daysOld - Delete notifications older than this many days (default 30)
 * @returns Number of deleted notifications
 */
export async function deleteOldNotifications(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db
    .delete(notifications)
    .where(
      and(
        sql`${notifications.read_at} IS NOT NULL`,
        sql`${notifications.created_at} < ${cutoffDate}`
      )
    )
    .returning({ id: notifications.id });

  return result.length;
}
