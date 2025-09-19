/**
 * This file tells Drizzle and the database exactly what data we can store.
 * Drizzle uses these definitions to provide type safety
 * when querying and manipulating data in our application.
 */

import { pgTable, serial, varchar, text, integer, decimal, boolean, json, primaryKey, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Token type enum for different authentication token purposes
export const tokenTypeEnum = pgEnum('token_type', ['password_reset', 'email_verification']);

export const users = pgTable('users', {
  userId: serial('user_id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  emailVerifiedAt: timestamp('email_verified_at'),
  assistantId: integer('assistant_id').references(() => assistants.assistantId),
});

// Generic auth tokens table for password resets, email verification, etc.
export const authTokens = pgTable('auth_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.userId),
  token: varchar('token', { length: 255 }).notNull().unique(),
  tokenType: tokenTypeEnum('token_type').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
});

export const assistants = pgTable('assistants', {
  assistantId: serial('assistant_id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  gender: varchar('gender', { length: 50 }),
  avatarPng: varchar('avatar_png', { length: 500 }),
  personality: text('personality'),
});

export const lessons = pgTable('lessons', {
  lessonId: serial('lesson_id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  difficulty: varchar('difficulty', { length: 50 }),
  hint: text('hint'),
  correctAnswer: text('correct_answer'),
  assistantId: integer('assistant_id').references(() => assistants.assistantId),
});

export const music = pgTable('music', {
  musicId: serial('music_id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }),
  duration: integer('duration'),
  fileUrl: varchar('file_url', { length: 500 }),
  volume: decimal('volume', { precision: 3, scale: 2 }),
});

export const dialogues = pgTable('dialogues', {
  dialogueId: serial('dialogue_id').primaryKey(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }),
  assistantId: integer('assistant_id').references(() => assistants.assistantId),
});

export const dashboards = pgTable('dashboards', {
  dashboardId: serial('dashboard_id').primaryKey(),
  theme: varchar('theme', { length: 100 }),
  custom: json('custom'),
  userId: integer('user_id').unique().references(() => users.userId),
});

export const quizzes = pgTable('quizzes', {
  quizId: serial('quiz_id').primaryKey(),
  topic: varchar('topic', { length: 255 }),
  difficulty: varchar('difficulty', { length: 50 }),
  timeLimit: integer('time_limit'),
});

export const leaderboards = pgTable('leaderboards', {
  leaderboardId: serial('leaderboard_id').primaryKey(),
  rank: integer('rank'),
  totalPoints: integer('total_points'),
});

export const studyModes = pgTable('study_modes', {
  studyModeId: serial('study_mode_id').primaryKey(),
  background: varchar('background', { length: 255 }),
  mentorVisibility: boolean('mentor_visibility'),
  backgroundAmbience: varchar('background_ambience', { length: 255 }),
  userId: integer('user_id').unique().references(() => users.userId),
});

export const progress = pgTable('progress', {
  progressId: serial('progress_id').primaryKey(),
  status: varchar('status', { length: 50 }),
  score: integer('score'),
});

export const userPlaysMusic = pgTable('user_plays_music', {
  userId: integer('user_id').notNull().references(() => users.userId),
  musicId: integer('music_id').notNull().references(() => music.musicId),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.musicId] }),
}));

export const userTakesQuiz = pgTable('user_takes_quiz', {
  userId: integer('user_id').notNull().references(() => users.userId),
  quizId: integer('quiz_id').notNull().references(() => quizzes.quizId),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.quizId] }),
}));

export const userParticipatesLeaderboard = pgTable('user_participates_leaderboard', {
  userId: integer('user_id').notNull().references(() => users.userId),
  leaderboardId: integer('leaderboard_id').notNull().references(() => leaderboards.leaderboardId),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.leaderboardId] }),
}));

export const userTracksProgress = pgTable('user_tracks_progress', {
  userId: integer('user_id').notNull().references(() => users.userId),
  lessonId: integer('lesson_id').notNull().references(() => lessons.lessonId),
  progressId: integer('progress_id').unique().notNull().references(() => progress.progressId),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.lessonId] }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  assistant: one(assistants, {
    fields: [users.assistantId],
    references: [assistants.assistantId],
  }),
  dashboard: one(dashboards, {
    fields: [users.userId],
    references: [dashboards.userId],
  }),
  studyMode: one(studyModes, {
    fields: [users.userId],
    references: [studyModes.userId],
  }),
  authTokens: many(authTokens),
  userPlaysMusic: many(userPlaysMusic),
  userTakesQuiz: many(userTakesQuiz),
  userParticipatesLeaderboard: many(userParticipatesLeaderboard),
  userTracksProgress: many(userTracksProgress),
}));

export const authTokensRelations = relations(authTokens, ({ one }) => ({
  user: one(users, {
    fields: [authTokens.userId],
    references: [users.userId],
  }),
}));

export const assistantsRelations = relations(assistants, ({ many }) => ({
  users: many(users),
  lessons: many(lessons),
  dialogues: many(dialogues),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  assistant: one(assistants, {
    fields: [lessons.assistantId],
    references: [assistants.assistantId],
  }),
  userTracksProgress: many(userTracksProgress),
}));

export const musicRelations = relations(music, ({ many }) => ({
  userPlaysMusic: many(userPlaysMusic),
}));

export const dialoguesRelations = relations(dialogues, ({ one }) => ({
  assistant: one(assistants, {
    fields: [dialogues.assistantId],
    references: [assistants.assistantId],
  }),
}));

export const dashboardsRelations = relations(dashboards, ({ one }) => ({
  user: one(users, {
    fields: [dashboards.userId],
    references: [users.userId],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  userTakesQuiz: many(userTakesQuiz),
}));

export const leaderboardsRelations = relations(leaderboards, ({ many }) => ({
  userParticipatesLeaderboard: many(userParticipatesLeaderboard),
}));

export const studyModesRelations = relations(studyModes, ({ one }) => ({
  user: one(users, {
    fields: [studyModes.userId],
    references: [users.userId],
  }),
}));

export const progressRelations = relations(progress, ({ many }) => ({
  userTracksProgress: many(userTracksProgress),
}));

export const userPlaysMusicRelations = relations(userPlaysMusic, ({ one }) => ({
  user: one(users, {
    fields: [userPlaysMusic.userId],
    references: [users.userId],
  }),
  music: one(music, {
    fields: [userPlaysMusic.musicId],
    references: [music.musicId],
  }),
}));

export const userTakesQuizRelations = relations(userTakesQuiz, ({ one }) => ({
  user: one(users, {
    fields: [userTakesQuiz.userId],
    references: [users.userId],
  }),
  quiz: one(quizzes, {
    fields: [userTakesQuiz.quizId],
    references: [quizzes.quizId],
  }),
}));

export const userParticipatesLeaderboardRelations = relations(userParticipatesLeaderboard, ({ one }) => ({
  user: one(users, {
    fields: [userParticipatesLeaderboard.userId],
    references: [users.userId],
  }),
  leaderboard: one(leaderboards, {
    fields: [userParticipatesLeaderboard.leaderboardId],
    references: [leaderboards.leaderboardId],
  }),
}));

export const userTracksProgressRelations = relations(userTracksProgress, ({ one }) => ({
  user: one(users, {
    fields: [userTracksProgress.userId],
    references: [users.userId],
  }),
  lesson: one(lessons, {
    fields: [userTracksProgress.lessonId],
    references: [lessons.lessonId],
  }),
  progress: one(progress, {
    fields: [userTracksProgress.progressId],
    references: [progress.progressId],
  }),
}));
