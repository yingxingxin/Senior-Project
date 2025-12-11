/**
 * Finalize Course Job Processor
 *
 * Parent job in the parallel flow that:
 * 1. Waits for all child jobs (single lesson generators) to complete
 * 2. Combines their results
 * 3. Saves everything to the database
 */

import type { Job } from 'bullmq';
import { db } from '@/src/db';
import { lessons, lesson_sections } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import type {
  FinalizeCourseJobData,
  GenerateLessonJobResult,
  GenerateSingleLessonResult,
} from '../types';
import { countWordsInTiptap } from '@/src/lib/ai/tiptap';
import type { TiptapDocument } from '@/src/lib/ai/tiptap';

/**
 * Ensure a slug is unique in the database by appending a timestamp if needed
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  const existing = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.slug, baseSlug))
    .limit(1);

  if (existing.length === 0) {
    return baseSlug;
  }

  const timestamp = Date.now();
  const uniqueSlug = `${baseSlug}-${timestamp}`;
  console.log(`[FinalizeCourse] Slug "${baseSlug}" already exists, using "${uniqueSlug}"`);
  return uniqueSlug;
}

/**
 * Process finalize course job
 *
 * Combines results from parallel child jobs and saves to database.
 */
export async function processFinalizeCourse(
  job: Job<FinalizeCourseJobData, GenerateLessonJobResult>
): Promise<GenerateLessonJobResult> {
  const {
    userId,
    courseSlug: baseCourseSlug,
    courseTitle,
    courseDescription,
    topic,
    difficulty,
    estimatedDurationMinutes,
    lessonCount,
  } = job.data;

  const startTime = Date.now();

  console.log(`[FinalizeCourse] Starting finalization for "${courseTitle}" with ${lessonCount} lessons`);

  // Get all children's results
  // BullMQ returns children values as an object keyed by job key
  const childrenValues = await job.getChildrenValues<GenerateSingleLessonResult>();

  // Convert to array and sort by lesson index
  const lessonResults: GenerateSingleLessonResult[] = Object.values(childrenValues)
    .filter((result): result is GenerateSingleLessonResult => result !== null && result !== undefined)
    .sort((a, b) => a.lessonIndex - b.lessonIndex);

  if (lessonResults.length === 0) {
    throw new Error('No lesson results from child jobs');
  }

  console.log(`[FinalizeCourse] Received ${lessonResults.length} lesson results`);

  // Calculate total sections and word count
  const totalSections = lessonResults.reduce((sum, l) => sum + l.sections.length, 0);
  const wordCount = lessonResults.reduce((lessonSum, lesson) =>
    lessonSum + lesson.sections.reduce((sectionSum, section) =>
      sectionSum + countWordsInTiptap(section.document as TiptapDocument), 0
    ), 0
  );

  // Ensure course slug is unique
  const courseSlug = await ensureUniqueSlug(baseCourseSlug);

  console.log(`[FinalizeCourse] Creating course with ${lessonResults.length} lessons and ${totalSections} total sections`);

  // Level 1: Create COURSE (parent lesson with parent_lesson_id = null)
  const [courseRecord] = await db
    .insert(lessons)
    .values({
      slug: courseSlug,
      title: courseTitle,
      description: courseDescription.substring(0, 500),
      difficulty,
      estimated_duration_sec: estimatedDurationMinutes * 60,
      scope: 'user' as const,
      owner_user_id: userId,
      parent_lesson_id: null,
      is_ai_generated: true,
      ai_metadata: {
        topic,
        difficulty,
        model_used: 'x-ai/grok-4.1-fast',
        generation_timestamp: new Date().toISOString(),
        estimated_duration_minutes: estimatedDurationMinutes,
        word_count: wordCount,
        lesson_count: lessonResults.length,
        total_section_count: totalSections,
        agent_version: 'v4_parallel_flow',
      },
    })
    .returning();

  console.log(`[FinalizeCourse] Created course: ${courseRecord.id} (${courseSlug})`);

  // Level 2 & 3: Create LESSONS and SECTIONS
  const lessonRecords: typeof lessons.$inferSelect[] = [];
  let sectionCount = 0;

  for (const lessonResult of lessonResults) {
    // Make lesson slug unique by prefixing with course slug
    // Truncate to 64 chars max (varchar limit in DB)
    const uniqueLessonSlug = `${courseSlug}-${lessonResult.lessonSlug}`.substring(0, 64);

    const [lessonRecord] = await db
      .insert(lessons)
      .values({
        slug: uniqueLessonSlug,
        title: lessonResult.lessonTitle,
        description: lessonResult.lessonDescription || '',
        difficulty,
        estimated_duration_sec: Math.floor(estimatedDurationMinutes * 60 / lessonResults.length),
        scope: 'user' as const,
        owner_user_id: userId,
        parent_lesson_id: courseRecord.id,
        order_index: lessonResult.lessonIndex,
        is_ai_generated: true,
        ai_metadata: {
          lesson_index: lessonResult.lessonIndex,
          parent_course_slug: courseSlug,
          section_count: lessonResult.sections.length,
        },
      })
      .returning();

    lessonRecords.push(lessonRecord);

    // Create all sections for this lesson
    for (let sectionIndex = 0; sectionIndex < lessonResult.sections.length; sectionIndex++) {
      const section = lessonResult.sections[sectionIndex];
      await db.insert(lesson_sections).values({
        lesson_id: lessonRecord.id,
        slug: section.slug,
        title: section.title,
        order_index: sectionIndex,
        body_json: section.document,
        body_md: '',
      });
      sectionCount++;
    }

    console.log(`[FinalizeCourse] Created lesson "${lessonRecord.title}" with ${lessonResult.sections.length} sections`);
  }

  const generationTimeMs = Date.now() - startTime;

  console.log(`[FinalizeCourse] Course finalized in ${generationTimeMs}ms`, {
    courseId: courseRecord.id,
    title: courseTitle,
    lessons: lessonRecords.length,
    totalSections: sectionCount,
    wordCount,
  });

  return {
    lessonId: courseRecord.id,
    lessonSlug: courseSlug,
    lessonTitle: courseTitle,
    sectionCount,
    firstSectionSlug: lessonRecords[0].slug,
    generationTimeMs,
    tokenUsage: { prompt: 0, completion: 0, total: 0 },
    modelUsed: 'x-ai/grok-4.1-fast',
  };
}
