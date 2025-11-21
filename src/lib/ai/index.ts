/**
 * AI Lesson Generation Module
 *
 * Central export point for all AI-powered lesson generation functionality.
 */

// Main lesson generator (Full AI Agent with iterative tools - v3)
export {
  generateAILessonWithFullAgent,
  type GenerateLessonParams,
  type GenerateLessonResult,
} from './lesson-generator-v3';

// Alternative: Simplified agent (v2 - single tool call)
export {
  generateAILessonWithAgent,
} from './lesson-generator-v2';

// Legacy generator (deprecated - single-call JSON generation)
// Kept for backward compatibility, will be removed in future release
export {
  generateAILesson as generateAILessonLegacy,
  regenerateLessonSection,
} from './lesson-generator';

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
