/**
 * Lesson Generation Module
 *
 * AI agent-based lesson generation system including:
 * - Full agent orchestration (sequential v3)
 * - Parallel flow with planning (v4)
 * - User personalization
 * - 3-level hierarchy (Course → Lessons → Sections)
 */

// Main lesson generator (sequential v3 agent)
export {
  generateAILessonWithFullAgent as generateAILesson,
  generateAILessonWithFullAgent,
  type GenerateLessonParams,
  type GenerateLessonResult,
} from './generator';

// Course planner (for parallel flow)
export {
  planCourse,
  type CoursePlan,
  type PlanCourseParams,
} from './planner';

// Single lesson generator (for parallel flow)
export {
  generateSingleLesson,
  type GenerateSingleLessonParams,
  type SingleLessonResult,
  type GeneratedSection,
  type SectionSpec,
} from './single-lesson-generator';

// Personalization
export {
  loadUserPersonalizationContext,
  createUserMetadataSnapshot,
  estimateLessonDuration,
  type UserPersonalizationContext,
} from './personalization';

// Agent system (for advanced usage)
export * from './agent';
