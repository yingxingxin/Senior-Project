/**
 * Prepared Queries - Quizzes
 *
 * High-performance prepared statements for quiz operations.
 */

import { db } from '@/src/db';
import { quizzes, quiz_questions, quiz_attempts, quiz_attempt_answers, quiz_progress } from '@/src/db/schema';
import { eq, sql, asc, desc, and, max } from 'drizzle-orm';

/**
 * Get all quizzes grouped by topic and skill level
 *
 * Returns all quizzes with their metadata for the quizzes hub.
 *
 * @returns Array of quiz records
 *
 * @example
 * const allQuizzes = await getAllQuizzes.execute({});
 */
export const getAllQuizzes = db
  .select({
    id: quizzes.id,
    slug: quizzes.slug,
    title: quizzes.title,
    description: quizzes.description,
    topicSlug: quizzes.topic_slug,
    skillLevel: quizzes.skill_level,
    defaultLength: quizzes.default_length,
    isAiGenerated: quizzes.is_ai_generated,
    ownerUserId: quizzes.owner_user_id,
  })
  .from(quizzes)
  .orderBy(asc(quizzes.topic_slug), asc(quizzes.skill_level), asc(quizzes.title))
  .prepare('get_all_quizzes');

/**
 * Get quiz by slug
 *
 * Returns a quiz with its metadata.
 *
 * @param slug - The quiz slug
 * @returns Quiz record
 *
 * @example
 * const [quiz] = await getQuizBySlug.execute({ slug: 'variables-basics' });
 */
export const getQuizBySlug = db
  .select({
    id: quizzes.id,
    slug: quizzes.slug,
    title: quizzes.title,
    description: quizzes.description,
    topicSlug: quizzes.topic_slug,
    skillLevel: quizzes.skill_level,
    defaultLength: quizzes.default_length,
  })
  .from(quizzes)
  .where(eq(quizzes.slug, sql.placeholder('slug')))
  .limit(1)
  .prepare('get_quiz_by_slug');

/**
 * Get quiz by ID
 *
 * Returns a quiz with its metadata.
 *
 * @param quizId - The quiz ID
 * @returns Quiz record
 *
 * @example
 * const [quiz] = await getQuizById.execute({ quizId: 1 });
 */
export const getQuizById = db
  .select({
    id: quizzes.id,
    slug: quizzes.slug,
    title: quizzes.title,
    description: quizzes.description,
    topicSlug: quizzes.topic_slug,
    skillLevel: quizzes.skill_level,
    defaultLength: quizzes.default_length,
  })
  .from(quizzes)
  .where(eq(quizzes.id, sql.placeholder('quizId')))
  .limit(1)
  .prepare('get_quiz_by_id');

/**
 * Get quiz questions for a quiz
 *
 * Returns all questions for a quiz, optionally limited to default_length.
 * Note: Use a separate query with limit if you need to limit results.
 *
 * @param quizId - The quiz ID
 * @returns Array of question records
 *
 * @example
 * const questions = await getQuizQuestions.execute({ quizId: 1 });
 */
export const getQuizQuestions = db
  .select({
    id: quiz_questions.id,
    quizId: quiz_questions.quiz_id,
    orderIndex: quiz_questions.order_index,
    prompt: quiz_questions.prompt,
    options: quiz_questions.options,
    correctIndex: quiz_questions.correct_index,
    explanation: quiz_questions.explanation,
  })
  .from(quiz_questions)
  .where(eq(quiz_questions.quiz_id, sql.placeholder('quizId')))
  .orderBy(asc(quiz_questions.order_index))
  .prepare('get_quiz_questions');

/**
 * Get quiz question by ID
 *
 * Returns a single question with its options and correct answer.
 *
 * @param questionId - The question ID
 * @returns Question record
 *
 * @example
 * const [question] = await getQuizQuestionById.execute({ questionId: 1 });
 */
export const getQuizQuestionById = db
  .select({
    id: quiz_questions.id,
    quizId: quiz_questions.quiz_id,
    prompt: quiz_questions.prompt,
    options: quiz_questions.options,
    correctIndex: quiz_questions.correct_index,
    explanation: quiz_questions.explanation,
  })
  .from(quiz_questions)
  .where(eq(quiz_questions.id, sql.placeholder('questionId')))
  .limit(1)
  .prepare('get_quiz_question_by_id');

/**
 * Create a quiz attempt
 *
 * Creates a new quiz attempt record with score and completion data.
 *
 * @param userId - The user's ID
 * @param quizId - The quiz ID
 * @param score - Number of correct answers
 * @param totalQuestions - Total questions in attempt
 * @param percentage - Score percentage (0-100)
 * @returns Created attempt record
 *
 * @example
 * const attempt = await createQuizAttempt.execute({
 *   userId: 123,
 *   quizId: 1,
 *   score: 7,
 *   totalQuestions: 10,
 *   percentage: 70,
 * });
 */
export const createQuizAttempt = db
  .insert(quiz_attempts)
  .values({
    user_id: sql.placeholder('userId'),
    quiz_id: sql.placeholder('quizId'),
    score: sql.placeholder('score'),
    total_questions: sql.placeholder('totalQuestions'),
    percentage: sql.placeholder('percentage'),
    completed_at: new Date(),
  })
  .returning()
  .prepare('create_quiz_attempt');

/**
 * Create quiz attempt answers
 *
 * Creates answer records for a quiz attempt.
 *
 * @param attemptId - The attempt ID
 * @param questionId - The question ID
 * @param selectedIndex - The selected option index (0-3)
 * @returns Created answer record
 *
 * @example
 * const answer = await createQuizAttemptAnswer.execute({
 *   attemptId: 1,
 *   questionId: 5,
 *   selectedIndex: 2,
 * });
 */
export const createQuizAttemptAnswer = db
  .insert(quiz_attempt_answers)
  .values({
    attempt_id: sql.placeholder('attemptId'),
    question_id: sql.placeholder('questionId'),
    selected_index: sql.placeholder('selectedIndex'),
  })
  .returning()
  .prepare('create_quiz_attempt_answer');

/**
 * Get user's quiz attempts for a quiz
 *
 * Returns all attempts by a user for a specific quiz, ordered by completion date.
 *
 * @param userId - The user's ID
 * @param quizId - The quiz ID
 * @returns Array of attempt records
 *
 * @example
 * const attempts = await getUserQuizAttempts.execute({ userId: 123, quizId: 1 });
 */
export const getUserQuizAttempts = db
  .select({
    id: quiz_attempts.id,
    score: quiz_attempts.score,
    totalQuestions: quiz_attempts.total_questions,
    percentage: quiz_attempts.percentage,
    completedAt: quiz_attempts.completed_at,
  })
  .from(quiz_attempts)
  .where(
    and(
      eq(quiz_attempts.user_id, sql.placeholder('userId')),
      eq(quiz_attempts.quiz_id, sql.placeholder('quizId'))
    )
  )
  .orderBy(desc(quiz_attempts.completed_at))
  .prepare('get_user_quiz_attempts');

/**
 * Get user's best score for a quiz
 *
 * Returns the highest percentage score the user has achieved for a quiz.
 *
 * @param userId - The user's ID
 * @param quizId - The quiz ID
 * @returns Best percentage score or null if no attempts
 *
 * @example
 * const bestScore = await getUserBestQuizScore.execute({ userId: 123, quizId: 1 });
 */
export const getUserBestQuizScore = db
  .select({
    bestPercentage: max(quiz_attempts.percentage),
  })
  .from(quiz_attempts)
  .where(
    and(
      eq(quiz_attempts.user_id, sql.placeholder('userId')),
      eq(quiz_attempts.quiz_id, sql.placeholder('quizId'))
    )
  )
  .prepare('get_user_best_quiz_score');

/**
 * Get user's quiz progress (incomplete attempt)
 *
 * Returns saved progress for a quiz that hasn't been completed yet.
 *
 * @param userId - The user's ID
 * @param quizId - The quiz ID
 * @returns Progress record with saved answers
 *
 * @example
 * const [progress] = await getUserQuizProgress.execute({ userId: 123, quizId: 1 });
 */
export const getUserQuizProgress = db
  .select({
    id: quiz_progress.id,
    answers: quiz_progress.answers,
    updatedAt: quiz_progress.updated_at,
  })
  .from(quiz_progress)
  .where(
    and(
      eq(quiz_progress.user_id, sql.placeholder('userId')),
      eq(quiz_progress.quiz_id, sql.placeholder('quizId'))
    )
  )
  .limit(1)
  .prepare('get_user_quiz_progress');

/**
 * Save or update quiz progress
 *
 * Creates or updates a progress record for an incomplete quiz attempt.
 *
 * @param userId - The user's ID
 * @param quizId - The quiz ID
 * @param answers - Object mapping questionId to selectedIndex
 * @returns Created or updated progress record
 *
 * @example
 * await saveQuizProgress.execute({
 *   userId: 123,
 *   quizId: 1,
 *   answers: { 1: 0, 2: 2, 3: 1 },
 * });
 */
// Note: saveQuizProgress cannot be a prepared statement with onConflictDoUpdate
// We'll use a regular function instead
export async function saveQuizProgress(userId: number, quizId: number, answers: Record<number, number>) {
  return await db
    .insert(quiz_progress)
    .values({
      user_id: userId,
      quiz_id: quizId,
      answers: answers, // JSONB type - Record<number, number> matches schema
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: [quiz_progress.user_id, quiz_progress.quiz_id],
      set: {
        answers: answers, // JSONB type - Record<number, number> matches schema
        updated_at: new Date(),
      },
    })
    .returning();
}

/**
 * Delete quiz progress
 *
 * Removes saved progress for a quiz (typically after completion).
 *
 * @param userId - The user's ID
 * @param quizId - The quiz ID
 *
 * @example
 * await deleteQuizProgress.execute({ userId: 123, quizId: 1 });
 */
export const deleteQuizProgress = db
  .delete(quiz_progress)
  .where(
    and(
      eq(quiz_progress.user_id, sql.placeholder('userId')),
      eq(quiz_progress.quiz_id, sql.placeholder('quizId'))
    )
  )
  .prepare('delete_quiz_progress');

/**
 * Get user's quiz completion status and best score for a single quiz
 *
 * Returns completion status and best score for a quiz.
 *
 * @param userId - The user's ID
 * @param quizId - The quiz ID
 * @returns { bestPercentage, hasCompleted }
 *
 * @example
 * const [status] = await getUserQuizStatus.execute({ userId: 123, quizId: 1 });
 */
export const getUserQuizStatus = db
  .select({
    bestPercentage: max(quiz_attempts.percentage),
    hasCompleted: sql<boolean>`COUNT(*) > 0`,
  })
  .from(quiz_attempts)
  .where(
    and(
      eq(quiz_attempts.user_id, sql.placeholder('userId')),
      eq(quiz_attempts.quiz_id, sql.placeholder('quizId'))
    )
  )
  .prepare('get_user_quiz_status');
