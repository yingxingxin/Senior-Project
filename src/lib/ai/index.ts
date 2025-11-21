/**
 * AI Lesson Generation Module
 *
 * Central export point for all AI-powered lesson generation functionality.
 */

// Main lesson generator (Full AI Agent with iterative tools)
export {
  generateAILessonWithFullAgent as generateAILesson,
  generateAILessonWithFullAgent, // Also export with descriptive name
  type GenerateLessonParams,
  type GenerateLessonResult,
} from './lesson-generator-v3';

// AI Agent System (for advanced usage)
export * from './agent';

// Personalization
export {
  loadUserPersonalizationContext,
  createUserMetadataSnapshot,
  estimateLessonDuration,
  type UserPersonalizationContext,
} from './personalization';

// Persona prompt builders (used by agent)
export { buildPersonaInstruction, PERSONA_STYLES, PERSONA_EXAMPLE_OPENINGS, PERSONA_CALLOUT_USAGE } from './prompts/persona-prompts';

// Tiptap validation
export {
  validateTiptapJSON,
  sanitizeTiptapJSON,
  validateLessonContent,
  extractTextFromTiptap,
  countWordsInTiptap,
  type TiptapDocument,
  type TiptapBlockNode,
  type TiptapTextNode,
  TiptapDocumentSchema,
  BlockNodeSchema,
} from './tiptap-schema';
