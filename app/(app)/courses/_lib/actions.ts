/**
 * Course Actions
 * 
 * Server actions for course and lesson management
 */

"use server";

import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { 
  getLessonsByCourse, 
  getUserCourseProgress, 
  startLessonProgress, 
  completeLesson, 
  completeLessonSection,
  upsertProgressLastSection,
  getSectionBySlugs,
  isSectionCompleted,
  checkLessonCompletion
} from "@/src/db/queries/lessons";
import { COURSES } from "@/src/lib/constants";

export interface CourseLesson {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  difficulty: string;
  estimatedDurationSec: number;
  isCompleted: boolean;
  startedAt: Date | null;
  lastAccessedAt: Date | null;
  completedAt: Date | null;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  lessons: CourseLesson[];
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

/**
 * Get course data with real lessons and user progress
 */
export async function getCourseData(courseId: string): Promise<CourseProgress | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return null;
  }

  const course = COURSES.find(c => c.id === courseId);
  if (!course) {
    return null;
  }

  try {
    // Get lessons for this course
    const lessons = await getLessonsByCourse.execute({ 
      courseSlug: courseId 
    });

    // Get user progress for these lessons
    const progress = await getUserCourseProgress.execute({ 
      userId: parseInt(session.user.id), 
      courseSlug: courseId 
    });

    // Combine lessons with progress data
    const lessonsWithProgress: CourseLesson[] = lessons.map(lesson => {
      const userProgress = progress.find(p => p.lessonId === lesson.id);
      return {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        difficulty: lesson.difficulty || 'standard',
        estimatedDurationSec: lesson.estimatedDurationSec || 0,
        isCompleted: userProgress?.isCompleted || false,
        startedAt: userProgress?.startedAt || null,
        lastAccessedAt: userProgress?.lastAccessedAt || null,
        completedAt: userProgress?.completedAt || null,
      };
    });

    const completedLessons = lessonsWithProgress.filter(l => l.isCompleted).length;
    const totalLessons = lessonsWithProgress.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      courseId,
      courseTitle: course.title,
      lessons: lessonsWithProgress,
      completedLessons,
      totalLessons,
      progressPercentage,
    };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return null;
  }
}

/**
 * Start a lesson
 */
export async function startLesson(lessonId: number): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Start or update lesson progress
    await startLessonProgress.execute({
      userId: parseInt(session.user.id),
      lessonId: lessonId,
    });

    return { success: true };
  } catch (error) {
    console.error('Error starting lesson:', error);
    return { success: false, error: 'Failed to start lesson' };
  }
}

/**
 * Complete a lesson
 */
export async function completeLessonAction(lessonId: number): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Mark lesson as completed
    await completeLesson.execute({
      userId: parseInt(session.user.id),
      lessonId: lessonId,
    });

    return { success: true };
  } catch (error) {
    console.error('Error completing lesson:', error);
    return { success: false, error: 'Failed to complete lesson' };
  }
}

/**
 * Complete a lesson section (no XP)
 */
export async function completeSectionAction(params: { lessonSlug: string; sectionSlug: string }): Promise<{ success: boolean; alreadyCompleted: boolean; lessonCompleted: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, alreadyCompleted: false, lessonCompleted: false, error: 'Not authenticated' };
  }

  try {
    const [{ lessonId, sectionId } = { lessonId: undefined, sectionId: undefined }] = await getSectionBySlugs.execute({
      lessonSlug: params.lessonSlug,
      sectionSlug: params.sectionSlug,
    });

    if (!lessonId || !sectionId) {
      return { success: false, alreadyCompleted: false, lessonCompleted: false, error: 'Section not found' };
    }

    // Check if section is already completed
    const existingCompletion = await isSectionCompleted(parseInt(session.user.id), sectionId);

    const alreadyCompleted = existingCompletion.length > 0;

    // Mark section complete (idempotent)
    const inserted = await completeLessonSection(parseInt(session.user.id), sectionId);

    // Update last_section_id and ensure progress row exists
    await upsertProgressLastSection(parseInt(session.user.id), lessonId, sectionId);

    // Check if lesson should be auto-completed now that this section is done
    const lessonCompletionResult = await checkAndCompleteLesson(lessonId);
    
    return { 
      success: true,
      alreadyCompleted,
      lessonCompleted: lessonCompletionResult.wasCompleted
    };
  } catch (error) {
    console.error('Error completing section:', error);
    return { success: false, alreadyCompleted: false, lessonCompleted: false, error: 'Failed to complete section' };
  }
}

/**
 * Check if a lesson section is already completed by the current user
 */
export async function checkSectionCompletion(params: { lessonSlug: string; sectionSlug: string }): Promise<{ isCompleted: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { isCompleted: false, error: 'Not authenticated' };
  }

  try {
    const [{ sectionId } = { sectionId: undefined }] = await getSectionBySlugs.execute({
      lessonSlug: params.lessonSlug,
      sectionSlug: params.sectionSlug,
    });

    if (!sectionId) {
      return { isCompleted: false, error: 'Section not found' };
    }

    const existingCompletion = await isSectionCompleted(parseInt(session.user.id), sectionId);

    return { isCompleted: existingCompletion.length > 0 };
  } catch (error) {
    console.error('Error checking section completion:', error);
    return { isCompleted: false, error: 'Failed to check section completion' };
  }
}

/**
 * Check if a lesson should be auto-completed based on all sections being completed
 */
export async function checkAndCompleteLesson(lessonId: number): Promise<{ wasCompleted: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { wasCompleted: false, error: 'Not authenticated' };
  }

  try {
    // Check if all sections are completed
    const [completionData] = await checkLessonCompletion.execute({
      userId: parseInt(session.user.id),
      lessonId: lessonId,
    });

    if (!completionData) {
      return { wasCompleted: false, error: 'Lesson not found' };
    }

    const { totalSections, completedSections } = completionData;
    
    // If all sections are completed, mark the lesson as completed
    if (totalSections > 0 && completedSections >= totalSections) {
      await completeLesson.execute({
        userId: parseInt(session.user.id),
        lessonId: lessonId,
      });

      return { wasCompleted: true };
    }

    return { wasCompleted: false };
  } catch (error) {
    console.error('Error checking lesson completion:', error);
    return { wasCompleted: false, error: 'Failed to check lesson completion' };
  }
}
