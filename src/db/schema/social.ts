/**
 * Social Schema
 *
 * Contains all tables related to user friendships and testimonials.
 */

import {
  pgTable, serial, integer, varchar, text, boolean,
  timestamp, pgEnum, uniqueIndex, index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

// ============ ENUMS ============

/**
 * Friendship status enum
 */
export const friendshipStatusEnum = pgEnum('friendship_status', [
  'pending',
  'accepted',
  'rejected',
]);

// ============ TABLES ============

/**
 * User Friendships Table - Tracks friend requests and accepted friendships
 *
 * WHEN CREATED: User sends a friend request
 * WHEN UPDATED: Receiver accepts or rejects the request
 * USED BY: Friend requests, friend lists, testimonial gating
 *
 * RULES:
 * - Only one friendship record per pair of users (enforced by unique constraint)
 * - Friends means status = 'accepted'
 * - Pending incoming: receiver_user_id = currentUserId and status = 'pending'
 */
export const user_friendships = pgTable('user_friendships', {
  id: serial('id').primaryKey(),
  requester_user_id: integer('requester_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiver_user_id: integer('receiver_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: friendshipStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Ensure only one friendship record per pair (regardless of direction)
  uniqueIndex('uq_friendships__pair').on(
    table.requester_user_id,
    table.receiver_user_id
  ),
  index('ix_friendships__requester').on(table.requester_user_id),
  index('ix_friendships__receiver').on(table.receiver_user_id),
  index('ix_friendships__status').on(table.status),
]);

/**
 * User Testimonials Table - Stores testimonials written by friends
 *
 * WHEN CREATED: A friend writes a testimonial about another user
 * WHEN UPDATED: Profile owner moderates (hides/deletes) testimonial
 * USED BY: Profile testimonials section
 *
 * RULES:
 * - Only friends can write testimonials (enforced at query level)
 * - Only public/approved testimonials are shown on profiles
 */
export const user_testimonials = pgTable('user_testimonials', {
  id: serial('id').primaryKey(),
  author_user_id: integer('author_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipient_user_id: integer('recipient_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  is_public: boolean('is_public').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('ix_testimonials__recipient').on(table.recipient_user_id),
  index('ix_testimonials__author').on(table.author_user_id),
  index('ix_testimonials__public').on(table.is_public),
]);

// ============ RELATIONS ============

export const userFriendshipsRelations = relations(user_friendships, ({ one }) => ({
  requester: one(users, {
    fields: [user_friendships.requester_user_id],
    references: [users.id],
    relationName: 'requester',
  }),
  receiver: one(users, {
    fields: [user_friendships.receiver_user_id],
    references: [users.id],
    relationName: 'receiver',
  }),
}));

export const userTestimonialsRelations = relations(user_testimonials, ({ one }) => ({
  author: one(users, {
    fields: [user_testimonials.author_user_id],
    references: [users.id],
    relationName: 'author',
  }),
  recipient: one(users, {
    fields: [user_testimonials.recipient_user_id],
    references: [users.id],
    relationName: 'recipient',
  }),
}));

// ============ TYPES ============

export type UserFriendship = typeof user_friendships.$inferSelect;
export type NewUserFriendship = typeof user_friendships.$inferInsert;

export type UserTestimonial = typeof user_testimonials.$inferSelect;
export type NewUserTestimonial = typeof user_testimonials.$inferInsert;

export const friendshipStatusValues = friendshipStatusEnum.enumValues;
export type FriendshipStatus = (typeof friendshipStatusValues)[number];

