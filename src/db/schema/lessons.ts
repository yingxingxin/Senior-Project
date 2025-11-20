/**
 * Learning Content & Resources Schema
 *
 * Contains all tables related to assistants, lessons, dialogues, music,
 * and themes.
 */

import {
  pgTable, serial, varchar, text, integer, real,
  timestamp, pgEnum, uniqueIndex, index, check, primaryKey, boolean,
  type AnyPgColumn, jsonb
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { difficultyEnum } from './enums';
import { user_lesson_progress, activity_events } from './progress';
import { users } from './auth';
import { quizzes, quiz_questions } from './quizzes';
import { user_music_tracks, user_theme_settings } from './preferences';

// ============ ENUMS ============

export const assistantGenderEnum = pgEnum('assistant_gender', ['feminine', 'masculine', 'androgynous']);

// ============ TABLES ============

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

  // Hierarchy: parent_lesson_id NULL = top-level course, otherwise topic within a course
  // Foreign key constraint defined in migration for self-referential relationship
  parent_lesson_id: integer('parent_lesson_id'),

  // Ordering within parent
  order_index: integer('order_index').notNull().default(0),
  icon: varchar('icon', { length: 10 }),
  is_published: boolean('is_published').notNull().default(true),

  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex('uq_lessons__slug').on(t.slug),
  index('ix_lessons__parent').on(t.parent_lesson_id),
  uniqueIndex('uq_lessons__parent_order').on(t.parent_lesson_id, t.order_index),
]);

/**
 * Lesson Sections Table - Breaks lessons into ordered, addressable sections with rich Tiptap JSON content for granular progress tracking
 *
 * WHEN CREATED: Content creation/lesson structuring
 * WHEN UPDATED: Content edits (body_json, title)
 * USED BY: Lesson display, progress tracking, deep linking
 *
 * USER STORIES SUPPORTED:
 *   - F20-US01/02: Granular progress tracking at section level
 *   - F09-US01/02: Deep links to specific sections for re-explanation
 *   - Modular content management
 *   - Section-level resume functionality
 *
 * CONTENT FORMAT:
 *   - body_md: Legacy markdown content (being migrated to body_json)
 *   - body_json: Tiptap JSON document with rich formatting (headings, lists, callouts, code blocks)
 *   - Supports custom nodes: callout boxes, enhanced code blocks, inline quizzes (future)
 *   - Server-side rendered to HTML for performance and SEO
 *
 * MIGRATION STRATEGY:
 *   - Temporarily both fields exist during migration
 *   - Migration script converts body_md → body_json
 *   - After migration complete, body_md will be dropped
 */
export const lesson_sections = pgTable('lesson_sections', {
  id: serial('id').primaryKey(),
  lesson_id: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  order_index: integer('order_index').notNull().default(0),
  slug: varchar('slug', { length: 64 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body_md: text('body_md').notNull(), // Legacy - will be dropped after migration
  body_json: jsonb('body_json'), // New format - nullable during migration, NOT NULL after
}, (t) => [
  uniqueIndex('uq_lesson_sections__lesson_order').on(t.lesson_id, t.order_index),
  uniqueIndex('uq_lesson_sections__lesson_slug').on(t.lesson_id, t.slug),
  index('ix_lesson_sections__lesson').on(t.lesson_id),
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
  primaryKey({ columns: [t.user_id, t.section_id] }),
  index('ix_user_lesson_sections__user').on(t.user_id),
  index('ix_user_lesson_sections__section').on(t.section_id),
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
 *
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
  // Original fields (kept for backward compatibility)
  radius: varchar('radius', { length: 8 }),
  font: varchar('font', { length: 64 }),
  primary: varchar('primary', { length: 32 }),
  secondary: varchar('secondary', { length: 32 }),
  accent: varchar('accent', { length: 32 }),
  // Extended color fields (kept for backward compatibility)
  base_bg: varchar('base_bg', { length: 32 }),
  base_fg: varchar('base_fg', { length: 32 }),
  card_bg: varchar('card_bg', { length: 32 }),
  card_fg: varchar('card_fg', { length: 32 }),
  popover_bg: varchar('popover_bg', { length: 32 }),
  popover_fg: varchar('popover_fg', { length: 32 }),
  muted_bg: varchar('muted_bg', { length: 32 }),
  muted_fg: varchar('muted_fg', { length: 32 }),
  destructive_bg: varchar('destructive_bg', { length: 32 }),
  destructive_fg: varchar('destructive_fg', { length: 32 }),
  // Light mode color variants
  primary_light: varchar('primary_light', { length: 32 }),
  secondary_light: varchar('secondary_light', { length: 32 }),
  accent_light: varchar('accent_light', { length: 32 }),
  base_bg_light: varchar('base_bg_light', { length: 32 }),
  base_fg_light: varchar('base_fg_light', { length: 32 }),
  card_bg_light: varchar('card_bg_light', { length: 32 }),
  card_fg_light: varchar('card_fg_light', { length: 32 }),
  popover_bg_light: varchar('popover_bg_light', { length: 32 }),
  popover_fg_light: varchar('popover_fg_light', { length: 32 }),
  muted_bg_light: varchar('muted_bg_light', { length: 32 }),
  muted_fg_light: varchar('muted_fg_light', { length: 32 }),
  destructive_bg_light: varchar('destructive_bg_light', { length: 32 }),
  destructive_fg_light: varchar('destructive_fg_light', { length: 32 }),
  // Dark mode color variants
  primary_dark: varchar('primary_dark', { length: 32 }),
  secondary_dark: varchar('secondary_dark', { length: 32 }),
  accent_dark: varchar('accent_dark', { length: 32 }),
  base_bg_dark: varchar('base_bg_dark', { length: 32 }),
  base_fg_dark: varchar('base_fg_dark', { length: 32 }),
  card_bg_dark: varchar('card_bg_dark', { length: 32 }),
  card_fg_dark: varchar('card_fg_dark', { length: 32 }),
  popover_bg_dark: varchar('popover_bg_dark', { length: 32 }),
  popover_fg_dark: varchar('popover_fg_dark', { length: 32 }),
  muted_bg_dark: varchar('muted_bg_dark', { length: 32 }),
  muted_fg_dark: varchar('muted_fg_dark', { length: 32 }),
  destructive_bg_dark: varchar('destructive_bg_dark', { length: 32 }),
  destructive_fg_dark: varchar('destructive_fg_dark', { length: 32 }),
  // Typography fields
  font_sans: varchar('font_sans', { length: 128 }),
  font_serif: varchar('font_serif', { length: 128 }),
  font_mono: varchar('font_mono', { length: 128 }),
  letter_spacing: real('letter_spacing'),
  // Advanced styling
  hue_shift: integer('hue_shift').default(0),
  saturation_adjust: integer('saturation_adjust').default(0),
  lightness_adjust: integer('lightness_adjust').default(0),
  spacing_scale: real('spacing_scale').default(1),
  shadow_strength: varchar('shadow_strength', { length: 16 }).default('medium'),
  // Metadata
  is_dark_mode: boolean('is_dark_mode').default(false), // Kept for backward compatibility
  supports_both_modes: boolean('supports_both_modes').default(false), // New unified format flag
  parent_theme_id: integer('parent_theme_id').references((): AnyPgColumn => themes.id),
  user_id: integer('user_id').references(() => users.id),
  is_built_in: boolean('is_built_in').default(false),
}, (t) => [
  uniqueIndex('uq_themes__slug').on(t.slug),
]);

export const userThemeSettings = pgTable('user_theme_settings', {
  user_id: integer('user_id').primaryKey().references(() => users.id),
  active_theme_id: integer('active_theme_id').references(() => themes.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ============ RELATIONS ============

export const assistantsRelations = relations(assistants, ({ many }) => ({
  // Note: users relation defined in auth.ts
  dialogues: many(dialogues),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  sections: many(lesson_sections),
  lessonProgress: many(user_lesson_progress),
  quizzes: many(quizzes),
  activityEvents: many(activity_events),
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

export const musicTracksRelations = relations(music_tracks, ({ many }) => ({
  userMusicTracks: many(user_music_tracks),
}));

export const dialoguesRelations = relations(dialogues, ({ one }) => ({
  assistant: one(assistants, {
    fields: [dialogues.assistant_id],
    references: [assistants.id],
  }),
}));

export const themesRelations = relations(themes, ({ many }) => ({
  userThemeSettings: many(user_theme_settings),
}));

// ============ TYPES ============

export type Assistant = typeof assistants.$inferSelect;
export type NewAssistant = typeof assistants.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

export type LessonSection = typeof lesson_sections.$inferSelect;
export type NewLessonSection = typeof lesson_sections.$inferInsert;

export type UserLessonSection = typeof user_lesson_sections.$inferSelect;
export type NewUserLessonSection = typeof user_lesson_sections.$inferInsert;

export type MusicTrack = typeof music_tracks.$inferSelect;
export type NewMusicTrack = typeof music_tracks.$inferInsert;

export type Dialogue = typeof dialogues.$inferSelect;
export type NewDialogue = typeof dialogues.$inferInsert;

export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;

// ============ ENUM HELPERS ============

export const assistantGenderValues = assistantGenderEnum.enumValues;
export type AssistantGender = (typeof assistantGenderValues)[number];

export const dialogueRoleValues = ['assistant', 'user', 'system'] as const;
export type DialogueRole = (typeof dialogueRoleValues)[number];
