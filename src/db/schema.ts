/**
 * Database Schema Definition
 *
 * This file defines the complete database structure using Drizzle ORM.
 * Tables are organized into logical groups:
 * 1. Authentication & Users
 * 2. Learning Content (Assistants, Lessons, Quizzes)
 * 3. Progress Tracking
 * 4. Gamification (Leaderboards, Achievements)
 * 5. User Experience (Dashboard, Study Modes)
 *
 * Update patterns are documented for each table below.
 */

import {
  pgTable, serial, bigserial, varchar, text, integer, real, boolean,
  primaryKey, timestamp, time, pgEnum, uniqueIndex, index, check, foreignKey
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ============ ENUMS ============
// These define the allowed values for certain fields

// User role for admin access control
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const assistantGenderEnum = pgEnum('assistant_gender', ['feminine', 'masculine', 'androgynous']);

export const assistantPersonaEnum = pgEnum('assistant_persona', ['calm', 'kind', 'direct']);

export const onboardingStepEnum = pgEnum('onboarding_step', ['welcome', 'gender', 'skill_quiz', 'persona', 'guided_intro']);

// Skill level for initial placement from onboarding quiz
export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'intermediate', 'advanced']);

/* Events that drive the activity feed and point awards */
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

/* Achievement rarity for gamification */
export const achievementRarityEnum = pgEnum('achievement_rarity', [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
]);

/* Difficulty levels used across quizzes and preferences */
export const difficultyEnum = pgEnum('difficulty', ['easy', 'standard', 'hard']);

// ============ AUTHENTICATION & USER TABLES ============

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

// ============ LEARNING CONTENT TABLES ============

/**
 * Assistants Table - Defines AI learning assistants with unique personalities, genders, and avatar images
 *
 * WHEN CREATED: Seed data or admin panel
 * WHEN UPDATED: Rarely - content updates (avatar_url, tagline, description)
 * USED BY: Onboarding, user preferences, lesson content
 *
 * USER STORIES SUPPORTED:
 *   - F01-US01/02: Choose assistant gender (gender field)
 *   - F02-US01/02: Select & preview personalities (tagline, description)
 *   - F03-US01: Assistant welcomes learner (avatar_url, name)
 *   - F04-US01/02: Wardrobe changes (avatar_url variations)
 */
export const assistants = pgTable('assistants', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 64 }).notNull(),
  gender: assistantGenderEnum('gender'),
  avatar_url: varchar('avatar_url', { length: 500 }),
  tagline: varchar('tagline', { length: 160 }),
  description: text('description'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('uq_assistants__slug').on(table.slug),
]);

/**
 * Lessons Table - Contains structured learning modules with difficulty levels and estimated completion times
 *
 * WHEN CREATED: Content creation (admin/CMS)
 * WHEN UPDATED: Content edits (title, description, estimated_duration_sec)
 * USED BY: Learning flow, progress tracking
 *
 * USER STORIES SUPPORTED:
 *   - F06-US01: Quiz content source (lessons provide quiz material)
 *   - F08-US01: Topic-specific Q&A (content field)
 *   - F09-US01/02: Re-explanation source (different examples)
 *   - F20-US01/02: Progress tracking & resume (via usersLessonsProgress)
 *
 * NOTE: Assistant selection is user-driven at the user level
 */
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  difficulty: difficultyEnum('difficulty'),
  estimated_duration_sec: integer('estimated_duration_sec'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex('uq_lessons__slug').on(t.slug),
]);

/**
 * Lesson Sections Table - Breaks lessons into ordered, addressable sections with markdown content for granular progress tracking
 *
 * WHEN CREATED: Content creation/lesson structuring
 * WHEN UPDATED: Content edits (body_md, title)
 * USED BY: Lesson display, progress tracking, deep linking
 *
 * USER STORIES SUPPORTED:
 *   - F20-US01/02: Granular progress tracking at section level
 *   - F09-US01/02: Deep links to specific sections for re-explanation
 *   - Modular content management
 *   - Section-level resume functionality
 */
export const lesson_sections = pgTable('lesson_sections', {
  id: serial('id').primaryKey(),
  lesson_id: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  order_index: integer('order_index').notNull().default(0),
  slug: varchar('slug', { length: 64 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body_md: text('body_md').notNull(),
}, (t) => [
  uniqueIndex('uq_lesson_sections__lesson_order').on(t.lesson_id, t.order_index),
  uniqueIndex('uq_lesson_sections__lesson_slug').on(t.lesson_id, t.slug),
  index('ix_lesson_sections__lesson').on(t.lesson_id),
]);

/**
 * Music Tracks Table - Stores background music files with metadata for study session ambience
 *
 * WHEN CREATED: Content upload
 * WHEN UPDATED: Rarely - metadata changes (duration_sec, volume)
 * USED BY: Study mode ambience feature
 *
 * USER STORIES SUPPORTED:
 *   - F12-US01: Enable background music (file_url)
 *   - F12-US02: Multiple track options (multiple records)
 *   - F13-US01: Volume control (volume field 0-1)
 *   - F16-US01: Ambient sounds (can store ambience)
 */
export const music_tracks = pgTable('music_tracks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }),
  duration_sec: integer('duration_sec'),
  file_url: varchar('file_url', { length: 500 }),
  volume: real('volume'), // 0..1
}, (t) => [
  check('ck_music_tracks__volume', sql`${t.volume} >= 0 AND ${t.volume} <= 1`),
]);

/**
 * Dialogues Table - Predefined conversation scripts for assistant interactions organized by scene and role
 *
 * WHEN CREATED: Content creation
 * WHEN UPDATED: Content edits (message, scene)
 * USED BY: Assistant interactions, chat features
 *x`
 * USER STORIES SUPPORTED:
 *   - F03-US01/02: Welcome & dashboard explanation (scene='welcome')
 *   - F04-US02: Acknowledge wardrobe changes (scene='wardrobe')
 *   - F11-US01/02/03: Personality responses (per assistantId)
 *   - F10-US02: Redirect to lesson (scene='off_topic')
 */
export const dialogues = pgTable('dialogues', {
  id: serial('id').primaryKey(),
  assistant_id: integer('assistant_id').references(() => assistants.id, { onDelete: 'cascade' }),
  scene: varchar('scene', { length: 64 }),
  order_index: integer('order_index').notNull().default(0),
  role: varchar('role', { length: 16 }).notNull().default('assistant'), // assistant|user|system
  message: text('message').notNull(),
}, (t) => [
  index('ix_dialogues__assistant_scene_order').on(t.assistant_id, t.scene, t.order_index),
]);

// ============ USER EXPERIENCE TABLES ============

/**
 * Themes Table - Defines available UI themes with customizable colors, fonts, and border radius settings
 *
 * WHEN CREATED: Seed data or admin panel
 * WHEN UPDATED: Theme additions/modifications (primary, secondary, accent, radius, font)
 * USED BY: Theme selection, UI customization
 *
 * USER STORIES SUPPORTED:
 *   - F05-US01: Swap between default themes (multiple pre-built themes)
 *   - F05-US02: Base for custom themes (color/font/radius fields)
 *   - Theme persistence across devices (via slug reference)
 *   - Visual customization:
 *     - primary/secondary/accent: Color scheme
 *     - radius: Border radius for UI elements
 *     - font: Typography selection
 */
export const themes = pgTable('themes', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  radius: varchar('radius', { length: 8 }),
  font: varchar('font', { length: 64 }),
  primary: varchar('primary', { length: 16 }),
  secondary: varchar('secondary', { length: 16 }),
  accent: varchar('accent', { length: 16 }),
}, (t) => [
  uniqueIndex('uq_themes__slug').on(t.slug),
]);

/**
 * User Theme Settings Table - Stores individual user theme preferences including wallpaper and motion settings
 *
 * WHEN CREATED: User customizes theme
 * WHEN UPDATED: Theme preference changes (theme_id, wallpaper_url, low_motion)
 * USED BY: UI rendering, theme application
 *
 * USER STORIES SUPPORTED:
 *   - F05-US01: Select and persist theme choice (theme_id)
 *     - Theme syncs across devices via user association
 *     - Instant preview and persistence after reload
 *   - F05-US02: Upload custom theme assets
 *     - wallpaper_url: Custom background images
 *     - Validation handled at application layer
 *     - Custom themes saved per user
 *   - Accessibility: Low motion mode for animations (low_motion)
 */
export const user_theme_settings = pgTable('user_theme_settings', {
  user_id: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  theme_id: integer('theme_id').references(() => themes.id, { onDelete: 'set null' }),
  wallpaper_url: varchar('wallpaper_url', { length: 500 }),
  low_motion: boolean('low_motion').notNull().default(false),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

/**
 * Quizzes Table - Defines quizzes with configurable difficulty, time limits, and passing thresholds
 *
 * WHEN CREATED: Content creation
 * WHEN UPDATED: Quiz edits (topic, difficulty, time_limit_sec, passing_pct)
 * USED BY: Quiz system, progress tracking
 *
 * USER STORIES SUPPORTED:
 *   - F06-US01: Assistant quizzes learner (quiz definitions)
 *   - F06-US03: Passing based on percentage threshold
 *   - F20-US01: Track quiz completion (via quizAttempts)
 *   - Difficulty-based personalization
 */
export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  topic: varchar('topic', { length: 255 }),
  difficulty: difficultyEnum('difficulty'),
  time_limit_sec: integer('time_limit_sec'),
  passing_pct: integer('passing_pct').notNull().default(70),
  lesson_id: integer('lesson_id').references(() => lessons.id),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('ix_quizzes__lesson').on(t.lesson_id),
  index('ix_quizzes__created').on(t.created_at),
  check('ck_quizzes__passing_pct', sql`${t.passing_pct} BETWEEN 0 AND 100`),
]);

/**
 * Quiz Questions Table - Stores individual quiz questions with point values and optional hints
 *
 * WHEN CREATED: Quiz creation/editing
 * WHEN UPDATED: Question edits (text, points, hint)
 * USED BY: Quiz engine, question display
 *
 * USER STORIES SUPPORTED:
 *   - F06-US01: Single-answer MCQ questions only
 *   - F07-US01/02: Progressive hints (hint field)
 *   - Dynamic scoring (points per question)
 *   - Question ordering (orderIndex)
 */
export const quiz_questions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  quiz_id: integer('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  order_index: integer('order_index').notNull().default(0),
  text: text('text').notNull(),
  points: integer('points').notNull().default(1),
  hint: text('hint'),
  lesson_section_id: integer('lesson_section_id').references(() => lesson_sections.id, { onDelete: 'set null' }),
}, (t) => [
  index('ix_quiz_questions__quiz').on(t.quiz_id),
  uniqueIndex('uq_quiz_questions__quiz_order').on(t.quiz_id, t.order_index),
  check('ck_quiz_questions__points_positive', sql`${t.points} > 0`),
]);

/**
 * Quiz Options Table (formerly quiz_question_answers) - Stores multiple choice answer options with correctness indicators
 *
 * WHEN CREATED: Question creation (required for ALL questions)
 * WHEN UPDATED: Option edits (text, is_correct, order_index)
 * USED BY: Quiz display, answer validation
 *
 * USER STORIES SUPPORTED:
 *   - F06-US01: Single-answer multiple choice questions
 *   - F06-US02: Instant feedback (isCorrect validation)
 *   - Exactly one correct answer per question
 */
export const quiz_options = pgTable('quiz_options', {
  id: serial('id').primaryKey(),
  // the question that the answer belongs to
  question_id: integer('question_id').notNull().references(() => quiz_questions.id, { onDelete: 'cascade' }),
  // the order in which the answer is displayed to the user
  order_index: integer('order_index').notNull().default(0),
  // the text of the answer
  text: text('text').notNull(),
  // whether the answer is correct
  is_correct: boolean('is_correct').notNull().default(false),
}, (t) => [
  index('ix_quiz_options__question').on(t.question_id),
  uniqueIndex('uq_quiz_options__question_order').on(t.question_id, t.order_index),
  // Ensures exactly one correct option per question
  uniqueIndex('uq_quiz_options__one_correct_per_question')
    .on(t.question_id)
    .where(sql`${t.is_correct} = true`),
  // Composite unique for foreign key constraint
  uniqueIndex('uq_quiz_options__qid_id').on(t.question_id, t.id),
]);

// ============ GAMIFICATION & PERSONALIZATION TABLES ============

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

// Note: Skill quiz functionality now uses the existing quiz system
// The skill_level enum and user.skill_level column are still used
// but skill assessment questions are stored in the standard quiz tables

/**
 * User Preferences Table - Stores personalized learning settings including difficulty, goals, and reminders
 *
 * WHEN CREATED: User customizes settings
 * WHEN UPDATED: Settings changes (difficulty, daily_goal_minutes, daily_goal_points, reminder_time)
 * USED BY: Learning recommendations, reminder system
 *
 * USER STORIES SUPPORTED:
 *   - F02-US03: Switch persona preferences
 *   - Daily goal tracking (minutes, points)
 *   - Personalized difficulty settings
 *   - Timezone for accurate streak calculations
 */
export const user_preferences = pgTable('user_preferences', {
  user_id: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  difficulty: difficultyEnum('difficulty'),
  daily_goal_minutes: integer('daily_goal_minutes'),
  daily_goal_points: integer('daily_goal_points'),
  timezone: varchar('timezone', { length: 64 }),
  reminders_enabled: boolean('reminders_enabled').notNull().default(false),
  reminder_time: time('reminder_time'), // time-of-day
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

/**
 * Study Settings Table - Configures study environment preferences including background and mentor visibility
 *
 * WHEN CREATED: User customizes study environment
 * WHEN UPDATED: Preference changes (background, is_mentor_visible, background_ambience)
 * USED BY: Study session UI
 *
 * USER STORIES SUPPORTED:
 *   - F14-US01/02: Study mode with backgrounds
 *   - F15-US01/02: Assistant visibility toggle (is_mentor_visible)
 *   - F16-US01: Background ambience settings
 *   - Personalized study environment
 */
export const study_settings = pgTable('study_settings', {
  id: serial('id').primaryKey(),
  background: varchar('background', { length: 255 }),
  is_mentor_visible: boolean('is_mentor_visible'),
  background_ambience: varchar('background_ambience', { length: 255 }),
  user_id: integer('user_id').unique().references(() => users.id),
});

// ============ PROGRESS TRACKING TABLES ============

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
 * User Lesson Sections Table - Records completed lesson sections for granular progress tracking
 *
 * WHEN CREATED: User completes a lesson section
 * WHEN UPDATED: Never (immutable, one row per completion)
 * USED BY: Progress calculation, resume functionality
 *
 * USER STORIES SUPPORTED:
 *   - F20-US01: Granular progress tracking (count completed sections)
 *   - F20-US02: Section-level resume capability
 *   - Progress percentage: COUNT(completed) / COUNT(total sections)
 */
export const user_lesson_sections = pgTable('user_lesson_sections', {
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  section_id: integer('section_id').notNull().references(() => lesson_sections.id, { onDelete: 'cascade' }),
  completed_at: timestamp('completed_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex('uq_user_lesson_sections__user_section').on(t.user_id, t.section_id),
  index('ix_user_lesson_sections__user').on(t.user_id),
  index('ix_user_lesson_sections__section').on(t.section_id),
]);

// ============ JUNCTION TABLES ============
// These connect users to various features

/**
 * User Music Tracks Table (formerly user_music) - Junction table linking users to their selected background music
 *
 * WHEN CREATED: User selects background music
 * WHEN DELETED: User removes music preference
 * USED BY: Study mode audio system
 *
 * USER STORIES SUPPORTED:
 *   - F12-US01: Enable/disable music per user
 *   - F12-US02: Multiple track selections
 *   - F13-US02: Independent music preferences
 */
export const user_music_tracks = pgTable('user_music_tracks', {
  user_id: integer('user_id').notNull().references(() => users.id),
  music_track_id: integer('music_track_id').notNull().references(() => music_tracks.id),
}, (table) => [
  primaryKey({ columns: [table.user_id, table.music_track_id] }),
]);

/**
 * Quiz Attempts Table - Records metadata for each quiz attempt including timing and attempt number
 *
 * WHEN CREATED: User starts a quiz
 * WHEN UPDATED: Quiz submission (set submitted_at, duration_sec)
 * USED BY: Quiz history, progress tracking, analytics
 *
 * USER STORIES SUPPORTED:
 *   - F20-US01: Track quiz progress (attempt_number)
 *   - Multiple attempt tracking
 *   - Timing and completion tracking (duration_sec)
 */
export const quiz_attempts = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  quiz_id: integer('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),

  attempt_number: integer('attempt_number').notNull().default(1),
  started_at: timestamp('started_at', { withTimezone: true }).defaultNow(),
  submitted_at: timestamp('submitted_at', { withTimezone: true }),
  duration_sec: integer('duration_sec'),
}, (t) => [
  uniqueIndex('uq_quiz_attempts__user_quiz_num').on(t.user_id, t.quiz_id, t.attempt_number),
  index('ix_quiz_attempts__user').on(t.user_id),
  index('ix_quiz_attempts__quiz_started').on(t.quiz_id, t.started_at),
]);

/**
 * Quiz Attempt Answers Table - Records user's selected answer for each question with timing data
 *
 * WHEN CREATED: User answers a question
 * WHEN UPDATED: Never (immutable)
 * USED BY: Answer review, analytics
 *
 * USER STORIES SUPPORTED:
 *   - F06-US02: Track selected answers (selected_option_id)
 *   - F07-US02: Time tracking for hint usage (time_taken_ms)
 *   - Detailed quiz analytics per question
 */
export const quiz_attempt_answers = pgTable('quiz_attempt_answers', {
  id: serial('id').primaryKey(),
  // the quiz attempts session that the users attempt belongs to
  attempt_id: integer('attempt_id').notNull().references(() => quiz_attempts.id, { onDelete: 'cascade' }),
  question_id: integer('question_id').notNull().references(() => quiz_questions.id, { onDelete: 'cascade' }),
  selected_option_id: integer('selected_option_id').notNull().references(() => quiz_options.id, { onDelete: 'restrict' }),
  time_taken_ms: integer('time_taken_ms'),
}, (t) => ({
  uqAttemptQuestion: uniqueIndex('uq_quiz_attempt_answers__attempt_question').on(t.attempt_id, t.question_id),
  ixByAttempt: index('ix_quiz_attempt_answers__attempt').on(t.attempt_id),
  ixByOption: index('ix_quiz_attempt_answers__selected_option').on(t.selected_option_id),
  // Composite FK to ensure selected option belongs to the question
  fkOptionBelongsToQuestion: foreignKey({
    columns: [t.question_id, t.selected_option_id],
    foreignColumns: [quiz_options.question_id, quiz_options.id],
    name: 'fk_quiz_attempt_answers__option_belongs_to_question',
  }),
}));

// ============ ACTIVITY & ACHIEVEMENT TABLES ============

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


// ============ TABLE TYPES & ENUM HELPERS ============

// Enum helper exports for form and validation layers
export const userRoleValues = userRoleEnum.enumValues;
export type UserRole = (typeof userRoleValues)[number];

export const assistantGenderValues = assistantGenderEnum.enumValues;
export type AssistantGender = (typeof assistantGenderValues)[number];

export const assistantPersonaValues = assistantPersonaEnum.enumValues;
export type AssistantPersona = (typeof assistantPersonaValues)[number];

export const onboardingStepValues = onboardingStepEnum.enumValues;
export type OnboardingStep = (typeof onboardingStepValues)[number];

export const skillLevelValues = skillLevelEnum.enumValues;
export type SkillLevel = (typeof skillLevelValues)[number];

export const activityEventTypeValues = activityEventTypeEnum.enumValues;
export type ActivityEventType = (typeof activityEventTypeValues)[number];

export const achievementRarityValues = achievementRarityEnum.enumValues;
export type AchievementRarity = (typeof achievementRarityValues)[number];

export const difficultyValues = difficultyEnum.enumValues;
export type Difficulty = (typeof difficultyValues)[number];

export const dialogueRoleValues = ['assistant', 'user', 'system'] as const;
export type DialogueRole = (typeof dialogueRoleValues)[number];

// Table model helpers (select & insert)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

export type Assistant = typeof assistants.$inferSelect;
export type NewAssistant = typeof assistants.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

export type LessonSection = typeof lesson_sections.$inferSelect;
export type NewLessonSection = typeof lesson_sections.$inferInsert;

export type MusicTrack = typeof music_tracks.$inferSelect;
export type NewMusicTrack = typeof music_tracks.$inferInsert;

export type Dialogue = typeof dialogues.$inferSelect;
export type NewDialogue = typeof dialogues.$inferInsert;

export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;

export type UserThemeSetting = typeof user_theme_settings.$inferSelect;
export type NewUserThemeSetting = typeof user_theme_settings.$inferInsert;

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type QuizQuestion = typeof quiz_questions.$inferSelect;
export type NewQuizQuestion = typeof quiz_questions.$inferInsert;

export type QuizOption = typeof quiz_options.$inferSelect;
export type NewQuizOption = typeof quiz_options.$inferInsert;

export type Level = typeof levels.$inferSelect;
export type NewLevel = typeof levels.$inferInsert;

export type UserPreference = typeof user_preferences.$inferSelect;
export type NewUserPreference = typeof user_preferences.$inferInsert;

export type StudySetting = typeof study_settings.$inferSelect;
export type NewStudySetting = typeof study_settings.$inferInsert;

export type UserLessonProgress = typeof user_lesson_progress.$inferSelect;
export type NewUserLessonProgress = typeof user_lesson_progress.$inferInsert;

export type UserLessonSection = typeof user_lesson_sections.$inferSelect;
export type NewUserLessonSection = typeof user_lesson_sections.$inferInsert;

export type UserMusicTrack = typeof user_music_tracks.$inferSelect;
export type NewUserMusicTrack = typeof user_music_tracks.$inferInsert;

export type QuizAttempt = typeof quiz_attempts.$inferSelect;
export type NewQuizAttempt = typeof quiz_attempts.$inferInsert;

export type QuizAttemptAnswer = typeof quiz_attempt_answers.$inferSelect;
export type NewQuizAttemptAnswer = typeof quiz_attempt_answers.$inferInsert;

export type ActivityEvent = typeof activity_events.$inferSelect;
export type NewActivityEvent = typeof activity_events.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;

export type UserAchievement = typeof user_achievements.$inferSelect;
export type NewUserAchievement = typeof user_achievements.$inferInsert;


// ============ TABLE RELATIONSHIPS ============
// Defines how tables connect to each other

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

export const assistantsRelations = relations(assistants, ({ many }) => ({
  users: many(users),
  dialogues: many(dialogues),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  sections: many(lesson_sections),
  lessonProgress: many(user_lesson_progress),
  quizzes: many(quizzes),
  activityEvents: many(activity_events),
}));

export const musicTracksRelations = relations(music_tracks, ({ many }) => ({
  userMusicTracks: many(user_music_tracks),
}));

export const dialoguesRelations = relations(dialogues, ({ one }) => ({
  assistant: one(assistants, {
    fields: [dialogues.assistant_id],
    references: [assistants.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [quizzes.lesson_id],
    references: [lessons.id],
  }),
  quizQuestions: many(quiz_questions),
  quizAttempts: many(quiz_attempts),
  activityEvents: many(activity_events),
}));


export const studySettingsRelations = relations(study_settings, ({ one }) => ({
  user: one(users, {
    fields: [study_settings.user_id],
    references: [users.id],
  }),
}));

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

export const lessonSectionsRelations = relations(lesson_sections, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [lesson_sections.lesson_id],
    references: [lessons.id],
  }),
  userCompletions: many(user_lesson_sections),
  quizQuestions: many(quiz_questions),
}));

export const userLessonSectionsRelations = relations(user_lesson_sections, ({ one }) => ({
  user: one(users, {
    fields: [user_lesson_sections.user_id],
    references: [users.id],
  }),
  section: one(lesson_sections, {
    fields: [user_lesson_sections.section_id],
    references: [lesson_sections.id],
  }),
}));

export const userMusicTracksRelations = relations(user_music_tracks, ({ one }) => ({
  user: one(users, {
    fields: [user_music_tracks.user_id],
    references: [users.id],
  }),
  musicTrack: one(music_tracks, {
    fields: [user_music_tracks.music_track_id],
    references: [music_tracks.id],
  }),
}));

export const quizAttemptsRelations = relations(quiz_attempts, ({ one, many }) => ({
  user: one(users, {
    fields: [quiz_attempts.user_id],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quiz_attempts.quiz_id],
    references: [quizzes.id],
  }),
  answers: many(quiz_attempt_answers),
  activityEvents: many(activity_events),
}));


// Gamification relations

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

// Quiz detail relations

export const quizQuestionsRelations = relations(quiz_questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quiz_questions.quiz_id],
    references: [quizzes.id],
  }),
  sourceSection: one(lesson_sections, {
    fields: [quiz_questions.lesson_section_id],
    references: [lesson_sections.id],
  }),
  options: many(quiz_options),
  attemptAnswers: many(quiz_attempt_answers),
}));

export const quizOptionsRelations = relations(quiz_options, ({ one, many }) => ({
  question: one(quiz_questions, {
    fields: [quiz_options.question_id],
    references: [quiz_questions.id],
  }),
  selectedInAnswers: many(quiz_attempt_answers),
}));

export const quizAttemptAnswersRelations = relations(quiz_attempt_answers, ({ one }) => ({
  attempt: one(quiz_attempts, {
    fields: [quiz_attempt_answers.attempt_id],
    references: [quiz_attempts.id],
  }),
  question: one(quiz_questions, {
    fields: [quiz_attempt_answers.question_id],
    references: [quiz_questions.id],
  }),
  // Direct relationship to the single selected option
  selectedOption: one(quiz_options, {
    fields: [quiz_attempt_answers.selected_option_id],
    references: [quiz_options.id],
  }),
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

export const userPreferencesRelations = relations(user_preferences, ({ one }) => ({
  user: one(users, {
    fields: [user_preferences.user_id],
    references: [users.id],
  }),
}));

export const themesRelations = relations(themes, ({ many }) => ({
  userThemeSettings: many(user_theme_settings),
}));

export const userThemeSettingsRelations = relations(user_theme_settings, ({ one }) => ({
  user: one(users, {
    fields: [user_theme_settings.user_id],
    references: [users.id],
  }),
  theme: one(themes, {
    fields: [user_theme_settings.theme_id],
    references: [themes.id],
  }),
}));
