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
  notificationQueue,
  enqueueNotification,
  getNotificationQueueMetrics,
} from './queues';

// Worker initialization
export {
  initializeAllWorkers,
  initializeLessonGenerationWorker,
  initializeNotificationWorker,
  shutdownAllWorkers,
  registerSignalHandlers,
  isWorkersEnabled,
  lessonGenerationWorker,
  notificationWorker,
} from './workers';

// Type exports
export type {
  GenerateLessonJobData,
  GenerateLessonJobResult,
  GenerateSingleLessonJobData,
  GenerateSingleLessonResult,
  FinalizeCourseJobData,
  LessonGenerationProgress,
  CreateNotificationJobData,
  CreateNotificationJobResult,
  JobName,
  QueueName,
} from './types';

export { JOB_NAMES, QUEUE_NAMES } from './types';

// Job processors (for testing/manual execution)
export {
  processLessonGeneration,
  processSingleLessonGeneration,
  startParallelLessonGenerationFlow,
} from './jobs/lesson-generation';
export { processFinalizeCourse } from './jobs/finalize-course';
export { processNotification } from './jobs/notification';
