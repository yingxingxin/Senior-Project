/**
 * Notifications Schema
 *
 * Contains tables for user notifications and notification preferences.
 * Notifications are created via BullMQ jobs for reliability.
 */

import {
  pgTable, serial, integer, varchar, text, boolean,
  timestamp, pgEnum, index, jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

// ============ ENUMS ============

/** Notification types for categorization and icon display */
export const notificationTypeEnum = pgEnum('notification_type', [
  'friend_request',
  'friend_accepted',
  'level_up',
  'system',
]);

// ============ TABLES ============

/**
 * Notifications Table - Stores user notifications with read status and navigation links
 *
 * WHEN CREATED: Via BullMQ notification worker when a triggering event occurs
 * WHEN UPDATED: When user reads the notification (read_at timestamp set)
 * USED BY: Notification dropdown in navbar, notification count badge
 *
 * Flow:
 *   User action (e.g., send friend request)
 *   → Server action calls enqueueNotification()
 *   → BullMQ worker processes job
 *   → Notification inserted into this table
 *   → User sees notification in dropdown
 */
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  /** URL to navigate to when notification is clicked */
  link: varchar('link', { length: 500 }),
  /** Additional context data (e.g., { senderId: 123, senderName: "John" }) */
  data: jsonb('data'),
  /** When the notification was read (null = unread) */
  read_at: timestamp('read_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('ix_notifications__user_created').on(t.user_id, t.created_at),
  index('ix_notifications__user_unread').on(t.user_id, t.read_at),
]);

// ============ RELATIONS ============

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id],
  }),
}));

// ============ TYPES ============

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export const notificationTypeValues = notificationTypeEnum.enumValues;
export type NotificationType = (typeof notificationTypeValues)[number];
