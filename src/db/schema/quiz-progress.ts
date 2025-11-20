/**
 * Quiz Progress Schema
 *
 * Tracks incomplete quiz attempts (progress saved when user exits before completion).
 * This allows users to resume quizzes where they left off.
 */

import {
  pgTable, serial, integer, jsonb,
  timestamp, uniqueIndex, index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';
import { quizzes } from './quizzes';

/**
 * Quiz Progress Table - Tracks incomplete quiz attempts
 *
 * WHEN CREATED: User starts answering questions in a quiz
 * WHEN UPDATED: User answers more questions or exits
 * WHEN DELETED: User completes the quiz (progress is moved to quiz_attempts)
 *
 * USER STORIES SUPPORTED:
 *   - Resume quizzes where user left off
 *   - Track partial progress across sessions
 */
export const quiz_progress = pgTable('quiz_progress', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  quiz_id: integer('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  answers: jsonb('answers').$type<Record<number, number>>().notNull().default({}), // { questionId: selectedIndex }
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex('uq_quiz_progress__user_quiz').on(t.user_id, t.quiz_id),
  index('ix_quiz_progress__user').on(t.user_id),
  index('ix_quiz_progress__quiz').on(t.quiz_id),
]);

export const quizProgressRelations = relations(quiz_progress, ({ one }) => ({
  user: one(users, {
    fields: [quiz_progress.user_id],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quiz_progress.quiz_id],
    references: [quizzes.id],
  }),
}));

export type QuizProgress = typeof quiz_progress.$inferSelect;
export type NewQuizProgress = typeof quiz_progress.$inferInsert;

