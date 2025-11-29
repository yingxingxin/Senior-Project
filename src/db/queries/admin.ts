/**
 * Prepared Queries - Admin
 *
 * High-performance prepared statements for admin dashboard and user management.
 */

import { db } from '@/src/db';
import { users, lessons, lesson_sections, quizzes, quiz_questions, quiz_attempts } from '@/src/db/schema';
import { count, gte, sql, eq, desc, or, ilike, and, isNull, isNotNull, asc } from 'drizzle-orm';
import type { PaginationParams, PaginatedResult } from '@/src/lib/pagination';
import { calculatePagination, calculateOffset } from '@/src/lib/pagination';
import type { Lesson, NewLesson, LessonSection, NewLessonSection, Quiz, NewQuiz, QuizQuestion, NewQuizQuestion } from '@/src/db/schema';

/**
 * Get total user count
 *
 * Returns the total number of users in the system.
 * Used on admin dashboard.
 *
 * @returns Count of users
 *
 * @example
 * const [result] = await getAdminUserCount.execute({});
 * console.log('Total users:', result.c);
 */
export const getAdminUserCount = db
  .select({ c: count() })
  .from(users)
  .limit(1)
  .prepare('get_admin_user_count');

/**
 * Get total lesson count
 *
 * Returns the total number of lessons in the system.
 * Used on admin dashboard.
 *
 * @returns Count of lessons
 *
 * @example
 * const [result] = await getAdminLessonCount.execute({});
 */
export const getAdminLessonCount = db
  .select({ c: count() })
  .from(lessons)
  .limit(1)
  .prepare('get_admin_lesson_count');

/**
 * Get total quiz count
 *
 * Returns the total number of quizzes in the system.
 * Used on admin dashboard.
 *
 * @returns Count of quizzes
 *
 * @example
 * const [result] = await getAdminQuizCount.execute({});
 */
export const getAdminQuizCount = db
  .select({ c: count() })
  .from(quizzes)
  .limit(1)
  .prepare('get_admin_quiz_count');

/**
 * Get new user count since date
 *
 * Returns count of users who joined after a specific date.
 * Used for admin dashboard "New this week/month" stats.
 *
 * @param startDate - The start date to count from
 * @returns Count of new users
 *
 * @example
 * const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
 * const [result] = await getNewUserCount.execute({ startDate: weekAgo });
 * console.log('New users this week:', result.c);
 */
export const getNewUserCount = db
  .select({ c: count() })
  .from(users)
  .where(gte(users.created_at, sql.placeholder('startDate')))
  .limit(1)
  .prepare('get_new_user_count');

/**
 * Get user's quiz attempts for admin view
 *
 * Returns all quiz attempts for a user with quiz information joined.
 * Used on admin user detail page.
 *
 * @param userId - The user's ID
 * @param limit - Maximum number of attempts to return
 * @returns Array of attempt records with quiz info
 *
 * @example
 * const attempts = await getAdminUserQuizAttempts.execute({ userId: 123, limit: 5 });
 */
export const getAdminUserQuizAttempts = db
  .select({
    id: quiz_attempts.id,
    quizId: quiz_attempts.quiz_id,
    quizTopic: quizzes.topic_slug,
    score: quiz_attempts.score,
    totalQuestions: quiz_attempts.total_questions,
    percentage: quiz_attempts.percentage,
    completedAt: quiz_attempts.completed_at,
    createdAt: quiz_attempts.created_at,
  })
  .from(quiz_attempts)
  .innerJoin(quizzes, eq(quiz_attempts.quiz_id, quizzes.id))
  .where(eq(quiz_attempts.user_id, sql.placeholder('userId')))
  .orderBy(desc(quiz_attempts.completed_at))
  .limit(sql.placeholder('limit'))
  .prepare('get_user_quiz_attempts_admin');

// ============ PAGINATED QUERIES ============

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date | null;
  isEmailVerified: boolean;
  onboardingCompleted: Date | null;
  onboardingStep: string | null;
  skillLevel: string | null;
};

export interface GetPaginatedUsersParams extends PaginationParams {
  search?: string;
  role?: 'user' | 'admin';
  onboardingStatus?: 'completed' | 'pending';
  activeToday?: boolean;
  createdAfter?: string; // ISO date string
}

/**
 * Get paginated users with filtering
 *
 * Supports search, role filter, onboarding status filter, and date filters.
 * Used by the admin users table.
 */
export async function getPaginatedUsers(
  params: GetPaginatedUsersParams
): Promise<PaginatedResult<AdminUser>> {
  const { page, pageSize, search, role, onboardingStatus, createdAfter } = params;
  const offset = calculateOffset({ page, pageSize });

  // Build where conditions
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    );
  }

  if (role) {
    conditions.push(eq(users.role, role));
  }

  if (onboardingStatus === 'completed') {
    conditions.push(isNotNull(users.onboarding_completed_at));
  } else if (onboardingStatus === 'pending') {
    conditions.push(isNull(users.onboarding_completed_at));
  }

  if (createdAfter) {
    conditions.push(gte(users.created_at, new Date(createdAfter)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [countResult] = await db
    .select({ count: count() })
    .from(users)
    .where(whereClause);

  const total = countResult?.count ?? 0;

  // Get paginated data
  const data = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.created_at,
      isEmailVerified: users.is_email_verified,
      onboardingCompleted: users.onboarding_completed_at,
      onboardingStep: users.onboarding_step,
      skillLevel: users.skill_level,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.created_at))
    .limit(pageSize)
    .offset(offset);

  return calculatePagination(data, total, { page, pageSize });
}

// ============ LESSON ADMIN QUERIES ============

export type AdminLesson = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  estimatedDurationSec: number | null;
  parentLessonId: number | null;
  orderIndex: number;
  icon: string | null;
  isPublished: boolean;
  scope: 'global' | 'user' | 'shared';
  isAiGenerated: boolean;
  sectionCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export interface GetPaginatedLessonsParams extends PaginationParams {
  search?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  scope?: 'global' | 'user' | 'shared';
  isPublished?: boolean;
  parentLessonId?: number | null; // null = top-level courses only
}

/**
 * Get paginated lessons for admin with filtering
 *
 * Supports search, difficulty, scope, published status, and parent filtering.
 * Used by the admin lessons table.
 */
export async function getPaginatedLessons(
  params: GetPaginatedLessonsParams
): Promise<PaginatedResult<AdminLesson>> {
  const { page, pageSize, search, difficulty, scope, isPublished, parentLessonId } = params;
  const offset = calculateOffset({ page, pageSize });

  // Build where conditions
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(lessons.title, `%${search}%`),
        ilike(lessons.slug, `%${search}%`),
        ilike(lessons.description, `%${search}%`)
      )
    );
  }

  if (difficulty) {
    conditions.push(eq(lessons.difficulty, difficulty));
  }

  if (scope) {
    conditions.push(eq(lessons.scope, scope));
  }

  if (isPublished !== undefined) {
    conditions.push(eq(lessons.is_published, isPublished));
  }

  // Filter by parent - null means top-level courses only
  if (parentLessonId === null) {
    conditions.push(isNull(lessons.parent_lesson_id));
  } else if (parentLessonId !== undefined) {
    conditions.push(eq(lessons.parent_lesson_id, parentLessonId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [countResult] = await db
    .select({ count: count() })
    .from(lessons)
    .where(whereClause);

  const total = countResult?.count ?? 0;

  // Get paginated data with section count
  const data = await db
    .select({
      id: lessons.id,
      slug: lessons.slug,
      title: lessons.title,
      description: lessons.description,
      difficulty: lessons.difficulty,
      estimatedDurationSec: lessons.estimated_duration_sec,
      parentLessonId: lessons.parent_lesson_id,
      orderIndex: lessons.order_index,
      icon: lessons.icon,
      isPublished: lessons.is_published,
      scope: lessons.scope,
      isAiGenerated: lessons.is_ai_generated,
      sectionCount: sql<number>`(SELECT COUNT(*) FROM ${lesson_sections} WHERE ${lesson_sections.lesson_id} = ${lessons.id})`,
      createdAt: lessons.created_at,
      updatedAt: lessons.updated_at,
    })
    .from(lessons)
    .where(whereClause)
    .orderBy(asc(lessons.order_index), desc(lessons.updated_at))
    .limit(pageSize)
    .offset(offset);

  return calculatePagination(data, total, { page, pageSize });
}

export type AdminLessonWithSections = Omit<AdminLesson, 'sectionCount'> & {
  ownerUserId: number | null;
  sections: Array<{
    id: number;
    slug: string;
    title: string;
    orderIndex: number;
    bodyMd: string;
    bodyJson: unknown;
  }>;
};

/**
 * Get a single lesson with all its sections for editing
 */
export async function getAdminLessonById(id: number): Promise<AdminLessonWithSections | null> {
  const [lesson] = await db
    .select({
      id: lessons.id,
      slug: lessons.slug,
      title: lessons.title,
      description: lessons.description,
      difficulty: lessons.difficulty,
      estimatedDurationSec: lessons.estimated_duration_sec,
      parentLessonId: lessons.parent_lesson_id,
      orderIndex: lessons.order_index,
      icon: lessons.icon,
      isPublished: lessons.is_published,
      scope: lessons.scope,
      isAiGenerated: lessons.is_ai_generated,
      ownerUserId: lessons.owner_user_id,
      createdAt: lessons.created_at,
      updatedAt: lessons.updated_at,
    })
    .from(lessons)
    .where(eq(lessons.id, id))
    .limit(1);

  if (!lesson) return null;

  const sections = await db
    .select({
      id: lesson_sections.id,
      slug: lesson_sections.slug,
      title: lesson_sections.title,
      orderIndex: lesson_sections.order_index,
      bodyMd: lesson_sections.body_md,
      bodyJson: lesson_sections.body_json,
    })
    .from(lesson_sections)
    .where(eq(lesson_sections.lesson_id, id))
    .orderBy(asc(lesson_sections.order_index));

  return { ...lesson, sections };
}

/**
 * Create a new lesson
 */
export async function createLesson(data: {
  slug: string;
  title: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedDurationSec?: number;
  parentLessonId?: number;
  orderIndex?: number;
  icon?: string;
  isPublished?: boolean;
  scope?: 'global' | 'user' | 'shared';
  ownerUserId?: number;
}): Promise<Lesson> {
  const [lesson] = await db
    .insert(lessons)
    .values({
      slug: data.slug,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      estimated_duration_sec: data.estimatedDurationSec,
      parent_lesson_id: data.parentLessonId,
      order_index: data.orderIndex ?? 0,
      icon: data.icon,
      is_published: data.isPublished ?? true,
      scope: data.scope ?? 'global',
      owner_user_id: data.ownerUserId,
    })
    .returning();

  return lesson;
}

/**
 * Update a lesson
 */
export async function updateLesson(
  id: number,
  data: {
    slug?: string;
    title?: string;
    description?: string | null;
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
    estimatedDurationSec?: number | null;
    parentLessonId?: number | null;
    orderIndex?: number;
    icon?: string | null;
    isPublished?: boolean;
    scope?: 'global' | 'user' | 'shared';
  }
): Promise<Lesson | null> {
  const updateData: Partial<NewLesson> = {};

  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
  if (data.estimatedDurationSec !== undefined) updateData.estimated_duration_sec = data.estimatedDurationSec;
  if (data.parentLessonId !== undefined) updateData.parent_lesson_id = data.parentLessonId;
  if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.isPublished !== undefined) updateData.is_published = data.isPublished;
  if (data.scope !== undefined) updateData.scope = data.scope;

  updateData.updated_at = new Date();

  const [updated] = await db
    .update(lessons)
    .set(updateData)
    .where(eq(lessons.id, id))
    .returning();

  return updated ?? null;
}

/**
 * Delete a lesson and all its sections (cascades via FK)
 */
export async function deleteLesson(id: number): Promise<boolean> {
  const result = await db
    .delete(lessons)
    .where(eq(lessons.id, id))
    .returning({ id: lessons.id });

  return result.length > 0;
}

// ============ LESSON SECTION ADMIN QUERIES ============

/**
 * Create a new lesson section
 */
export async function createLessonSection(data: {
  lessonId: number;
  slug: string;
  title: string;
  orderIndex?: number;
  bodyMd?: string;
  bodyJson?: unknown;
}): Promise<LessonSection> {
  const [section] = await db
    .insert(lesson_sections)
    .values({
      lesson_id: data.lessonId,
      slug: data.slug,
      title: data.title,
      order_index: data.orderIndex ?? 0,
      body_md: data.bodyMd ?? '',
      body_json: data.bodyJson,
    })
    .returning();

  return section;
}

/**
 * Update a lesson section
 */
export async function updateLessonSection(
  id: number,
  data: {
    slug?: string;
    title?: string;
    orderIndex?: number;
    bodyMd?: string;
    bodyJson?: unknown;
  }
): Promise<LessonSection | null> {
  const updateData: Partial<NewLessonSection> = {};

  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;
  if (data.bodyMd !== undefined) updateData.body_md = data.bodyMd;
  if (data.bodyJson !== undefined) updateData.body_json = data.bodyJson;

  const [updated] = await db
    .update(lesson_sections)
    .set(updateData)
    .where(eq(lesson_sections.id, id))
    .returning();

  return updated ?? null;
}

/**
 * Delete a lesson section
 */
export async function deleteLessonSection(id: number): Promise<boolean> {
  const result = await db
    .delete(lesson_sections)
    .where(eq(lesson_sections.id, id))
    .returning({ id: lesson_sections.id });

  return result.length > 0;
}

/**
 * Reorder lesson sections
 */
export async function reorderLessonSections(
  lessonId: number,
  sectionIds: number[]
): Promise<void> {
  // Update each section's order_index based on its position in the array
  await Promise.all(
    sectionIds.map((id, index) =>
      db
        .update(lesson_sections)
        .set({ order_index: index })
        .where(and(eq(lesson_sections.id, id), eq(lesson_sections.lesson_id, lessonId)))
    )
  );
}

// ============ QUIZ ADMIN QUERIES ============

export type AdminQuiz = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  topicSlug: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  defaultLength: number;
  questionCount: number;
  attemptCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export interface GetPaginatedQuizzesParams extends PaginationParams {
  search?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  topicSlug?: string;
}

/**
 * Get paginated quizzes for admin with filtering
 */
export async function getPaginatedQuizzes(
  params: GetPaginatedQuizzesParams
): Promise<PaginatedResult<AdminQuiz>> {
  const { page, pageSize, search, skillLevel, topicSlug } = params;
  const offset = calculateOffset({ page, pageSize });

  // Build where conditions
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(quizzes.title, `%${search}%`),
        ilike(quizzes.slug, `%${search}%`),
        ilike(quizzes.description, `%${search}%`),
        ilike(quizzes.topic_slug, `%${search}%`)
      )
    );
  }

  if (skillLevel) {
    conditions.push(eq(quizzes.skill_level, skillLevel));
  }

  if (topicSlug) {
    conditions.push(eq(quizzes.topic_slug, topicSlug));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [countResult] = await db
    .select({ count: count() })
    .from(quizzes)
    .where(whereClause);

  const total = countResult?.count ?? 0;

  // Get paginated data with question and attempt counts
  const data = await db
    .select({
      id: quizzes.id,
      slug: quizzes.slug,
      title: quizzes.title,
      description: quizzes.description,
      topicSlug: quizzes.topic_slug,
      skillLevel: quizzes.skill_level,
      defaultLength: quizzes.default_length,
      questionCount: sql<number>`(SELECT COUNT(*) FROM ${quiz_questions} WHERE ${quiz_questions.quiz_id} = ${quizzes.id})`,
      attemptCount: sql<number>`(SELECT COUNT(*) FROM ${quiz_attempts} WHERE ${quiz_attempts.quiz_id} = ${quizzes.id})`,
      createdAt: quizzes.created_at,
      updatedAt: quizzes.updated_at,
    })
    .from(quizzes)
    .where(whereClause)
    .orderBy(asc(quizzes.topic_slug), asc(quizzes.skill_level), desc(quizzes.updated_at))
    .limit(pageSize)
    .offset(offset);

  return calculatePagination(data, total, { page, pageSize });
}

export type AdminQuizWithQuestions = Omit<AdminQuiz, 'questionCount' | 'attemptCount'> & {
  questions: Array<{
    id: number;
    orderIndex: number;
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string | null;
  }>;
};

/**
 * Get a single quiz with all its questions for editing
 */
export async function getAdminQuizById(id: number): Promise<AdminQuizWithQuestions | null> {
  const [quiz] = await db
    .select({
      id: quizzes.id,
      slug: quizzes.slug,
      title: quizzes.title,
      description: quizzes.description,
      topicSlug: quizzes.topic_slug,
      skillLevel: quizzes.skill_level,
      defaultLength: quizzes.default_length,
      createdAt: quizzes.created_at,
      updatedAt: quizzes.updated_at,
    })
    .from(quizzes)
    .where(eq(quizzes.id, id))
    .limit(1);

  if (!quiz) return null;

  const questions = await db
    .select({
      id: quiz_questions.id,
      orderIndex: quiz_questions.order_index,
      prompt: quiz_questions.prompt,
      options: quiz_questions.options,
      correctIndex: quiz_questions.correct_index,
      explanation: quiz_questions.explanation,
    })
    .from(quiz_questions)
    .where(eq(quiz_questions.quiz_id, id))
    .orderBy(asc(quiz_questions.order_index));

  return { ...quiz, questions };
}

/**
 * Create a new quiz
 */
export async function createQuiz(data: {
  slug: string;
  title: string;
  description?: string;
  topicSlug: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  defaultLength?: number;
}): Promise<Quiz> {
  const [quiz] = await db
    .insert(quizzes)
    .values({
      slug: data.slug,
      title: data.title,
      description: data.description,
      topic_slug: data.topicSlug,
      skill_level: data.skillLevel,
      default_length: data.defaultLength ?? 5,
    })
    .returning();

  return quiz;
}

/**
 * Update a quiz
 */
export async function updateQuiz(
  id: number,
  data: {
    slug?: string;
    title?: string;
    description?: string | null;
    topicSlug?: string;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
    defaultLength?: number;
  }
): Promise<Quiz | null> {
  const updateData: Partial<NewQuiz> = {};

  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.topicSlug !== undefined) updateData.topic_slug = data.topicSlug;
  if (data.skillLevel !== undefined) updateData.skill_level = data.skillLevel;
  if (data.defaultLength !== undefined) updateData.default_length = data.defaultLength;

  updateData.updated_at = new Date();

  const [updated] = await db
    .update(quizzes)
    .set(updateData)
    .where(eq(quizzes.id, id))
    .returning();

  return updated ?? null;
}

/**
 * Delete a quiz and all its questions (cascades via FK)
 */
export async function deleteQuiz(id: number): Promise<boolean> {
  const result = await db
    .delete(quizzes)
    .where(eq(quizzes.id, id))
    .returning({ id: quizzes.id });

  return result.length > 0;
}

// ============ QUIZ QUESTION ADMIN QUERIES ============

/**
 * Create a new quiz question
 */
export async function createQuizQuestion(data: {
  quizId: number;
  orderIndex?: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}): Promise<QuizQuestion> {
  const [question] = await db
    .insert(quiz_questions)
    .values({
      quiz_id: data.quizId,
      order_index: data.orderIndex ?? 0,
      prompt: data.prompt,
      options: data.options,
      correct_index: data.correctIndex,
      explanation: data.explanation,
    })
    .returning();

  return question;
}

/**
 * Update a quiz question
 */
export async function updateQuizQuestion(
  id: number,
  data: {
    orderIndex?: number;
    prompt?: string;
    options?: string[];
    correctIndex?: number;
    explanation?: string | null;
  }
): Promise<QuizQuestion | null> {
  const updateData: Partial<NewQuizQuestion> = {};

  if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;
  if (data.prompt !== undefined) updateData.prompt = data.prompt;
  if (data.options !== undefined) updateData.options = data.options;
  if (data.correctIndex !== undefined) updateData.correct_index = data.correctIndex;
  if (data.explanation !== undefined) updateData.explanation = data.explanation;

  const [updated] = await db
    .update(quiz_questions)
    .set(updateData)
    .where(eq(quiz_questions.id, id))
    .returning();

  return updated ?? null;
}

/**
 * Delete a quiz question
 */
export async function deleteQuizQuestion(id: number): Promise<boolean> {
  const result = await db
    .delete(quiz_questions)
    .where(eq(quiz_questions.id, id))
    .returning({ id: quiz_questions.id });

  return result.length > 0;
}

/**
 * Reorder quiz questions
 */
export async function reorderQuizQuestions(
  quizId: number,
  questionIds: number[]
): Promise<void> {
  await Promise.all(
    questionIds.map((id, index) =>
      db
        .update(quiz_questions)
        .set({ order_index: index })
        .where(and(eq(quiz_questions.id, id), eq(quiz_questions.quiz_id, quizId)))
    )
  );
}

/**
 * Get all parent lessons for dropdown
 */
export async function getParentLessonOptions(): Promise<Array<{ id: number; title: string; slug: string }>> {
  return await db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
    })
    .from(lessons)
    .where(isNull(lessons.parent_lesson_id))
    .orderBy(asc(lessons.order_index), asc(lessons.title));
}

/**
 * Get all unique topic slugs for dropdown
 */
export async function getQuizTopicOptions(): Promise<string[]> {
  const results = await db
    .selectDistinct({ topicSlug: quizzes.topic_slug })
    .from(quizzes)
    .orderBy(asc(quizzes.topic_slug));

  return results.map(r => r.topicSlug);
}
