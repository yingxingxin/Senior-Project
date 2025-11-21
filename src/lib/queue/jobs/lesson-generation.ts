/**
 * Lesson Generation Job Processor
 *
 * Handles the actual lesson generation logic when a job is picked up by a worker.
 * Uses AI Agent approach with tool calling for iterative, high-quality lesson generation.
 */

import type { Job } from 'bullmq';
import type {
  GenerateLessonJobData,
  GenerateLessonJobResult,
  LessonGenerationProgress,
} from '../types';
import { generateAILessonWithAgent } from '@/lib/ai/lesson-generator-v2';

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
    // Call the AI Agent lesson generator with progress tracking
    const result = await generateAILessonWithAgent({
      userId,
      topic,
      difficulty,
      context,
      estimatedDurationMinutes,
      languagePreference,
      paradigmPreference,

      // Progress callback - updates BullMQ job progress
      onProgress: async (progress) => {
        await updateProgress(job, {
          step: progress.step as any,
          percentage: progress.percentage,
          message: progress.message,
        });
      },
    });

    console.log(`[Job ${job.id}] ✅ Lesson generation completed:`, {
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
      generationTimeMs: result.generationTimeMs,
      tokenUsage: result.tokenUsage,
      modelUsed: result.modelUsed,
    };
  } catch (error) {
    console.error(`[Job ${job.id}] ❌ Lesson generation failed:`, error);

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
