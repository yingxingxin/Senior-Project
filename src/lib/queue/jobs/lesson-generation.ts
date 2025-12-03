/**
 * Lesson Generation Job Processor
 *
 * Handles the actual lesson generation logic when a job is picked up by a worker.
 * Uses full AI Agent with iterative tools, document chunking, and diff-based editing.
 */

import type { Job } from 'bullmq';
import type {
  GenerateLessonJobData,
  GenerateLessonJobResult,
  LessonGenerationProgress,
} from '../types';
import { generateAILessonWithFullAgent } from '@/lib/ai';

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
