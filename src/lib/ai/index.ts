/**
 * AI Module
 *
 * Central export point for all AI functionality:
 * - Chat service (general AI chat)
 * - Lesson generation (AI agent-based)
 * - Profile assistant
 * - Prompts and personas
 * - Content processing (Tiptap)
 */

// Chat functionality (general AI)
export * from './chat';

// Lesson generation (agent-based)
export * from './lesson-generation';

// Profile assistant
export * from './profiles';

// Persona prompt builders (shared)
export { buildPersonaInstruction, PERSONA_STYLES, PERSONA_EXAMPLE_OPENINGS, PERSONA_CALLOUT_USAGE } from './prompts';

// Tiptap utilities (content processing - shared)
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
