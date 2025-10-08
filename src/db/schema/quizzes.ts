/**
 * Quizzes & Assessment Schema
 *
 * Contains all tables related to quizzes, questions, options, and user attempts.
 */

import {
  pgTable, serial, integer, text, boolean,
  timestamp, uniqueIndex, index, check, foreignKey
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { difficultyEnum } from './enums';
import { lessons, lesson_sections } from './lessons';
import { users } from './auth';
import { activity_events } from './progress';

// ============ TABLES ============

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
  topic: text('topic'),
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

// ============ RELATIONS ============

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [quizzes.lesson_id],
    references: [lessons.id],
  }),
  quizQuestions: many(quiz_questions),
  quizAttempts: many(quiz_attempts),
  activityEvents: many(activity_events),
}));

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
  // Direct relationship to the single selected option
  selectedOption: one(quiz_options, {
    fields: [quiz_attempt_answers.selected_option_id],
    references: [quiz_options.id],
  }),
}));

// ============ TYPES ============

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type QuizQuestion = typeof quiz_questions.$inferSelect;
export type NewQuizQuestion = typeof quiz_questions.$inferInsert;

export type QuizOption = typeof quiz_options.$inferSelect;
export type NewQuizOption = typeof quiz_options.$inferInsert;

export type QuizAttempt = typeof quiz_attempts.$inferSelect;
export type NewQuizAttempt = typeof quiz_attempts.$inferInsert;

export type QuizAttemptAnswer = typeof quiz_attempt_answers.$inferSelect;
export type NewQuizAttemptAnswer = typeof quiz_attempt_answers.$inferInsert;
