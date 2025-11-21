/**
 * AI Lesson Generation Module
 *
 * Central export point for all AI-powered lesson generation functionality.
 */

// Main lesson generator
export { generateAILesson, regenerateLessonSection, type GenerateLessonParams, type GenerateLessonResult } from './lesson-generator';

// Personalization
export {
  loadUserPersonalizationContext,
  createUserMetadataSnapshot,
  estimateLessonDuration,
  type UserPersonalizationContext,
} from './personalization';

// Prompt builders
export { buildLessonGenerationPrompt, buildSectionRegenerationPrompt } from './prompts/lesson-generation';
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
