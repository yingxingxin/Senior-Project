/**
 * BullMQ Worker Setup
 *
 * Initializes and configures workers that process jobs from queues.
 * Workers should run in a separate process from the web server.
 */

import { Worker, type WorkerOptions } from 'bullmq';
import { getRedisConnection } from './connection';
import {
  QUEUE_NAMES,
  type GenerateLessonJobData,
  type GenerateLessonJobResult,
  type CreateNotificationJobData,
  type CreateNotificationJobResult,
} from './types';
import { processLessonGeneration } from './jobs/lesson-generation';
import { processNotification } from './jobs/notification';

/**
 * Check if workers should be enabled
 * Set ENABLE_WORKERS=true in environment to run workers
 */
export const isWorkersEnabled = () => {
  return process.env.ENABLE_WORKERS === 'true' || process.env.NODE_ENV === 'development';
};

/**
 * Default worker options
 */
const defaultWorkerOptions: Partial<WorkerOptions> = {
  connection: getRedisConnection(),

  // Concurrency: how many jobs to process simultaneously
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2', 10),

  // Limit: max number of jobs per second
  limiter: {
    max: 10, // Max 10 jobs per interval
    duration: 60000, // 1 minute interval
  },

  // Retry settings (handled by queue, but can override here)
  autorun: true, // Start processing immediately

  // Lock settings for distributed workers
  lockDuration: 5 * 60 * 1000, // 5 minutes lock duration
  lockRenewTime: 2 * 60 * 1000, // Renew lock every 2 minutes
};

/**
 * Lesson Generation Worker
 *
 * Processes jobs from the lesson-generation queue
 */
export let lessonGenerationWorker: Worker<GenerateLessonJobData, GenerateLessonJobResult> | null = null;

/**
 * Initialize the lesson generation worker
 */
export function initializeLessonGenerationWorker() {
  if (!isWorkersEnabled()) {
    console.log('[Workers] Workers disabled - skipping initialization');
    return null;
  }

  if (lessonGenerationWorker) {
    console.log('[Workers] Lesson generation worker already initialized');
    return lessonGenerationWorker;
  }

  lessonGenerationWorker = new Worker<GenerateLessonJobData, GenerateLessonJobResult>(
    QUEUE_NAMES.LESSON_GENERATION,
    async (job) => {
      console.log(`[Worker] Processing job: ${job.id}`);
      return await processLessonGeneration(job);
    },
    {
      connection: getRedisConnection(), // Explicitly set connection (required)
      ...defaultWorkerOptions,
      // Specific concurrency for lesson generation (AI calls are expensive)
      concurrency: parseInt(process.env.LESSON_WORKER_CONCURRENCY || '2', 10),
    }
  );

  // Event: Job completed successfully
  lessonGenerationWorker.on('completed', (job, result) => {
    console.log(`[Worker] Job completed: ${job.id}`, {
      lessonId: result.lessonId,
      lessonTitle: result.lessonTitle,
      generationTimeMs: result.generationTimeMs,
    });
  });

  // Event: Job failed after all retries
  lessonGenerationWorker.on('failed', (job, error) => {
    console.error(`[Worker] Job failed: ${job?.id}`, {
      error: error.message,
      attemptsMade: job?.attemptsMade,
    });
  });

  // Event: Worker error (connection issues, etc.)
  lessonGenerationWorker.on('error', (error) => {
    console.error('[Worker] Worker error:', error);
  });

  // Event: Worker ready
  lessonGenerationWorker.on('ready', () => {
    console.log('[Worker] Lesson generation worker ready');
  });

  // Event: Worker stalled (job took too long)
  lessonGenerationWorker.on('stalled', (jobId) => {
    console.warn(`[Worker] Job stalled: ${jobId}`);
  });

  console.log('[Workers] Lesson generation worker initialized');
  return lessonGenerationWorker;
}

/**
 * Notification Worker
 *
 * Processes jobs from the notifications queue
 */
export let notificationWorker: Worker<CreateNotificationJobData, CreateNotificationJobResult> | null = null;

/**
 * Initialize the notification worker
 */
export function initializeNotificationWorker() {
  if (!isWorkersEnabled()) {
    console.log('[Workers] Workers disabled - skipping notification worker initialization');
    return null;
  }

  if (notificationWorker) {
    console.log('[Workers] Notification worker already initialized');
    return notificationWorker;
  }

  notificationWorker = new Worker<CreateNotificationJobData, CreateNotificationJobResult>(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job) => {
      console.log(`[Worker] Processing notification job: ${job.id}`);
      return await processNotification(job);
    },
    {
      connection: getRedisConnection(),
      ...defaultWorkerOptions,
      // Higher concurrency for notifications (fast DB inserts)
      concurrency: parseInt(process.env.NOTIFICATION_WORKER_CONCURRENCY || '5', 10),
    }
  );

  // Event: Job completed successfully
  notificationWorker.on('completed', (job, result) => {
    console.log(`[Worker] Notification job completed: ${job.id}`, {
      notificationId: result.notificationId,
    });
  });

  // Event: Job failed after all retries
  notificationWorker.on('failed', (job, error) => {
    console.error(`[Worker] Notification job failed: ${job?.id}`, {
      error: error.message,
      attemptsMade: job?.attemptsMade,
    });
  });

  // Event: Worker error (connection issues, etc.)
  notificationWorker.on('error', (error) => {
    console.error('[Worker] Notification worker error:', error);
  });

  // Event: Worker ready
  notificationWorker.on('ready', () => {
    console.log('[Worker] Notification worker ready');
  });

  console.log('[Workers] Notification worker initialized');
  return notificationWorker;
}

/**
 * Initialize all workers
 *
 * Call this function to start all workers.
 * Typically called from a separate worker process or server startup.
 */
export function initializeAllWorkers() {
  console.log('[Workers] Initializing all workers...');

  // Initialize lesson generation worker
  initializeLessonGenerationWorker();

  // Initialize notification worker
  initializeNotificationWorker();

  console.log('[Workers] All workers initialized');
}

/**
 * Gracefully shutdown all workers
 *
 * Call this on process termination (SIGTERM, SIGINT)
 */
export async function shutdownAllWorkers() {
  console.log('[Workers] Shutting down workers...');

  const shutdownPromises: Promise<void>[] = [];

  if (lessonGenerationWorker) {
    shutdownPromises.push(lessonGenerationWorker.close());
  }

  if (notificationWorker) {
    shutdownPromises.push(notificationWorker.close());
  }

  await Promise.all(shutdownPromises);

  console.log('[Workers] All workers shut down');
}

/**
 * Register signal handlers for graceful shutdown
 * Call this from your worker script (e.g., scripts/worker.ts)
 * to enable graceful shutdown on SIGTERM/SIGINT
 */
export function registerSignalHandlers() {
  process.on('SIGTERM', async () => {
    console.log('[Workers] Received SIGTERM signal');
    await shutdownAllWorkers();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[Workers] Received SIGINT signal');
    await shutdownAllWorkers();
    process.exit(0);
  });
}
