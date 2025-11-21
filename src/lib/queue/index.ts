/**
 * BullMQ Queue Module
 *
 * Central export point for all queue-related functionality.
 * Import from '@/lib/queue' to access queues, workers, and types.
 */

// Connection utilities
export { getRedisConnection, getRedisConnectionFromUrl, redisConnection } from './connection';

// Queue instances and helpers
export {
  lessonGenerationQueue,
  enqueueLessonGeneration,
  getLessonGenerationJobStatus,
  getLessonGenerationQueueMetrics,
  cleanLessonGenerationQueue,
} from './queues';

// Worker initialization
export {
  initializeAllWorkers,
  initializeLessonGenerationWorker,
  shutdownAllWorkers,
  registerSignalHandlers,
  isWorkersEnabled,
  lessonGenerationWorker,
} from './workers';

// Type exports
export type {
  GenerateLessonJobData,
  GenerateLessonJobResult,
  LessonGenerationProgress,
  JobName,
  QueueName,
} from './types';

export { JOB_NAMES, QUEUE_NAMES } from './types';

// Job processors (for testing/manual execution)
export { processLessonGeneration } from './jobs/lesson-generation';
