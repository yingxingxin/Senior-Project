/**
 * BullMQ Queue Definitions
 *
 * Creates and exports typed Queue instances for job enqueueing.
 * These are used by API routes and other parts of the application to add jobs.
 */

import { Queue } from 'bullmq';
import { getRedisConnection } from './connection';
import { QUEUE_NAMES, type GenerateLessonJobData, type GenerateLessonJobResult } from './types';

/**
 * Default job options for all queues
 */
const defaultJobOptions = {
  // Retry failed jobs with exponential backoff
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 5000, // Start with 5 seconds: 5s, 15s, 45s
  },

  // Clean up completed/failed jobs after some time
  removeOnComplete: {
    age: 24 * 3600, // Keep for 24 hours
    count: 1000, // Keep last 1000
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    count: 5000, // Keep last 5000 failed jobs
  },

  // Timeout for individual jobs
  timeout: 5 * 60 * 1000, // 5 minutes max per job
};

/**
 * Lesson Generation Queue
 *
 * Handles AI-generated lesson creation jobs.
 * Jobs are processed by workers running the lesson generation logic.
 */
export const lessonGenerationQueue = new Queue<GenerateLessonJobData, GenerateLessonJobResult>(
  QUEUE_NAMES.LESSON_GENERATION,
  {
    connection: getRedisConnection(),
    defaultJobOptions,
  }
);

/**
 * Helper function to add a lesson generation job to the queue
 *
 * @param data - Job data containing user ID, topic, etc.
 * @returns Job ID for tracking
 */
export async function enqueueLessonGeneration(data: GenerateLessonJobData) {
  const job = await lessonGenerationQueue.add('generate-lesson', data, {
    // Priority: higher priority for manual/chat requests
    priority: data.triggerSource === 'cron' ? 10 : 1,

    // Job ID for idempotency (prevent duplicate jobs)
    jobId: `lesson-${data.userId}-${data.topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,

    // Metadata for debugging
    timestamp: Date.now(),
  });

  console.log(`[Queue] Enqueued lesson generation job: ${job.id}`, {
    userId: data.userId,
    topic: data.topic,
    triggerSource: data.triggerSource,
  });

  return job.id;
}

/**
 * Get job status and progress
 *
 * @param jobId - Job ID returned from enqueueLessonGeneration
 * @returns Job state and progress information
 */
export async function getLessonGenerationJobStatus(jobId: string) {
  const job = await lessonGenerationQueue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress;
  const returnValue = job.returnvalue;
  const failedReason = job.failedReason;

  return {
    jobId: job.id,
    state, // 'waiting' | 'active' | 'completed' | 'failed' | 'delayed'
    progress,
    result: returnValue as GenerateLessonJobResult | undefined,
    error: failedReason,
    data: job.data,
    timestamp: job.timestamp, // When job was created
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    attemptsMade: job.attemptsMade,
  };
}

/**
 * Get queue metrics for monitoring
 */
export async function getLessonGenerationQueueMetrics() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    lessonGenerationQueue.getWaitingCount(),
    lessonGenerationQueue.getActiveCount(),
    lessonGenerationQueue.getCompletedCount(),
    lessonGenerationQueue.getFailedCount(),
    lessonGenerationQueue.getDelayedCount(),
  ]);

  return {
    queue: QUEUE_NAMES.LESSON_GENERATION,
    counts: {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    },
  };
}

/**
 * Clean up old jobs (optional maintenance function)
 */
export async function cleanLessonGenerationQueue() {
  await lessonGenerationQueue.clean(24 * 3600 * 1000, 1000, 'completed'); // Clean completed jobs older than 24h
  await lessonGenerationQueue.clean(7 * 24 * 3600 * 1000, 5000, 'failed'); // Clean failed jobs older than 7 days

  console.log('[Queue] Cleaned up old jobs');
}

// Export queue for direct access if needed
export { lessonGenerationQueue as default };
