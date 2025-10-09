/**
 * Prepared Queries - Lessons
 *
 * High-performance prepared statements for lesson and learning content operations.
 */

import { db } from '@/src/db';
import { lessons, user_lesson_progress, assistants } from '@/src/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

/**
 * Get featured lessons
 *
 * Returns a limited set of lessons for explore/featured sections.
 * Could be enhanced to filter by difficulty or topic.
 *
 * @param limit - Number of lessons to return
 * @returns Array of lesson records
 *
 * @example
 * const featuredLessons = await getFeaturedLessons.execute({ limit: 3 });
 */
export const getFeaturedLessons = db
  .select({
    id: lessons.id,
    slug: lessons.slug,
    title: lessons.title,
    description: lessons.description,
    difficulty: lessons.difficulty,
    estimatedDurationSec: lessons.estimated_duration_sec,
  })
  .from(lessons)
  .limit(sql.placeholder('limit'))
  .prepare('get_featured_lessons');

/**
 * Get user lesson progress
 *
 * Returns lesson progress records with lesson details.
 * Used to show which lessons the user has started or completed.
 *
 * @param userId - The user's ID
 * @param limit - Number of progress records to return
 * @returns Array of lesson progress with lesson details
 *
 * @example
 * const progress = await getUserLessonProgress.execute({ userId: 123, limit: 5 });
 */
export const getUserLessonProgress = db
  .select({
    id: user_lesson_progress.id,
    lessonId: user_lesson_progress.lesson_id,
    isCompleted: user_lesson_progress.is_completed,
    startedAt: user_lesson_progress.started_at,
    lastAccessedAt: user_lesson_progress.last_accessed_at,
    completedAt: user_lesson_progress.completed_at,
    lessonTitle: lessons.title,
    lessonSlug: lessons.slug,
    estimatedDurationSec: lessons.estimated_duration_sec,
  })
  .from(user_lesson_progress)
  .leftJoin(lessons, eq(user_lesson_progress.lesson_id, lessons.id))
  .where(eq(user_lesson_progress.user_id, sql.placeholder('userId')))
  .orderBy(desc(user_lesson_progress.last_accessed_at))
  .limit(sql.placeholder('limit'))
  .prepare('get_user_lesson_progress');

/**
 * Get assistant by ID
 *
 * Returns basic assistant information for validation.
 * Used during onboarding to verify assistant selection.
 *
 * @param assistantId - The assistant's ID
 * @returns Assistant record
 *
 * @example
 * const [assistant] = await getAssistantById.execute({ assistantId: 1 });
 */
export const getAssistantById = db
  .select({ assistantId: assistants.id })
  .from(assistants)
  .where(eq(assistants.id, sql.placeholder('assistantId')))
  .limit(1)
  .prepare('get_assistant_by_id');
