/**
 * User Profile Schema
 *
 * Contains all tables related to user portfolio profiles, including
 * profile information, projects, experiences, and theme customization.
 */

import {
  pgTable, serial, integer, varchar, text, boolean,
  timestamp, date, uniqueIndex, index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

// ============ TABLES ============

/**
 * User Profiles Table - Stores basic portfolio profile fields for each user
 *
 * WHEN CREATED: User creates their profile
 * WHEN UPDATED: User updates profile information
 * USED BY: Public profile pages, profile management
 */
export const user_profiles = pgTable('user_profiles', {
  user_id: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  handle: varchar('handle', { length: 100 }).notNull().unique(),
  display_name: varchar('display_name', { length: 255 }),
  tagline: varchar('tagline', { length: 255 }),
  bio: text('bio'),
  avatar_url: text('avatar_url'),
  website_url: text('website_url'),
  github_url: text('github_url'),
  linkedin_url: text('linkedin_url'),
  x_url: text('x_url'),
  is_public: boolean('is_public').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('uq_user_profiles_handle').on(table.handle),
]);

/**
 * User Projects Table - Portfolio projects that show up on a user's profile
 *
 * WHEN CREATED: User adds a project
 * WHEN UPDATED: User updates project information
 * WHEN DELETED: User removes a project
 * USED BY: Public profile pages, project management
 */
export const user_projects = pgTable('user_projects', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  tech_stack: text('tech_stack'),
  link_url: text('link_url'),
  order_index: integer('order_index').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_user_projects_user_order').on(table.user_id, table.order_index),
]);

/**
 * User Experiences Table - Work/learning experiences to show on the profile
 *
 * WHEN CREATED: User adds an experience
 * WHEN UPDATED: User updates experience information
 * WHEN DELETED: User removes an experience
 * USED BY: Public profile pages, experience management
 */
export const user_experiences = pgTable('user_experiences', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 255 }).notNull(),
  organization: varchar('organization', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  start_date: date('start_date'),
  end_date: date('end_date'),
  is_current: boolean('is_current').notNull().default(false),
  description: text('description'),
  order_index: integer('order_index').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_user_experiences_user_order').on(table.user_id, table.order_index),
]);

/**
 * User Profile Themes Table - Stores customization options for the user's public profile page
 *
 * WHEN CREATED: User customizes their profile theme
 * WHEN UPDATED: User updates theme preferences
 * USED BY: Public profile page rendering
 */
export const user_profile_themes = pgTable('user_profile_themes', {
  user_id: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  layout_style: varchar('layout_style', { length: 50 }).notNull().default('classic'),
  accent_color: varchar('accent_color', { length: 50 }),
  background_image_url: text('background_image_url'),
  background_pattern: varchar('background_pattern', { length: 100 }),
  font_style: varchar('font_style', { length: 50 }),
  show_assistant: boolean('show_assistant').notNull().default(true),
  show_music_player: boolean('show_music_player').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============ RELATIONS ============

export const userProfilesRelations = relations(user_profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [user_profiles.user_id],
    references: [users.id],
  }),
  projects: many(user_projects),
  experiences: many(user_experiences),
  theme: one(user_profile_themes, {
    fields: [user_profiles.user_id],
    references: [user_profile_themes.user_id],
  }),
}));

export const userProjectsRelations = relations(user_projects, ({ one }) => ({
  user: one(users, {
    fields: [user_projects.user_id],
    references: [users.id],
  }),
  profile: one(user_profiles, {
    fields: [user_projects.user_id],
    references: [user_profiles.user_id],
  }),
}));

export const userExperiencesRelations = relations(user_experiences, ({ one }) => ({
  user: one(users, {
    fields: [user_experiences.user_id],
    references: [users.id],
  }),
  profile: one(user_profiles, {
    fields: [user_experiences.user_id],
    references: [user_profiles.user_id],
  }),
}));

export const userProfileThemesRelations = relations(user_profile_themes, ({ one }) => ({
  user: one(users, {
    fields: [user_profile_themes.user_id],
    references: [users.id],
  }),
  profile: one(user_profiles, {
    fields: [user_profile_themes.user_id],
    references: [user_profiles.user_id],
  }),
}));

// ============ TYPES ============

export type UserProfile = typeof user_profiles.$inferSelect;
export type NewUserProfile = typeof user_profiles.$inferInsert;

export type UserProject = typeof user_projects.$inferSelect;
export type NewUserProject = typeof user_projects.$inferInsert;

export type UserExperience = typeof user_experiences.$inferSelect;
export type NewUserExperience = typeof user_experiences.$inferInsert;

export type UserProfileTheme = typeof user_profile_themes.$inferSelect;
export type NewUserProfileTheme = typeof user_profile_themes.$inferInsert;

