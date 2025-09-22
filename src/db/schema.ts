/**
 * This file tells Drizzle and the database exactly what data we can store.
 * Drizzle uses these definitions to provide type safety
 * when querying and manipulating data in our application.
 */

import { pgTable, serial, varchar, text, integer, decimal, boolean, json, primaryKey, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const assistantGenderEnum = pgEnum('assistant_gender', ['feminine', 'masculine', 'androgynous']);

export const assistantPersonaEnum = pgEnum('assistant_persona', ['calm', 'kind', 'direct']);

export const onboardingStepEnum = pgEnum('onboarding_step', ['welcome', 'gender', 'persona', 'guided_intro']);

export const users = pgTable('users', {
  id: serial('user_id').primaryKey(),
  name: varchar('username', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: boolean('is_email_verified').notNull().default(false),
  emailVerifiedAt: timestamp('email_verified_at'),
  image: varchar('image', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  assistantId: integer('assistant_id').references(() => assistants.id),
  assistantPersona: assistantPersonaEnum('assistant_persona'),
  onboardingCompletedAt: timestamp('onboarding_completed_at'),
  onboardingStep: onboardingStepEnum('onboarding_step'),
});

// Authentication tables
export const account = pgTable('account', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`gen_random_uuid()::varchar(255)`),
  userId: integer('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 64 }).notNull(),

  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),

  password: varchar('password', { length: 255 }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  uniqueIndex('account_provider_account').on(table.providerId, table.accountId),
]);

export const session = pgTable('session', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`gen_random_uuid()::varchar(255)`),
  userId: integer('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 64 }),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const verification = pgTable('verification', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`gen_random_uuid()::varchar(255)`),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const assistants = pgTable('assistants', {
  id: serial('assistant_id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 64 }).notNull(),
  gender: assistantGenderEnum('gender'),
  avatarPng: varchar('avatar_png', { length: 500 }),
  tagline: varchar('tagline', { length: 160 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  uniqueIndex('assistants_slug_key').on(table.slug),
]);

export const lessons = pgTable('lessons', {
  id: serial('lesson_id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  difficulty: varchar('difficulty', { length: 50 }),
  hint: text('hint'),
  correctAnswer: text('correct_answer'),
  assistantId: integer('assistant_id').references(() => assistants.id),
});

export const music = pgTable('music', {
  id: serial('music_id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }),
  duration: integer('duration'),
  fileUrl: varchar('file_url', { length: 500 }),
  volume: decimal('volume', { precision: 3, scale: 2 }),
});

export const dialogues = pgTable('dialogues', {
  id: serial('dialogue_id').primaryKey(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }),
  assistantId: integer('assistant_id').references(() => assistants.id),
});

export const dashboards = pgTable('dashboards', {
  id: serial('dashboard_id').primaryKey(),
  theme: varchar('theme', { length: 100 }),
  custom: json('custom'),
  userId: integer('user_id').unique().references(() => users.id),
});

export const quizzes = pgTable('quizzes', {
  id: serial('quiz_id').primaryKey(),
  topic: varchar('topic', { length: 255 }),
  difficulty: varchar('difficulty', { length: 50 }),
  timeLimit: integer('time_limit'),
});

export const leaderboards = pgTable('leaderboards', {
  id: serial('leaderboard_id').primaryKey(),
  rank: integer('rank'),
  totalPoints: integer('total_points'),
});

export const studyModes = pgTable('study_modes', {
  id: serial('study_mode_id').primaryKey(),
  background: varchar('background', { length: 255 }),
  mentorVisibility: boolean('mentor_visibility'),
  backgroundAmbience: varchar('background_ambience', { length: 255 }),
  userId: integer('user_id').unique().references(() => users.id),
});

export const progress = pgTable('progress', {
  id: serial('progress_id').primaryKey(),
  status: varchar('status', { length: 50 }),
  score: integer('score'),
});

export const userPlaysMusic = pgTable('user_plays_music', {
  userId: integer('user_id').notNull().references(() => users.id),
  musicId: integer('music_id').notNull().references(() => music.id),
}, (table) => [
  primaryKey({ columns: [table.userId, table.musicId] }),
]);

export const userTakesQuiz = pgTable('user_takes_quiz', {
  userId: integer('user_id').notNull().references(() => users.id),
  quizId: integer('quiz_id').notNull().references(() => quizzes.id),
}, (table) => [
  primaryKey({ columns: [table.userId, table.quizId] }),
]);

export const userParticipatesLeaderboard = pgTable('user_participates_leaderboard', {
  userId: integer('user_id').notNull().references(() => users.id),
  leaderboardId: integer('leaderboard_id').notNull().references(() => leaderboards.id),
}, (table) => [
  primaryKey({ columns: [table.userId, table.leaderboardId] }),
]);

export const userTracksProgress = pgTable('user_tracks_progress', {
  userId: integer('user_id').notNull().references(() => users.id),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id),
  progressId: integer('progress_id').unique().notNull().references(() => progress.id),
}, (table) => [
  primaryKey({ columns: [table.userId, table.lessonId] }),
]);

export const usersRelations = relations(users, ({ one, many }) => ({
  assistant: one(assistants, {
    fields: [users.assistantId],
    references: [assistants.id],
  }),
  dashboard: one(dashboards, {
    fields: [users.id],
    references: [dashboards.userId],
  }),
  studyMode: one(studyModes, {
    fields: [users.id],
    references: [studyModes.userId],
  }),
  accounts: many(account),
  sessions: many(session),
  userPlaysMusic: many(userPlaysMusic),
  userTakesQuiz: many(userTakesQuiz),
  userParticipatesLeaderboard: many(userParticipatesLeaderboard),
  userTracksProgress: many(userTracksProgress),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, {
    fields: [session.userId],
    references: [users.id],
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
    references: [assistants.id],
  }),
  userTracksProgress: many(userTracksProgress),
}));

export const musicRelations = relations(music, ({ many }) => ({
  userPlaysMusic: many(userPlaysMusic),
}));

export const dialoguesRelations = relations(dialogues, ({ one }) => ({
  assistant: one(assistants, {
    fields: [dialogues.assistantId],
    references: [assistants.id],
  }),
}));

export const dashboardsRelations = relations(dashboards, ({ one }) => ({
  user: one(users, {
    fields: [dashboards.userId],
    references: [users.id],
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
    references: [users.id],
  }),
}));

export const progressRelations = relations(progress, ({ many }) => ({
  userTracksProgress: many(userTracksProgress),
}));

export const userPlaysMusicRelations = relations(userPlaysMusic, ({ one }) => ({
  user: one(users, {
    fields: [userPlaysMusic.userId],
    references: [users.id],
  }),
  music: one(music, {
    fields: [userPlaysMusic.musicId],
    references: [music.id],
  }),
}));

export const userTakesQuizRelations = relations(userTakesQuiz, ({ one }) => ({
  user: one(users, {
    fields: [userTakesQuiz.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [userTakesQuiz.quizId],
    references: [quizzes.id],
  }),
}));

export const userParticipatesLeaderboardRelations = relations(userParticipatesLeaderboard, ({ one }) => ({
  user: one(users, {
    fields: [userParticipatesLeaderboard.userId],
    references: [users.id],
  }),
  leaderboard: one(leaderboards, {
    fields: [userParticipatesLeaderboard.leaderboardId],
    references: [leaderboards.id],
  }),
}));

export const userTracksProgressRelations = relations(userTracksProgress, ({ one }) => ({
  user: one(users, {
    fields: [userTracksProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userTracksProgress.lessonId],
    references: [lessons.id],
  }),
  progress: one(progress, {
    fields: [userTracksProgress.progressId],
    references: [progress.id],
  }),
}));
