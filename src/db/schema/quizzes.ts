/**
 * Quizzes & Assessment Schema
 *
 * Contains all tables related to quizzes, questions, options, and user attempts.
 */

import {
  pgTable, serial, integer, text,
  timestamp, uniqueIndex, index, check,
  varchar, jsonb
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { skillLevelEnum } from './enums';
import { users } from './auth';
import { activity_events } from './progress';

// ============ TABLES ============

/**
 * Quizzes Table - Standalone quizzes for practice, separate from lessons
 *
 * WHEN CREATED: Content creation
 * WHEN UPDATED: Quiz edits (title, description, topic_slug, skill_level, default_length)
 * USED BY: Quiz system, practice area
 *
 * USER STORIES SUPPORTED:
 *   - Standalone quiz practice area
 *   - Topic-based quiz organization
 *   - Skill level filtering
 */
export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  topic_slug: varchar('topic_slug', { length: 100 }).notNull(),
  skill_level: skillLevelEnum('skill_level').notNull(),
  default_length: integer('default_length').notNull().default(5),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex('uq_quizzes__slug').on(t.slug),
  index('ix_quizzes__topic_slug').on(t.topic_slug),
  index('ix_quizzes__skill_level').on(t.skill_level),
  check('ck_quizzes__default_length', sql`${t.default_length} > 0`),
]);

/**
 * Quiz Questions Table - Stores individual quiz questions with options array and correct index
 *
 * WHEN CREATED: Quiz creation/editing
 * WHEN UPDATED: Question edits (prompt, options, correct_index, explanation)
 * USED BY: Quiz engine, question display
 *
 * USER STORIES SUPPORTED:
 *   - Single-answer MCQ questions with 4 options
 *   - Markdown support for prompts and explanations
 *   - Static explanations for feedback
 */
export const quiz_questions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  quiz_id: integer('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  order_index: integer('order_index').notNull().default(0),
  prompt: text('prompt').notNull(), // Markdown text
  options: jsonb('options').$type<string[]>().notNull(), // Array of 4 strings
  correct_index: integer('correct_index').notNull(), // 0-3
  explanation: text('explanation'), // Optional markdown explanation
}, (t) => [
  index('ix_quiz_questions__quiz').on(t.quiz_id),
  uniqueIndex('uq_quiz_questions__quiz_order').on(t.quiz_id, t.order_index),
  check('ck_quiz_questions__correct_index', sql`${t.correct_index} >= 0 AND ${t.correct_index} <= 3`),
]);

// Note: quiz_options table removed - options are now stored as JSON array in quiz_questions

/**
 * Quiz Attempts Table - Records quiz submission with score and completion data
 *
 * WHEN CREATED: User submits a quiz
 * WHEN UPDATED: Never (immutable after submission)
 * USED BY: Quiz history, progress tracking, analytics
 *
 * USER STORIES SUPPORTED:
 *   - Track quiz completion and scores
 *   - Calculate percentage scores
 *   - Record completion timestamps
 */
export const quiz_attempts = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  quiz_id: integer('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(), // Number of correct answers
  total_questions: integer('total_questions').notNull(), // Total questions in attempt
  percentage: integer('percentage').notNull(), // Score / total * 100
  completed_at: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('ix_quiz_attempts__user').on(t.user_id),
  index('ix_quiz_attempts__quiz').on(t.quiz_id),
  index('ix_quiz_attempts__completed_at').on(t.completed_at),
  check('ck_quiz_attempts__score', sql`${t.score} >= 0 AND ${t.score} <= ${t.total_questions}`),
  check('ck_quiz_attempts__percentage', sql`${t.percentage} >= 0 AND ${t.percentage} <= 100`),
]);

/**
 * Quiz Attempt Answers Table - Records user's selected answer index for each question
 *
 * WHEN CREATED: User submits quiz with answers
 * WHEN UPDATED: Never (immutable)
 * USED BY: Answer review, analytics
 *
 * USER STORIES SUPPORTED:
 *   - Track selected answer indices (0-3)
 *   - Detailed quiz analytics per question
 */
export const quiz_attempt_answers = pgTable('quiz_attempt_answers', {
  id: serial('id').primaryKey(),
  attempt_id: integer('attempt_id').notNull().references(() => quiz_attempts.id, { onDelete: 'cascade' }),
  question_id: integer('question_id').notNull().references(() => quiz_questions.id, { onDelete: 'cascade' }),
  selected_index: integer('selected_index').notNull(), // 0-3, index into question.options array
}, (t) => [
  uniqueIndex('uq_quiz_attempt_answers__attempt_question').on(t.attempt_id, t.question_id),
  index('ix_quiz_attempt_answers__attempt').on(t.attempt_id),
  check('ck_quiz_attempt_answers__selected_index', sql`${t.selected_index} >= 0 AND ${t.selected_index} <= 3`),
]);

// ============ RELATIONS ============

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  quizQuestions: many(quiz_questions),
  quizAttempts: many(quiz_attempts),
  activityEvents: many(activity_events),
}));

export const quizQuestionsRelations = relations(quiz_questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quiz_questions.quiz_id],
    references: [quizzes.id],
  }),
  attemptAnswers: many(quiz_attempt_answers),
}));

// quiz_options table removed - options stored in quiz_questions.options JSON array

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

export const quizAttemptAnswersRelations = relations(quiz_attempt_answers, ({ one }) => ({
  attempt: one(quiz_attempts, {
    fields: [quiz_attempt_answers.attempt_id],
    references: [quiz_attempts.id],
  }),
  question: one(quiz_questions, {
    fields: [quiz_attempt_answers.question_id],
    references: [quiz_questions.id],
  }),
}));

// ============ TYPES ============

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type QuizQuestion = typeof quiz_questions.$inferSelect;
export type NewQuizQuestion = typeof quiz_questions.$inferInsert;

// QuizOption type removed - options are stored as string[] in QuizQuestion

export type QuizAttempt = typeof quiz_attempts.$inferSelect;
export type NewQuizAttempt = typeof quiz_attempts.$inferInsert;

export type QuizAttemptAnswer = typeof quiz_attempt_answers.$inferSelect;
export type NewQuizAttemptAnswer = typeof quiz_attempt_answers.$inferInsert;
