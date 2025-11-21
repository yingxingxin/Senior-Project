/**
 * TypeScript types for AI-generated lesson metadata
 *
 * These types define the structure of the ai_metadata JSONB column
 * in the lessons table.
 */

import type { AssistantPersona } from './auth';
import type { SkillLevel } from './enums';

/**
 * AI Generation Metadata
 *
 * Stored in lessons.ai_metadata JSONB column for AI-generated lessons.
 * All fields are optional since metadata is added progressively during generation.
 */
export interface AILessonMetadata {
  /**
   * AI model used for generation (e.g., "gpt-4o", "claude-3-5-sonnet")
   */
  model_used?: string;

  /**
   * Original user request/prompt that triggered generation
   */
  generation_prompt?: string;

  /**
   * User's assistant persona at time of generation
   * Affects tone, pacing, and encouragement style
   */
  persona_snapshot?: AssistantPersona;

  /**
   * User's skill level at time of generation
   * Affects difficulty and explanation depth
   */
  skill_level_snapshot?: SkillLevel;

  /**
   * BullMQ job ID for tracking generation status
   */
  generation_job_id?: string;

  /**
   * ISO timestamp when generation completed
   */
  generated_at?: string;

  /**
   * Number of times this lesson has been regenerated
   */
  regeneration_count?: number;

  /**
   * Time taken to generate lesson in milliseconds
   */
  generation_duration_ms?: number;

  /**
   * Token usage statistics for cost tracking
   */
  token_usage?: {
    prompt: number;
    completion: number;
    total?: number;
  };

  /**
   * Programming language preference (if applicable)
   * e.g., "javascript", "python", "rust"
   */
  language_preference?: string;

  /**
   * Programming paradigm preference (if applicable)
   * e.g., "functional", "oop", "procedural"
   */
  paradigm_preference?: string;

  /**
   * Topics/tags inferred from lesson content
   */
  topics?: string[];

  /**
   * User feedback on generation quality
   */
  user_feedback?: {
    rating?: number; // 1-5
    feedback_text?: string;
    too_easy?: boolean;
    too_hard?: boolean;
    helpful?: boolean;
  };

  /**
   * A/B test variant (for prompt experimentation)
   */
  variant?: string;

  /**
   * Any generation errors or warnings
   */
  generation_errors?: string[];
}

/**
 * Helper to validate AI metadata structure
 */
export function isValidAIMetadata(data: unknown): data is AILessonMetadata {
  if (!data || typeof data !== 'object') return false;

  const meta = data as AILessonMetadata;

  // All fields are optional, but if present, must be correct type
  if (meta.model_used !== undefined && typeof meta.model_used !== 'string') return false;
  if (meta.generation_prompt !== undefined && typeof meta.generation_prompt !== 'string') return false;
  if (meta.regeneration_count !== undefined && typeof meta.regeneration_count !== 'number') return false;

  return true;
}

/**
 * Helper to create default AI metadata for a new lesson
 */
export function createDefaultAIMetadata(overrides?: Partial<AILessonMetadata>): AILessonMetadata {
  return {
    regeneration_count: 0,
    generated_at: new Date().toISOString(),
    ...overrides,
  };
}
