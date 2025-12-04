"use server";

import { headers } from "next/headers";
import { auth } from "@/src/lib/auth";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/src/db/queries/notifications";
import type { Notification } from "@/src/db/schema";

/**
 * Fetch notifications for the current user
 *
 * @param limit - Maximum number of notifications to return (default 20)
 * @returns Array of notifications or null if not authenticated
 */
export async function fetchNotifications(
  limit: number = 20
): Promise<Notification[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const userId = parseInt(session.user.id, 10);
  return getNotifications(userId, limit);
}

/**
 * Get unread notification count for the current user
 *
 * @returns Unread count or 0 if not authenticated
 */
export async function fetchUnreadCount(): Promise<number> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return 0;
  }

  const userId = parseInt(session.user.id, 10);
  return getUnreadNotificationCount(userId);
}

/**
 * Mark a single notification as read
 *
 * @param notificationId - The notification ID to mark as read
 * @returns Success status and updated notification
 */
export async function markAsRead(
  notificationId: number
): Promise<{ success: boolean; notification?: Notification }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false };
  }

  const userId = parseInt(session.user.id, 10);
  const notification = await markNotificationAsRead(notificationId, userId);

  if (!notification) {
    return { success: false };
  }

  return { success: true, notification };
}

/**
 * Mark all notifications as read for the current user
 *
 * @returns Success status and count of notifications marked
 */
export async function markAllAsRead(): Promise<{
  success: boolean;
  count: number;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, count: 0 };
  }

  const userId = parseInt(session.user.id, 10);
  const count = await markAllNotificationsAsRead(userId);

  return { success: true, count };
}
