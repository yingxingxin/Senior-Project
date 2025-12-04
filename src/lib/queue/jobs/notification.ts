/**
 * Notification Job Processor
 *
 * Handles creating notifications when a job is picked up by a worker.
 * This decouples notification creation from user actions for reliability.
 */

import type { Job } from 'bullmq';
import type {
  CreateNotificationJobData,
  CreateNotificationJobResult,
} from '../types';
import { createNotification } from '@/src/db/queries/notifications';

/**
 * Process a notification creation job
 *
 * This is the main entry point called by the BullMQ worker.
 * It inserts the notification into the database.
 *
 * Future enhancements can add:
 * - Email notifications (via existing Resend setup)
 * - Push notifications
 * - Real-time updates via WebSocket
 *
 * @param job - BullMQ job instance with notification data
 * @returns Notification creation result with ID and success status
 */
export async function processNotification(
  job: Job<CreateNotificationJobData, CreateNotificationJobResult>
): Promise<CreateNotificationJobResult> {
  const { userId, type, title, message, link, data } = job.data;

  console.log(`[Job ${job.id}] Creating notification`, {
    userId,
    type,
    title,
  });

  try {
    // Insert notification into database
    const notification = await createNotification({
      userId,
      type,
      title,
      message,
      link,
      data,
    });

    console.log(`[Job ${job.id}] Notification created:`, {
      notificationId: notification.id,
      userId,
      type,
    });

    return {
      notificationId: notification.id,
      success: true,
    };
  } catch (error) {
    console.error(`[Job ${job.id}] Failed to create notification:`, error);

    // Re-throw to let BullMQ handle retry logic
    throw error;
  }
}
