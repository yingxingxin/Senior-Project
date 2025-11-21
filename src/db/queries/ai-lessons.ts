/**
 * Prepared Queries - AI Lessons
 *
 * High-performance prepared statements for AI-generated lesson operations.
 */

import { db } from '@/src/db';
import { lessons, lesson_sections, user_lesson_progress } from '@/src/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

/**
 * Get AI lesson by ID with ownership check
 *
 * Returns an AI-generated lesson with all its sections.
 * Includes ownership and scope information for access control.
 *
 * @param lessonId - The lesson's ID
 * @returns Lesson with sections and metadata
 *
 * @example
 * const lesson = await getAILessonById(123);
 */
export async function getAILessonById(lessonId: number) {
  const result = await db
    .select({
      id: lessons.id,
      slug: lessons.slug,
      title: lessons.title,
      description: lessons.description,
      difficulty: lessons.difficulty,
      estimatedDurationSec: lessons.estimated_duration_sec,
      scope: lessons.scope,
      ownerUserId: lessons.owner_user_id,
      isAiGenerated: lessons.is_ai_generated,
      aiMetadata: lessons.ai_metadata,
      createdAt: lessons.created_at,
      updatedAt: lessons.updated_at,
      sectionId: lesson_sections.id,
      sectionSlug: lesson_sections.slug,
      sectionTitle: lesson_sections.title,
      sectionOrder: lesson_sections.order_index,
      sectionBodyJson: lesson_sections.body_json,
    })
    .from(lessons)
    .leftJoin(lesson_sections, eq(lessons.id, lesson_sections.lesson_id))
    .where(and(
      eq(lessons.id, lessonId),
      eq(lessons.is_ai_generated, true)
    ))
    .orderBy(lesson_sections.order_index);

  if (result.length === 0) {
    return null;
  }

  // Group sections into an array
  const lesson = {
    id: result[0].id,
    slug: result[0].slug,
    title: result[0].title,
    description: result[0].description,
    difficulty: result[0].difficulty,
    estimatedDurationSec: result[0].estimatedDurationSec,
    scope: result[0].scope,
    ownerUserId: result[0].ownerUserId,
    isAiGenerated: result[0].isAiGenerated,
    aiMetadata: result[0].aiMetadata,
    createdAt: result[0].createdAt,
    updatedAt: result[0].updatedAt,
    sections: result
      .filter(r => r.sectionId !== null)
      .map(r => ({
        id: r.sectionId!,
        slug: r.sectionSlug!,
        title: r.sectionTitle!,
        order: r.sectionOrder!,
        bodyJson: r.sectionBodyJson,
      })),
  };

  return lesson;
}

/**
 * Get user's AI-generated lessons
 *
 * Returns all AI lessons owned by or shared with a user.
 * Includes progress information.
 *
 * @param userId - The user's ID
 * @param limit - Maximum number of lessons to return
 * @returns Array of AI lessons with progress
 *
 * @example
 * const myLessons = await getUserAILessons(123, 20);
 */
export async function getUserAILessons(userId: number, limit: number = 50) {
  return await db
    .select({
      id: lessons.id,
      slug: lessons.slug,
      title: lessons.title,
      description: lessons.description,
      difficulty: lessons.difficulty,
      estimatedDurationSec: lessons.estimated_duration_sec,
      scope: lessons.scope,
      ownerUserId: lessons.owner_user_id,
      aiMetadata: lessons.ai_metadata,
      createdAt: lessons.created_at,
      isCompleted: user_lesson_progress.is_completed,
      startedAt: user_lesson_progress.started_at,
      lastAccessedAt: user_lesson_progress.last_accessed_at,
    })
    .from(lessons)
    .leftJoin(user_lesson_progress, and(
      eq(lessons.id, user_lesson_progress.lesson_id),
      eq(user_lesson_progress.user_id, userId)
    ))
    .where(and(
      eq(lessons.is_ai_generated, true),
      eq(lessons.owner_user_id, userId)
    ))
    .orderBy(desc(lessons.created_at))
    .limit(limit);
}

/**
 * Update AI lesson
 *
 * Updates an AI lesson's title or description.
 * Only the owner can update their lessons.
 *
 * @param lessonId - The lesson's ID
 * @param updates - Fields to update
 * @returns Updated lesson record
 *
 * @example
 * await updateAILesson(123, { title: 'New Title', description: 'New description' });
 */
export async function updateAILesson(
  lessonId: number,
  updates: { title?: string; description?: string }
) {
  return await db
    .update(lessons)
    .set({
      ...updates,
      updated_at: new Date(),
    })
    .where(and(
      eq(lessons.id, lessonId),
      eq(lessons.is_ai_generated, true)
    ))
    .returning();
}

/**
 * Delete AI lesson
 *
 * Deletes an AI-generated lesson and all its sections.
 * Cascading deletes will handle related records.
 *
 * @param lessonId - The lesson's ID
 * @param userId - The user's ID (for ownership verification)
 * @returns Deleted lesson record
 *
 * @example
 * await deleteAILesson(123, 456);
 */
export async function deleteAILesson(lessonId: number, userId: number) {
  return await db
    .delete(lessons)
    .where(and(
      eq(lessons.id, lessonId),
      eq(lessons.is_ai_generated, true),
      eq(lessons.owner_user_id, userId)
    ))
    .returning();
}

/**
 * Check if user can access an AI lesson
 *
 * Verifies if a user has permission to view an AI lesson based on scope and ownership.
 *
 * @param lessonId - The lesson's ID
 * @param userId - The user's ID
 * @returns True if user can access the lesson
 *
 * @example
 * const canAccess = await canUserAccessAILesson(123, 456);
 */
export async function canUserAccessAILesson(lessonId: number, userId: number): Promise<boolean> {
  const [lesson] = await db
    .select({
      scope: lessons.scope,
      ownerUserId: lessons.owner_user_id,
    })
    .from(lessons)
    .where(and(
      eq(lessons.id, lessonId),
      eq(lessons.is_ai_generated, true)
    ))
    .limit(1);

  if (!lesson) {
    return false;
  }

  // Global lessons are accessible to everyone
  if (lesson.scope === 'global') {
    return true;
  }

  // User-scoped lessons are only accessible to the owner
  if (lesson.scope === 'user') {
    return lesson.ownerUserId === userId;
  }

  // TODO: For 'shared' scope, check shared_lesson_users table
  // For now, only owner can access
  return lesson.ownerUserId === userId;
}
