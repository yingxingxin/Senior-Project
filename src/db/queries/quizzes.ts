/**
 * Prepared Queries - Quizzes
 *
 * High-performance prepared statements for quiz and assessment operations.
 */

import { db } from '@/src/db';
import { quizzes, quiz_attempts, quiz_questions, quiz_options } from '@/src/db/schema';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';

/**
 * Get quiz attempts for a user
 *
 * Returns quiz attempts with related quiz information.
 * Used in admin pages and user progress tracking.
 *
 * @param userId - The user's ID
 * @param limit - Number of attempts to return
 * @returns Array of quiz attempts with quiz details
 *
 * @example
 * const attempts = await getUserQuizAttempts.execute({ userId: 123, limit: 5 });
 */
export const getUserQuizAttempts = db
  .select({
    id: quiz_attempts.id,
    quizId: quiz_attempts.quiz_id,
    attemptNumber: quiz_attempts.attempt_number,
    startedAt: quiz_attempts.started_at,
    submittedAt: quiz_attempts.submitted_at,
    durationSec: quiz_attempts.duration_sec,
    quizTopic: quizzes.topic,
    passingPct: quizzes.passing_pct,
  })
  .from(quiz_attempts)
  .leftJoin(quizzes, eq(quiz_attempts.quiz_id, quizzes.id))
  .where(eq(quiz_attempts.user_id, sql.placeholder('userId')))
  .orderBy(desc(quiz_attempts.started_at))
  .limit(sql.placeholder('limit'))
  .prepare('get_user_quiz_attempts');

/**
 * Insert quiz attempt
 *
 * Records a new quiz attempt when a user starts a quiz.
 * Returns the created attempt for immediate use.
 *
 * @param userId - The user's ID
 * @param quizId - The quiz ID
 * @param attemptNumber - The attempt number for this quiz
 * @returns The created quiz attempt
 *
 * @example
 * const [attempt] = await insertQuizAttempt.execute({
 *   userId: 123,
 *   quizId: 5,
 *   attemptNumber: 1,
 * });
 * console.log('Created attempt:', attempt.id);
 */
export const insertQuizAttempt = db
  .insert(quiz_attempts)
  .values({
    user_id: sql.placeholder('userId'),
    quiz_id: sql.placeholder('quizId'),
    attempt_number: sql.placeholder('attemptNumber'),
  })
  .returning()
  .prepare('insert_quiz_attempt');

/**
 * Get quiz attempt count for user
 *
 * Returns existing attempt numbers for a specific quiz and user.
 * Used to calculate the next attempt number.
 *
 * @param userId - The user's ID
 * @param quizId - The quiz ID
 * @returns Array of attempt records with attempt_number
 *
 * @example
 * const attempts = await getQuizAttemptCount.execute({ userId: 123, quizId: 5 });
 * const nextAttempt = attempts.length > 0 ? Math.max(...attempts.map(a => a.attempt_number)) + 1 : 1;
 */
export const getQuizAttemptCount = db
  .select({ attempt_number: quiz_attempts.attempt_number })
  .from(quiz_attempts)
  .where(
    and(
      eq(quiz_attempts.user_id, sql.placeholder('userId')),
      eq(quiz_attempts.quiz_id, sql.placeholder('quizId'))
    )
  )
  .orderBy(quiz_attempts.attempt_number)
  .prepare('get_quiz_attempt_count');
