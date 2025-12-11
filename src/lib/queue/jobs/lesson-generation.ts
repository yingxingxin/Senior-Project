/**
 * Lesson Generation Job Processor
 *
 * Handles the actual lesson generation logic when a job is picked up by a worker.
 * Supports both sequential (v3 agent) and parallel (v4 flow) generation modes.
 */

import { FlowProducer, type Job } from 'bullmq';
import type {
  GenerateLessonJobData,
  GenerateLessonJobResult,
  GenerateSingleLessonJobData,
  GenerateSingleLessonResult,
  LessonGenerationProgress,
} from '../types';
import { QUEUE_NAMES } from '../types';
import { getRedisConnection } from '../connection';
import { generateAILessonWithFullAgent } from '@/src/lib/ai';
import { planCourse } from '@/src/lib/ai/lesson-generation/planner';
import { generateSingleLesson } from '@/src/lib/ai/lesson-generation/single-lesson-generator';
import { loadUserPersonalizationContext } from '@/src/lib/ai/lesson-generation/personalization';

/**
 * Process a lesson generation job
 *
 * This is the main entry point called by the BullMQ worker.
 * It orchestrates the entire lesson generation pipeline.
 *
 * @param job - BullMQ job instance with data and progress tracking
 * @returns Lesson generation result with ID, stats, etc.
 */
export async function processLessonGeneration(
  job: Job<GenerateLessonJobData, GenerateLessonJobResult>
): Promise<GenerateLessonJobResult> {
  const {
    userId,
    topic,
    difficulty,
    context,
    triggerSource,
    estimatedDurationMinutes,
    languagePreference,
    paradigmPreference,
  } = job.data;

  console.log(`[Job ${job.id}] Starting lesson generation`, {
    userId,
    topic,
    difficulty,
    triggerSource,
  });

  try {
    // Call the full AI Agent (v3) with iterative tools
    const result = await generateAILessonWithFullAgent({
      userId,
      topic,
      difficulty: difficulty ?? 'standard', // Default to standard if not specified
      context,
      estimatedDurationMinutes,
      languagePreference,
      paradigmPreference,

      // Progress callback - updates BullMQ job progress
      onProgress: async (progress) => {
        await updateProgress(job, {
          // Map agent step to queue step type
          step: progress.step as LessonGenerationProgress['step'],
          percentage: progress.percentage,
          message: progress.message,
        });
      },
    });

    console.log(`[Job ${job.id}] Lesson generation completed:`, {
      lessonId: result.lessonId,
      title: result.lessonTitle,
      wordCount: result.wordCount,
      timeMs: result.generationTimeMs,
    });

    // Return result in the format expected by BullMQ
    return {
      lessonId: result.lessonId,
      lessonSlug: result.lessonSlug,
      lessonTitle: result.lessonTitle,
      sectionCount: result.sectionCount,
      firstSectionSlug: result.firstSectionSlug,
      generationTimeMs: result.generationTimeMs,
      tokenUsage: result.tokenUsage
        ? {
            prompt: result.tokenUsage.promptTokens,
            completion: result.tokenUsage.completionTokens,
            total: result.tokenUsage.totalTokens,
          }
        : { prompt: 0, completion: 0, total: 0 },
      modelUsed: result.modelUsed,
    };
  } catch (error) {
    console.error(`[Job ${job.id}] Lesson generation failed:`, error);

    // Log more details for debugging
    if (error instanceof Error) {
      console.error(`[Job ${job.id}] Error details:`, {
        message: error.message,
        stack: error.stack,
      });
    }

    // Re-throw for BullMQ to handle retries
    throw error;
  }
}

/**
 * Helper to update job progress
 */
async function updateProgress(
  job: Job<GenerateLessonJobData, GenerateLessonJobResult>,
  progress: LessonGenerationProgress
) {
  await job.updateProgress(progress);
  console.log(`[Job ${job.id}] Progress: ${progress.percentage}% - ${progress.message}`);
}

/**
 * Process a single lesson generation job (parallel flow child)
 *
 * Generates content for one lesson's sections.
 */
export async function processSingleLessonGeneration(
  job: Job<GenerateSingleLessonJobData, GenerateSingleLessonResult>
): Promise<GenerateSingleLessonResult> {
  const {
    userId,
    topic,
    difficulty,
    lessonTitle,
    lessonSlug,
    lessonDescription,
    sections,
    lessonIndex,
  } = job.data;

  console.log(`[Job ${job.id}] Generating single lesson: "${lessonTitle}" (${sections.length} sections)`);

  try {
    // Load user context for personalization
    const userContext = await loadUserPersonalizationContext(userId);

    // Generate content for this lesson
    const result = await generateSingleLesson({
      topic,
      difficulty,
      lessonTitle,
      lessonSlug,
      lessonDescription,
      sections,
      userContext,
    });

    console.log(`[Job ${job.id}] Single lesson completed: "${lessonTitle}" with ${result.sections.length} sections`);

    return {
      lessonSlug: result.lessonSlug,
      lessonTitle: result.lessonTitle,
      lessonDescription: result.lessonDescription,
      lessonIndex,
      sections: result.sections.map((s) => ({
        slug: s.slug,
        title: s.title,
        document: s.document as Record<string, unknown>,
      })),
    };
  } catch (error) {
    console.error(`[Job ${job.id}] Single lesson generation failed:`, error);
    throw error;
  }
}

/**
 * Start a parallel lesson generation flow
 *
 * Creates a BullMQ Flow with:
 * - Parent job: finalize-course (waits for all children)
 * - Child jobs: generate-single-lesson (one per lesson, run in parallel)
 *
 * @returns The flow's parent job
 */
export async function startParallelLessonGenerationFlow(
  data: GenerateLessonJobData
): Promise<{ parentJobId: string; childrenCount: number }> {
  const {
    userId,
    topic,
    difficulty = 'standard',
    estimatedDurationMinutes = 30,
  } = data;

  console.log(`[ParallelFlow] Starting parallel generation for "${topic}"`);

  // Step 1: Load user context
  const userContext = await loadUserPersonalizationContext(userId);

  // Step 2: Plan the course (single quick AI call)
  console.log('[ParallelFlow] Planning course structure...');
  const plan = await planCourse({
    topic,
    difficulty,
    estimatedDurationMinutes,
    userContext,
  });

  console.log(`[ParallelFlow] Plan created: ${plan.lessons.length} lessons`);

  // Step 3: Create flow with parallel lesson jobs
  const flowProducer = new FlowProducer({ connection: getRedisConnection() });

  const flow = await flowProducer.add({
    name: 'finalize-course',
    queueName: QUEUE_NAMES.LESSON_GENERATION,
    data: {
      userId,
      courseSlug: plan.courseSlug,
      courseTitle: plan.courseTitle,
      courseDescription: plan.description,
      topic,
      difficulty,
      estimatedDurationMinutes,
      lessonCount: plan.lessons.length,
    },
    children: plan.lessons.map((lesson, index) => ({
      name: 'generate-single-lesson',
      queueName: QUEUE_NAMES.LESSON_GENERATION,
      data: {
        userId,
        topic,
        difficulty,
        lessonTitle: lesson.title,
        lessonSlug: lesson.slug,
        lessonDescription: lesson.description,
        sections: lesson.sections,
        lessonIndex: index,
        courseSlug: plan.courseSlug,
      } satisfies GenerateSingleLessonJobData,
    })),
  });

  console.log(`[ParallelFlow] Flow created with parent job ${flow.job.id} and ${plan.lessons.length} children`);

  return {
    parentJobId: flow.job.id || '',
    childrenCount: plan.lessons.length,
  };
}
