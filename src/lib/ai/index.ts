/**
 * AI Lesson Generation Module
 *
 * Central export point for all AI-powered lesson generation functionality.
 */

// Main lesson generator
export {
  generateAILessonWithFullAgent as generateAILesson,
  generateAILessonWithFullAgent, // Also export with original name for compatibility
  type GenerateLessonParams,
  type GenerateLessonResult,
} from './lesson-generator';

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
export { buildPersonaInstruction, PERSONA_STYLES, PERSONA_EXAMPLE_OPENINGS, PERSONA_CALLOUT_USAGE } from './prompts';

// Tiptap utilities (content processing)
export {
  validateTiptapJSON,
  sanitizeTiptapJSON,
  validateLessonContent,
  extractTextFromTiptap,
  countWordsInTiptap,
  parseMarkdownToTiptap,
  validateParsedContent,
  type TiptapDocument,
  type TiptapBlockNode,
  type TiptapTextNode,
  TiptapDocumentSchema,
  BlockNodeSchema,
} from './tiptap';
