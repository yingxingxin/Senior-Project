/**
 * BullMQ Job Types
 *
 * TypeScript type definitions for all job data payloads and results.
 */

import type { SkillLevel, Difficulty, NotificationType } from '@/src/db/schema';

/**
 * Job data for generating a new AI lesson
 */
export interface GenerateLessonJobData {
  /** User ID who requested the lesson */
  userId: number;

  /** Topic/subject to generate lesson about */
  topic: string;

  /** Target difficulty level */
  difficulty?: Difficulty;

  /** Optional context from chat or onboarding */
  context?: string;

  /** Source that triggered generation */
  triggerSource: 'chat' | 'manual' | 'onboarding' | 'cron' | 'recommendation';

  /** Estimated duration preference in minutes */
  estimatedDurationMinutes?: number;

  /** Programming language preference (if applicable) */
  languagePreference?: string;

  /** Programming paradigm preference (if applicable) */
  paradigmPreference?: string;
}

/**
 * Result data from a successful lesson generation job
 */
export interface GenerateLessonJobResult {
  /** ID of the generated lesson */
  lessonId: number;

  /** Lesson slug */
  lessonSlug: string;

  /** Lesson title */
  lessonTitle: string;

  /** Number of sections generated */
  sectionCount: number;

  /** Slug of the first section (for redirects) */
  firstSectionSlug: string;

  /** Total generation time in milliseconds */
  generationTimeMs: number;

  /** Token usage statistics */
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };

  /** Model used for generation */
  modelUsed: string;
}

/**
 * Job progress updates during generation
 */
export interface LessonGenerationProgress {
  /** Current step in generation process */
  step: 'initializing' | 'generating_outline' | 'generating_sections' | 'finalizing' | 'storing';

  /** Progress percentage (0-100) */
  percentage: number;

  /** Human-readable message */
  message: string;

  /** Current section being generated (if applicable) */
  currentSection?: {
    index: number;
    total: number;
    title: string;
  };

  /** Whether content is ready for early redirect (first lesson saved) */
  canRedirect?: boolean;

  /** Course slug for redirect (available when canRedirect is true) */
  courseSlug?: string;

  /** First lesson slug for redirect */
  firstLessonSlug?: string;

  /** Number of lessons saved so far */
  lessonsCompleted?: number;

  /** Total number of lessons planned */
  totalLessons?: number;
}

/**
 * Job data for creating a notification
 */
export interface CreateNotificationJobData {
  /** User ID to receive the notification */
  userId: number;

  /** Type of notification */
  type: NotificationType;

  /** Notification title */
  title: string;

  /** Notification message body */
  message: string;

  /** Optional URL to navigate to when clicked */
  link?: string;

  /** Optional additional data (e.g., { senderId: 123 }) */
  data?: Record<string, unknown>;
}

/**
 * Result data from a successful notification job
 */
export interface CreateNotificationJobResult {
  /** ID of the created notification */
  notificationId: number;

  /** Whether the notification was created successfully */
  success: boolean;
}

/**
 * Job data for generating a single lesson (parallel flow child job)
 */
export interface GenerateSingleLessonJobData {
  /** User ID who requested the lesson */
  userId: number;

  /** Course topic */
  topic: string;

  /** Target difficulty level */
  difficulty: Difficulty;

  /** Lesson title */
  lessonTitle: string;

  /** Lesson slug */
  lessonSlug: string;

  /** Lesson description */
  lessonDescription: string;

  /** Section specifications */
  sections: Array<{
    title: string;
    slug: string;
    topics: string[];
  }>;

  /** Lesson index in the course (0-based) */
  lessonIndex: number;

  /** Course slug (for prefixing lesson slugs) */
  courseSlug: string;
}

/**
 * Result from a single lesson generation job
 */
export interface GenerateSingleLessonResult {
  /** Lesson slug */
  lessonSlug: string;

  /** Lesson title */
  lessonTitle: string;

  /** Lesson description */
  lessonDescription: string;

  /** Lesson index */
  lessonIndex: number;

  /** Generated sections with Tiptap documents */
  sections: Array<{
    slug: string;
    title: string;
    document: Record<string, unknown>; // TiptapDocument
  }>;
}

/**
 * Job data for finalizing a course (parallel flow parent job)
 */
export interface FinalizeCourseJobData {
  /** User ID who requested the course */
  userId: number;

  /** Course slug */
  courseSlug: string;

  /** Course title */
  courseTitle: string;

  /** Course description */
  courseDescription: string;

  /** Original topic */
  topic: string;

  /** Target difficulty level */
  difficulty: Difficulty;

  /** Estimated duration in minutes */
  estimatedDurationMinutes: number;

  /** Number of lessons in the course */
  lessonCount: number;
}

/**
 * Job names as constants for type safety
 */
export const JOB_NAMES = {
  GENERATE_LESSON: 'generate-lesson',
  GENERATE_SINGLE_LESSON: 'generate-single-lesson',
  FINALIZE_COURSE: 'finalize-course',
  CREATE_NOTIFICATION: 'create-notification',
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

/**
 * Queue names as constants
 */
export const QUEUE_NAMES = {
  LESSON_GENERATION: 'lesson-generation',
  NOTIFICATIONS: 'notifications',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
