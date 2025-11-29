/**
 * Tiptap Content Processing
 *
 * Utilities for parsing Markdown to Tiptap JSON, validating content,
 * and server-safe extensions for Node.js environments.
 */

// Parser - Markdown to Tiptap JSON conversion
export { parseMarkdownToTiptap, validateParsedContent } from './parser';

// Schema validation
export {
  validateTiptapJSON,
  sanitizeTiptapJSON,
  extractTextFromTiptap,
  countWordsInTiptap,
  validateLessonContent,
  TiptapDocumentSchema,
  BlockNodeSchema,
} from './schema';
export type { TiptapDocument, TiptapBlockNode, TiptapTextNode } from './schema';

// Server extensions (for advanced usage)
export { getServerExtensions } from './extensions';
