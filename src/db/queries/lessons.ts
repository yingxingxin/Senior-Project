/**
 * Prepared Queries - Lessons
 *
 * High-performance prepared statements for lesson and learning content operations.
 */

import { db } from '@/src/db';
import { lessons, user_lesson_progress, assistants, lesson_sections, user_lesson_sections, activity_events } from '@/src/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

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

/**
 * Get all top-level courses
 *
 * Returns all courses (lessons with parent_lesson_id IS NULL)
 *
 * @returns Array of course records
 *
 * @example
 * const courses = await getAllCourses.execute({});
 */
export const getAllCourses = db
  .select({
    id: lessons.id,
    slug: lessons.slug,
    title: lessons.title,
    description: lessons.description,
    difficulty: lessons.difficulty,
    estimatedDurationSec: lessons.estimated_duration_sec,
    icon: lessons.icon,
    orderIndex: lessons.order_index,
    isAiGenerated: lessons.is_ai_generated,
    ownerUserId: lessons.owner_user_id,
    aiMetadata: lessons.ai_metadata,
  })
  .from(lessons)
  .where(sql`${lessons.parent_lesson_id} IS NULL`)
  .orderBy(lessons.order_index)
  .prepare('get_all_courses');

/**
 * Get lessons by course ID
 *
 * Returns all lessons (topics) within a course
 *
 * @param courseId - The course ID (parent_lesson_id)
 * @returns Array of lesson records
 *
 * @example
 * const lessons = await getLessonsByCourse.execute({ courseId: 1 });
 */
export const getLessonsByCourse = db
  .select({
    id: lessons.id,
    slug: lessons.slug,
    title: lessons.title,
    description: lessons.description,
    difficulty: lessons.difficulty,
    estimatedDurationSec: lessons.estimated_duration_sec,
    orderIndex: lessons.order_index,
    icon: lessons.icon,
  })
  .from(lessons)
  .where(eq(lessons.parent_lesson_id, sql.placeholder('courseId')))
  .orderBy(lessons.order_index)
  .prepare('get_lessons_by_course');

/**
 * Get lesson with sections
 *
 * Returns a lesson with all its sections
 *
 * @param lessonSlug - The lesson slug
 * @returns Lesson with sections
 *
 * @example
 * const [lesson] = await getLessonWithSections.execute({ lessonSlug: 'programming-foundations-1-introduction' });
 */
export const getLessonWithSections = db
  .select({
    id: lessons.id,
    slug: lessons.slug,
    title: lessons.title,
    description: lessons.description,
    difficulty: lessons.difficulty,
    estimatedDurationSec: lessons.estimated_duration_sec,
    sectionId: lesson_sections.id,
    sectionSlug: lesson_sections.slug,
    sectionTitle: lesson_sections.title,
    sectionOrder: lesson_sections.order_index,
    sectionBodyJson: lesson_sections.body_json,
    sectionBodyMd: lesson_sections.body_md, // Keep for fallback compatibility
  })
  .from(lessons)
  .leftJoin(lesson_sections, eq(lessons.id, lesson_sections.lesson_id))
  .where(eq(lessons.slug, sql.placeholder('lessonSlug')))
  .orderBy(lesson_sections.order_index)
  .prepare('get_lesson_with_sections');

/**
 * Get user lesson progress for a course
 *
 * Returns user's progress through lessons in a course, ordered by lesson order
 *
 * @param userId - The user's ID
 * @param courseId - The course ID (parent_lesson_id)
 * @returns Array of lesson progress records
 *
 * @example
 * const progress = await getUserCourseProgress.execute({ userId: 123, courseId: 1 });
 */
export const getUserCourseProgress = db
  .select({
    lessonId: lessons.id,
    lessonSlug: lessons.slug,
    lessonTitle: lessons.title,
    orderIndex: lessons.order_index,
    isCompleted: user_lesson_progress.is_completed,
    startedAt: user_lesson_progress.started_at,
    lastAccessedAt: user_lesson_progress.last_accessed_at,
    completedAt: user_lesson_progress.completed_at,
  })
  .from(lessons)
  .leftJoin(user_lesson_progress, and(
    eq(lessons.id, user_lesson_progress.lesson_id),
    eq(user_lesson_progress.user_id, sql.placeholder('userId'))
  ))
  .where(eq(lessons.parent_lesson_id, sql.placeholder('courseId')))
  .orderBy(lessons.order_index)
  .prepare('get_user_course_progress');

/**
 * Start or update lesson progress
 *
 * Creates or updates user lesson progress
 *
 * @param userId - The user's ID
 * @param lessonId - The lesson's ID
 * @returns Updated progress record
 *
 * @example
 * const progress = await startLessonProgress.execute({ userId: 123, lessonId: 1 });
 */
export const startLessonProgress = db
  .insert(user_lesson_progress)
  .values({
    user_id: sql.placeholder('userId'),
    lesson_id: sql.placeholder('lessonId'),
    started_at: new Date(),
    last_accessed_at: new Date(),
  })
  .onConflictDoUpdate({
    target: [user_lesson_progress.user_id, user_lesson_progress.lesson_id],
    set: {
      last_accessed_at: new Date(),
    },
  })
  .returning()
  .prepare('start_lesson_progress');

/**
 * Complete lesson
 *
 * Marks a lesson as completed and records completion time
 *
 * @param userId - The user's ID
 * @param lessonId - The lesson's ID
 * @returns Updated progress record
 *
 * @example
 * const progress = await completeLesson.execute({ userId: 123, lessonId: 1 });
 */
export const completeLesson = db
  .update(user_lesson_progress)
  .set({
    is_completed: true,
    completed_at: new Date(),
    last_accessed_at: new Date(),
  })
  .where(and(
    eq(user_lesson_progress.user_id, sql.placeholder('userId')),
    eq(user_lesson_progress.lesson_id, sql.placeholder('lessonId'))
  ))
  .returning()
  .prepare('complete_lesson');

/**
 * Record activity event
 *
 * Creates an activity event for tracking user actions
 *
 * @param userId - The user's ID
 * @param eventType - The type of event
 * @param lessonId - The lesson's ID (optional)
 * @param pointsDelta - Points to award (optional)
 * @returns Created activity event
 *
 * @example
 * const event = await recordActivityEvent.execute({ 
 *   userId: 123, 
 *   eventType: 'lesson_completed', 
 *   lessonId: 1, 
 *   pointsDelta: 50 
 * });
 */
export const recordActivityEvent = db
  .insert(activity_events)
  .values({
    user_id: sql.placeholder('userId'),
    event_type: sql.placeholder('eventType'),
    lesson_id: sql.placeholder('lessonId'),
    points_delta: sql.placeholder('pointsDelta'),
    occurred_at: new Date(),
  })
  .returning()
  .prepare('record_activity_event');

/**
 * Check if a lesson section is already completed by user
 */
export async function isSectionCompleted(userId: number, sectionId: number) {
  return await db
    .select({ user_id: user_lesson_sections.user_id })
    .from(user_lesson_sections)
    .where(
      and(
        eq(user_lesson_sections.user_id, userId),
        eq(user_lesson_sections.section_id, sectionId)
      )
    )
    .limit(1);
}

/**
 * Complete a lesson section (idempotent)
 *
 * Inserts into user_lesson_sections if not already present.
 */
export async function completeLessonSection(userId: number, sectionId: number) {
  return await db
    .insert(user_lesson_sections)
    .values({
      user_id: userId,
      section_id: sectionId,
    })
    .onConflictDoNothing()
    .returning();
}

/**
 * Upsert progress last_section_id for a lesson
 */
export async function upsertProgressLastSection(userId: number, lessonId: number, sectionId: number) {
  return await db
    .insert(user_lesson_progress)
    .values({
      user_id: userId,
      lesson_id: lessonId,
      last_section_id: sectionId,
      started_at: new Date(),
      last_accessed_at: new Date(),
    })
    .onConflictDoUpdate({
      target: [user_lesson_progress.user_id, user_lesson_progress.lesson_id],
      set: {
        last_accessed_at: new Date(),
        last_section_id: sectionId,
      },
    })
    .returning();
}

/**
 * Get a lesson section by lesson slug and section slug
 */
export const getSectionBySlugs = db
  .select({
    lessonId: lessons.id,
    sectionId: lesson_sections.id,
  })
  .from(lessons)
  .leftJoin(lesson_sections, eq(lessons.id, lesson_sections.lesson_id))
  .where(and(
    eq(lessons.slug, sql.placeholder('lessonSlug')),
    eq(lesson_sections.slug, sql.placeholder('sectionSlug'))
  ))
  .limit(1)
  .prepare('get_section_by_slugs');

/**
 * Check if all sections in a lesson are completed by a user
 */
export const checkLessonCompletion = db
  .select({
    totalSections: sql<number>`COUNT(${lesson_sections.id})`,
    completedSections: sql<number>`COUNT(${user_lesson_sections.section_id})`,
  })
  .from(lessons)
  .leftJoin(lesson_sections, eq(lessons.id, lesson_sections.lesson_id))
  .leftJoin(user_lesson_sections, and(
    eq(lesson_sections.id, user_lesson_sections.section_id),
    eq(user_lesson_sections.user_id, sql.placeholder('userId'))
  ))
  .where(eq(lessons.id, sql.placeholder('lessonId')))
  .groupBy(lessons.id)
  .limit(1)
  .prepare('check_lesson_completion');
