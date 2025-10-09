/**
 * Authentication & Identity Schema
 *
 * Contains all tables related to user authentication, accounts, sessions,
 * and verification tokens.
 */

import {
  pgTable, serial, integer, varchar, text, boolean,
  timestamp, pgEnum, uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { assistants } from './lessons';
import { study_settings, user_preferences, user_theme_settings, user_music_tracks } from './preferences';
import { user_lesson_progress, user_lesson_sections, activity_events, user_achievements } from './progress';
import { quiz_attempts } from './quizzes';

// ============ ENUMS ============

/** User role for admin access control */
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const onboardingStepEnum = pgEnum('onboarding_step', ['welcome', 'gender', 'skill_quiz', 'persona', 'guided_intro']);

/** Skill level for initial placement from onboarding quiz */
export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'intermediate', 'advanced']);

export const assistantPersonaEnum = pgEnum('assistant_persona', ['calm', 'kind', 'direct']);

// ============ TABLES ============

/**
 * Users Table - Stores core user account information including authentication details, profile data, and assistant preferences
 *
 * WHEN CREATED: User signup (via auth provider or email)
 * WHEN UPDATED:
 *   - Profile changes (name, image)
 *   - Email verification (is_email_verified, email_verified_at)
 *   - Onboarding progress (onboarding_step, onboarding_completed_at)
 *   - Assistant selection (assistant_id, assistant_persona)
 * USED BY: All features that need user context
 *
 * USER STORIES SUPPORTED:
 *   - F19-US01: Create account (email, is_email_verified)
 *   - F19-US02: Log in securely (authentication)
 *   - F01-US01/02: Choose assistant gender (assistant_id)
 *   - F02-US01: Select assistant personality (assistant_persona)
 *   - F03-US01: Assistant welcomes learner (onboarding_step, onboarding_completed_at)
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  is_email_verified: boolean('is_email_verified').notNull().default(false),
  email_verified_at: timestamp('email_verified_at', { withTimezone: true }),
  image: varchar('image', { length: 500 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  // Assistant preferences - set during onboarding
  assistant_id: integer('assistant_id').references(() => assistants.id),
  assistant_persona: assistantPersonaEnum('assistant_persona'),
  // Skill placement from onboarding quiz
  skill_level: skillLevelEnum('skill_level'),
  // Onboarding tracking
  onboarding_completed_at: timestamp('onboarding_completed_at', { withTimezone: true }),
  onboarding_step: onboardingStepEnum('onboarding_step'),
  // Role for admin access (defaults to 'user')
  role: userRoleEnum('role').notNull().default('user'),
});

/**
 * Account Table - Manages OAuth provider connections and credential-based authentication for each user
 *
 * WHEN CREATED: User signs up or links new provider
 * WHEN UPDATED: Token refresh (access_token_expires_at, refresh_token_expires_at), password changes
 * USED BY: Authentication system (Better Auth)
 *
 * USER STORIES SUPPORTED:
 *   - F19-US02: Log in securely (OAuth: Google, GitHub)
 *   - F19-US01: Create account with social providers
 *   - Enables multiple auth methods per user
 */
export const accounts = pgTable('accounts', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`gen_random_uuid()::varchar(255)`),
  user_id: integer('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  account_id: varchar('account_id', { length: 255 }).notNull(),
  provider_id: varchar('provider_id', { length: 64 }).notNull(),

  access_token: text('access_token'),
  refresh_token: text('refresh_token'),
  access_token_expires_at: timestamp('access_token_expires_at', { withTimezone: true }),
  refresh_token_expires_at: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  id_token: text('id_token'),

  password: varchar('password', { length: 255 }),

  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('uq_accounts__provider_account').on(table.provider_id, table.account_id),
]);

/**
 * Session Table - Tracks active user sessions with security metadata like IP addresses and user agents
 *
 * WHEN CREATED: User logs in
 * WHEN UPDATED: Session activity (updated_at)
 * WHEN DELETED: User logs out or session expires (expires_at)
 * USED BY: Auth system for session management
 *
 * USER STORIES SUPPORTED:
 *   - F19-US02: Log in securely (session tokens)
 *   - F19-US03: Reset password (invalidate old sessions)
 *   - Security tracking via IP and user agent
 */
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`gen_random_uuid()::varchar(255)`),
  user_id: integer('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  token: varchar('token', { length: 255 }).notNull().unique(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  ip_address: varchar('ip_address', { length: 64 }),
  user_agent: text('user_agent'),

  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

/**
 * Verification Table - Stores temporary verification tokens for email confirmation and password resets
 *
 * WHEN CREATED: Email verification requested
 * WHEN DELETED: Token used or expired (expires_at)
 * USED BY: Email verification flow
 *
 * USER STORIES SUPPORTED:
 *   - F19-US01: Create account (email verification)
 *   - F19-US03: Reset password (reset tokens)
 *   - Temporary tokens with expiration for security
 */
export const verifications = pgTable('verifications', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`gen_random_uuid()::varchar(255)`),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expires_at: timestamp('expires_at').notNull(),

  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ============ RELATIONS ============

export const usersRelations = relations(users, ({ one, many }) => ({
  // Core associations
  assistant: one(assistants, {
    fields: [users.assistant_id],
    references: [assistants.id],
  }),
  studySettings: one(study_settings, {
    fields: [users.id],
    references: [study_settings.user_id],
  }),
  preferences: one(user_preferences, {
    fields: [users.id],
    references: [user_preferences.user_id],
  }),
  themeSettings: one(user_theme_settings, {
    fields: [users.id],
    references: [user_theme_settings.user_id],
  }),

  // Auth
  accounts: many(accounts),
  sessions: many(sessions),

  // Learning
  lessonProgress: many(user_lesson_progress),
  lessonSectionCompletions: many(user_lesson_sections),

  // Quizzes
  quizAttempts: many(quiz_attempts),

  // Activity and gamification
  activityEvents: many(activity_events),
  userAchievements: many(user_achievements),

  // Misc
  userMusicTracks: many(user_music_tracks),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.user_id],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.user_id],
    references: [users.id],
  }),
}));

// ============ TYPES ============

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

// ============ ENUM HELPERS ============

export const userRoleValues = userRoleEnum.enumValues;
export type UserRole = (typeof userRoleValues)[number];

export const onboardingStepValues = onboardingStepEnum.enumValues;
export type OnboardingStep = (typeof onboardingStepValues)[number];

export const skillLevelValues = skillLevelEnum.enumValues;
export type SkillLevel = (typeof skillLevelValues)[number];

export const assistantPersonaValues = assistantPersonaEnum.enumValues;
export type AssistantPersona = (typeof assistantPersonaValues)[number];
