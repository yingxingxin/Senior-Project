/**
 * Progress & Gamification Schema
 *
 * Contains all tables related to user progress tracking, activity events,
 * achievements, and levels.
 */

import {
  pgTable, serial, bigserial, integer, varchar, text, boolean,
  primaryKey, timestamp, pgEnum, uniqueIndex, index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';
import { lessons, lesson_sections } from './lessons';
import { quizzes, quiz_attempts } from './quizzes';

// ============ ENUMS ============

/** Events that drive the activity feed and point awards */
export const activityEventTypeEnum = pgEnum('activity_event_type', [
  'lesson_started',
  'lesson_progressed',
  'lesson_completed',
  'quiz_started',
  'quiz_submitted',
  'quiz_perfect',
  'achievement_unlocked',
  'level_up',
  'goal_met',
]);

/** Achievement rarity for gamification */
export const achievementRarityEnum = pgEnum('achievement_rarity', [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
]);

// ============ TABLES ============

/**
 * User Lesson Progress Table - Tracks individual user progress through lessons with completion status and timestamps
 *
 * WHEN CREATED: User starts a lesson
 * WHEN UPDATED:
 *   - During lesson: update last_section_id, last_accessed_at
 *   - On completion: set is_completed=true, completed_at
 * USED BY: Resume functionality, progress display, dashboard
 *
 * USER STORIES SUPPORTED:
 *   - F20-US01: Auto-save progress (last_section_id)
 *   - F20-US02: Resume last lesson (last_section_id, last_accessed_at)
 *   - F20-US03: Progress reports (is_completed, completed_at)
 *   - F17-US01: Points from lessons (tracked via activity_events)
 */
export const user_lesson_progress = pgTable('user_lesson_progress', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lesson_id: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),

  last_section_id: integer('last_section_id').references(() => lesson_sections.id, { onDelete: 'set null' }),
  is_completed: boolean('is_completed').notNull().default(false),

  started_at: timestamp('started_at', { withTimezone: true }),
  last_accessed_at: timestamp('last_accessed_at', { withTimezone: true }).defaultNow(),
  completed_at: timestamp('completed_at', { withTimezone: true }),
}, (t) => [
  uniqueIndex('uq_user_lesson_progress__user_lesson').on(t.user_id, t.lesson_id),
  index('ix_user_lesson_progress__user').on(t.user_id),
  index('ix_user_lesson_progress__lesson').on(t.lesson_id),
]);

/**
 * Activity Events Table - Immutable log of all user actions that earn points or trigger notifications
 *
 * WHEN CREATED: Any trackable user action:
 *   - Lesson start/progress/completion
 *   - Quiz start/submission
 *   - Achievement unlock
 *   - Level up
 * WHEN UPDATED: Never (append-only, immutable)
 * USED BY: Activity feed, point totals (SUM), streak detection
 *
 * USER STORIES SUPPORTED:
 *   - F17-US01: Convert activities to points (points_delta)
 *   - F17-US02: Show total points (SUM aggregation)
 *   - F18-US01: Leaderboard data source
 *   - F20-US03: Activity history in progress reports
 *   - Streak calculation from occurred_at timestamps
 */
export const activity_events = pgTable('activity_events', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  event_type: activityEventTypeEnum('event_type').notNull(),
  occurred_at: timestamp('occurred_at', { withTimezone: true }).defaultNow(),

  points_delta: integer('points_delta').notNull().default(0),

  // Optional references based on event type
  lesson_id: integer('lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
  quiz_id: integer('quiz_id').references(() => quizzes.id, { onDelete: 'set null' }),
  quiz_attempt_id: integer('quiz_attempt_id').references(() => quiz_attempts.id, { onDelete: 'set null' }),
  achievement_id: integer('achievement_id').references(() => achievements.id, { onDelete: 'set null' }),
}, (t) => [
  index('ix_activity_events__user_time').on(t.user_id, t.occurred_at),
  index('ix_activity_events__time').on(t.occurred_at),
  index('ix_activity_events__lesson').on(t.lesson_id),
  index('ix_activity_events__quiz').on(t.quiz_id),
  index('ix_activity_events__quiz_attempt').on(t.quiz_attempt_id),
  index('ix_activity_events__achievement').on(t.achievement_id),
]);

/**
 * Achievements Table - Defines available badges with rarity levels, point rewards, and icon URLs
 *
 * WHEN CREATED: Seed data or admin panel
 * WHEN UPDATED: Rarely - new achievements added
 * USED BY: Achievement system, dashboard badges
 *
 * USER STORIES SUPPORTED:
 *   - F17-US01: Achievement-based points (points_reward)
 *   - F18-US01: Achievement display in profiles
 *   - Gamification through badges (rarity levels)
 *   - Visual rewards (icon_url)
 */
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 80 }).notNull(), // e.g. FIRST_LESSON, PERFECT_QUIZ
  name: varchar('name', { length: 160 }).notNull(),
  description: text('description'),
  icon_url: varchar('icon_url', { length: 500 }),
  rarity: achievementRarityEnum('rarity').notNull().default('common'),
  points_reward: integer('points_reward').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('uq_achievements__code').on(table.code),
]);

/**
 * User Achievements Table - Junction table tracking which achievements each user has unlocked
 *
 * WHEN CREATED: Achievement unlocked
 * WHEN UPDATED: Never (immutable once earned)
 * USED BY: Profile, dashboard, gamification logic
 *
 * USER STORIES SUPPORTED:
 *   - F17-US01: Track earned achievements
 *   - F20-US03: Show achievements in progress
 *   - F18-US01: Achievement count for leaderboard
 *   - Prevents duplicate achievement grants
 */
export const user_achievements = pgTable('user_achievements', {
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievement_id: integer('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  unlocked_at: timestamp('unlocked_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.user_id, t.achievement_id] }),
  index('ix_user_achievements__unlocked_at').on(t.unlocked_at),
]);

/**
 * Levels Table - Defines static XP thresholds for gamification levels with optional labels
 *
 * WHEN CREATED: Seed data (e.g., level 1=0 XP, level 2=100 XP)
 * WHEN UPDATED: Never (static configuration)
 * USED BY: Level calculation from total points
 *
 * USER STORIES SUPPORTED:
 *   - F18-US01: Level display in leaderboard
 *   - F20-US03: Progress report shows current level
 *   - Gamification through level progression
 */
export const levels = pgTable('levels', {
  level: integer('level').primaryKey(), // 1, 2, 3, ...
  xp_to_reach: integer('xp_to_reach').notNull(), // cumulative threshold
  label: varchar('label', { length: 80 }), // "Beginner", "Intermediate", etc.
});

// ============ RELATIONS ============

export const userLessonProgressRelations = relations(user_lesson_progress, ({ one }) => ({
  user: one(users, {
    fields: [user_lesson_progress.user_id],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [user_lesson_progress.lesson_id],
    references: [lessons.id],
  }),
  lastSection: one(lesson_sections, {
    fields: [user_lesson_progress.last_section_id],
    references: [lesson_sections.id],
  }),
}));


export const activityEventsRelations = relations(activity_events, ({ one }) => ({
  user: one(users, {
    fields: [activity_events.user_id],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [activity_events.lesson_id],
    references: [lessons.id],
  }),
  quiz: one(quizzes, {
    fields: [activity_events.quiz_id],
    references: [quizzes.id],
  }),
  quizAttempt: one(quiz_attempts, {
    fields: [activity_events.quiz_attempt_id],
    references: [quiz_attempts.id],
  }),
  achievement: one(achievements, {
    fields: [activity_events.achievement_id],
    references: [achievements.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(user_achievements),
  activityEvents: many(activity_events),
}));

export const userAchievementsRelations = relations(user_achievements, ({ one }) => ({
  user: one(users, {
    fields: [user_achievements.user_id],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [user_achievements.achievement_id],
    references: [achievements.id],
  }),
}));

// ============ TYPES ============

export type UserLessonProgress = typeof user_lesson_progress.$inferSelect;
export type NewUserLessonProgress = typeof user_lesson_progress.$inferInsert;


export type ActivityEvent = typeof activity_events.$inferSelect;
export type NewActivityEvent = typeof activity_events.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;

export type UserAchievement = typeof user_achievements.$inferSelect;
export type NewUserAchievement = typeof user_achievements.$inferInsert;

export type Level = typeof levels.$inferSelect;
export type NewLevel = typeof levels.$inferInsert;

// ============ ENUM HELPERS ============

export const activityEventTypeValues = activityEventTypeEnum.enumValues;
export type ActivityEventType = (typeof activityEventTypeValues)[number];

export const achievementRarityValues = achievementRarityEnum.enumValues;
export type AchievementRarity = (typeof achievementRarityValues)[number];
