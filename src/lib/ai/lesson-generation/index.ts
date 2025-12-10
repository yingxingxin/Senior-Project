/**
 * Lesson Generation Module
 *
 * AI agent-based lesson generation system including:
 * - Full agent orchestration
 * - User personalization
 * - 3-level hierarchy (Course → Lessons → Sections)
 */

// Main lesson generator
export {
  generateAILessonWithFullAgent as generateAILesson,
  generateAILessonWithFullAgent,
  type GenerateLessonParams,
  type GenerateLessonResult,
} from './generator';

// Personalization
export {
  loadUserPersonalizationContext,
  createUserMetadataSnapshot,
  estimateLessonDuration,
  type UserPersonalizationContext,
} from './personalization';

// Agent system (for advanced usage)
export * from './agent';
