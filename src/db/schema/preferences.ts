/**
 * User Preferences & Settings Schema
 *
 * Contains all tables related to user customization, study settings,
 * theme preferences, and music selections.
 */

import {
  pgTable, serial, integer, varchar, boolean,
  primaryKey, timestamp, time
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { difficultyEnum } from './enums';
import { users } from './auth';
import { themes, music_tracks } from './lessons';

// ============ TABLES ============

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
  active_theme_id: integer('active_theme_id').references(() => themes.id, { onDelete: 'set null' }),
  wallpaper_url: varchar('wallpaper_url', { length: 500 }),
  low_motion: boolean('low_motion').notNull().default(false),
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

// ============ RELATIONS ============

export const userPreferencesRelations = relations(user_preferences, ({ one }) => ({
  user: one(users, {
    fields: [user_preferences.user_id],
    references: [users.id],
  }),
}));

export const userThemeSettingsRelations = relations(user_theme_settings, ({ one }) => ({
  user: one(users, {
    fields: [user_theme_settings.user_id],
    references: [users.id],
  }),
  theme: one(themes, {
    fields: [user_theme_settings.active_theme_id],
    references: [themes.id],
  }),
}));

export const studySettingsRelations = relations(study_settings, ({ one }) => ({
  user: one(users, {
    fields: [study_settings.user_id],
    references: [users.id],
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

// ============ TYPES ============

export type UserPreference = typeof user_preferences.$inferSelect;
export type NewUserPreference = typeof user_preferences.$inferInsert;

export type UserThemeSetting = typeof user_theme_settings.$inferSelect;
export type NewUserThemeSetting = typeof user_theme_settings.$inferInsert;

export type StudySetting = typeof study_settings.$inferSelect;
export type NewStudySetting = typeof study_settings.$inferInsert;

export type UserMusicTrack = typeof user_music_tracks.$inferSelect;
export type NewUserMusicTrack = typeof user_music_tracks.$inferInsert;
