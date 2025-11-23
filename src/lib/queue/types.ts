/**
 * BullMQ Job Types
 *
 * TypeScript type definitions for all job data payloads and results.
 */

import type { SkillLevel, Difficulty } from '@/src/db/schema';

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
  triggerSource: 'chat' | 'manual' | 'onboarding' | 'cron';

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
  step: 'initializing' | 'generating_outline' | 'generating_sections' | 'finalizing';

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
}

/**
 * Job names as constants for type safety
 */
export const JOB_NAMES = {
  GENERATE_LESSON: 'generate-lesson',
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

/**
 * Queue names as constants
 */
export const QUEUE_NAMES = {
  LESSON_GENERATION: 'lesson-generation',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
