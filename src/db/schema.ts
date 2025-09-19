/**
 * This file tells Drizzle and the database exactly what data we can store.
 * Drizzle uses these definitions to provide type safety
 * when querying and manipulating data in our application.
 */

import { pgTable, serial, varchar, text, integer, decimal, boolean, json, primaryKey, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ========== ENUMS ==========
export const tokenTypeEnum = pgEnum('token_type', ['password_reset', 'email_verification']);
export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'intermediate', 'advanced']);
export const personalityTypeEnum = pgEnum('personality_type', ['nice', 'stern', 'neutral']);
export const questionTypeEnum = pgEnum('question_type', ['fill_in_blank', 'multiple_choice', 'coding_challenge']);

// ========== CORE TABLES ==========

// Users table with learning platform features
export const users = pgTable('users', {
    userId: serial('user_id').primaryKey(),
    username: varchar('username', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    isEmailVerified: boolean('is_email_verified').notNull().default(false),
    emailVerifiedAt: timestamp('email_verified_at'),
    skillLevel: skillLevelEnum('skill_level'),
    hasCompletedAssessment: boolean('has_completed_assessment').default(false),
    assistantId: integer('assistant_id').references(() => assistants.assistantId),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Authentication tokens for password resets, email verification, etc.
export const authTokens = pgTable('auth_tokens', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.userId),
    token: varchar('token', { length: 255 }).notNull().unique(),
    tokenType: tokenTypeEnum('token_type').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
});

// AI Assistants with personality types
export const assistants = pgTable('assistants', {
    assistantId: serial('assistant_id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    personality: personalityTypeEnum('personality').notNull(),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    description: text('description'),
    isActive: boolean('is_active').default(true),
});

// Programming languages for future expansion
export const programmingLanguages = pgTable('programming_languages', {
    languageId: serial('language_id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull(), // Python, JavaScript, etc.
    isActive: boolean('is_active').default(true),
    description: text('description'),
});

// Lessons with Python-focused content
export const lessons = pgTable('lessons', {
    lessonId: serial('lesson_id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    content: text('content'),
    skillLevel: skillLevelEnum('skill_level').notNull(),
    questionType: questionTypeEnum('question_type').notNull(),
    pythonCode: text('python_code'), // For coding challenges
    expectedOutput: text('expected_output'), // For coding challenges
    hint: text('hint'),
    correctAnswer: text('correct_answer'),
    options: json('options'), // For multiple choice questions
    orderIndex: integer('order_index').notNull(),
    languageId: integer('language_id').notNull().references(() => programmingLanguages.languageId),
    assistantId: integer('assistant_id').references(() => assistants.assistantId),
    isActive: boolean('is_active').default(true),
});

// Assessment questions for skill evaluation
export const assessmentQuestions = pgTable('assessment_questions', {
    questionId: serial('question_id').primaryKey(),
    question: text('question').notNull(),
    options: json('options').notNull(),
    correctAnswer: varchar('correct_answer', { length: 1 }).notNull(),
    skillLevel: skillLevelEnum('skill_level').notNull(),
    languageId: integer('language_id').notNull().references(() => programmingLanguages.languageId),
    isActive: boolean('is_active').default(true),
});

// User assessment results
export const userAssessmentResults = pgTable('user_assessment_results', {
    resultId: serial('result_id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.userId),
    skillLevel: skillLevelEnum('skill_level').notNull(),
    score: integer('score').notNull(),
    totalQuestions: integer('total_questions').notNull(),
    languageId: integer('language_id').notNull().references(() => programmingLanguages.languageId),
    completedAt: timestamp('completed_at').notNull().defaultNow(),
});

// ========== GAMIFICATION & PROGRESS ==========

export const progress = pgTable('progress', {
    progressId: serial('progress_id').primaryKey(),
    status: varchar('status', { length: 50 }).notNull(), // 'completed', 'in_progress', 'failed'
    score: integer('score'),
    completedAt: timestamp('completed_at'),
    attempts: integer('attempts').default(1),
});

export const quizzes = pgTable('quizzes', {
    quizId: serial('quiz_id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    skillLevel: skillLevelEnum('skill_level').notNull(),
    languageId: integer('language_id').notNull().references(() => programmingLanguages.languageId),
    timeLimit: integer('time_limit'), // in minutes
    isActive: boolean('is_active').default(true),
});

export const leaderboards = pgTable('leaderboards', {
    leaderboardId: serial('leaderboard_id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.userId),
    totalPoints: integer('total_points').default(0),
    rank: integer('rank'),
    languageId: integer('language_id').references(() => programmingLanguages.languageId),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ========== USER PREFERENCES ==========

export const dashboards = pgTable('dashboards', {
    dashboardId: serial('dashboard_id').primaryKey(),
    theme: varchar('theme', { length: 100 }).default('dark'),
    custom: json('custom'),
    userId: integer('user_id').unique().notNull().references(() => users.userId),
});

export const studyModes = pgTable('study_modes', {
    studyModeId: serial('study_mode_id').primaryKey(),
    background: varchar('background', { length: 255 }).default('default'),
    mentorVisibility: boolean('mentor_visibility').default(true),
    backgroundAmbience: varchar('background_ambience', { length: 255 }),
    userId: integer('user_id').unique().notNull().references(() => users.userId),
});

export const music = pgTable('music', {
    musicId: serial('music_id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    artist: varchar('artist', { length: 255 }),
    duration: integer('duration'), // in seconds
    fileUrl: varchar('file_url', { length: 500 }),
    volume: decimal('volume', { precision: 3, scale: 2 }).default('0.50'),
    isActive: boolean('is_active').default(true),
});

// ========== AI & INTERACTIONS ==========

export const dialogues = pgTable('dialogues', {
    dialogueId: serial('dialogue_id').primaryKey(),
    message: text('message').notNull(),
    type: varchar('type', { length: 50 }), // 'hint', 'encouragement', 'correction', etc.
    context: varchar('context', { length: 100 }), // 'lesson', 'quiz', 'assessment'
    assistantId: integer('assistant_id').references(() => assistants.assistantId),
    lessonId: integer('lesson_id').references(() => lessons.lessonId),
    isActive: boolean('is_active').default(true),
});

// ========== JUNCTION TABLES ==========

export const userPlaysMusic = pgTable('user_plays_music', {
    userId: integer('user_id').notNull().references(() => users.userId),
    musicId: integer('music_id').notNull().references(() => music.musicId),
    playedAt: timestamp('played_at').defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.musicId] }),
}));

export const userTakesQuiz = pgTable('user_takes_quiz', {
    userId: integer('user_id').notNull().references(() => users.userId),
    quizId: integer('quiz_id').notNull().references(() => quizzes.quizId),
    score: integer('score'),
    completedAt: timestamp('completed_at'),
    attempts: integer('attempts').default(1),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.quizId] }),
}));

export const userTracksProgress = pgTable('user_tracks_progress', {
    userId: integer('user_id').notNull().references(() => users.userId),
    lessonId: integer('lesson_id').notNull().references(() => lessons.lessonId),
    progressId: integer('progress_id').notNull().references(() => progress.progressId),
    startedAt: timestamp('started_at').defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.lessonId] }),
}));

// ========== RELATIONS ==========

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
    assessmentResults: many(userAssessmentResults),
    userPlaysMusic: many(userPlaysMusic),
    userTakesQuiz: many(userTakesQuiz),
    userTracksProgress: many(userTracksProgress),
    leaderboardEntries: many(leaderboards),
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

export const programmingLanguagesRelations = relations(programmingLanguages, ({ many }) => ({
    lessons: many(lessons),
    assessmentQuestions: many(assessmentQuestions),
    assessmentResults: many(userAssessmentResults),
    quizzes: many(quizzes),
    leaderboards: many(leaderboards),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    assistant: one(assistants, {
        fields: [lessons.assistantId],
        references: [assistants.assistantId],
    }),
    language: one(programmingLanguages, {
        fields: [lessons.languageId],
        references: [programmingLanguages.languageId],
    }),
    userTracksProgress: many(userTracksProgress),
    dialogues: many(dialogues),
}));

export const assessmentQuestionsRelations = relations(assessmentQuestions, ({ one }) => ({
    language: one(programmingLanguages, {
        fields: [assessmentQuestions.languageId],
        references: [programmingLanguages.languageId],
    }),
}));

export const userAssessmentResultsRelations = relations(userAssessmentResults, ({ one }) => ({
    user: one(users, {
        fields: [userAssessmentResults.userId],
        references: [users.userId],
    }),
    language: one(programmingLanguages, {
        fields: [userAssessmentResults.languageId],
        references: [programmingLanguages.languageId],
    }),
}));

export const progressRelations = relations(progress, ({ many }) => ({
    userTracksProgress: many(userTracksProgress),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
    language: one(programmingLanguages, {
        fields: [quizzes.languageId],
        references: [programmingLanguages.languageId],
    }),
    userTakesQuiz: many(userTakesQuiz),
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
    user: one(users, {
        fields: [leaderboards.userId],
        references: [users.userId],
    }),
    language: one(programmingLanguages, {
        fields: [leaderboards.languageId],
        references: [programmingLanguages.languageId],
    }),
}));

export const dashboardsRelations = relations(dashboards, ({ one }) => ({
    user: one(users, {
        fields: [dashboards.userId],
        references: [users.userId],
    }),
}));

export const studyModesRelations = relations(studyModes, ({ one }) => ({
    user: one(users, {
        fields: [studyModes.userId],
        references: [users.userId],
    }),
}));

export const musicRelations = relations(music, ({ many }) => ({
    userPlaysMusic: many(userPlaysMusic),
}));

export const dialoguesRelations = relations(dialogues, ({ one }) => ({
    assistant: one(assistants, {
        fields: [dialogues.assistantId],
        references: [assistants.assistantId],
    }),
    lesson: one(lessons, {
        fields: [dialogues.lessonId],
        references: [lessons.lessonId],
    }),
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