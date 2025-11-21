/**
 * Edit Tools
 *
 * Tools for modifying the Tiptap document using diffs.
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { ToolExecutionContext } from '../types';
import { applyDiff, validateDocument } from '../diff-applier';

/**
 * Apply diff tool - main editing tool
 */
export function createApplyDiffTool(context: ToolExecutionContext) {
  return tool({
    description: 'Apply changes to the document by specifying what to delete and what to insert. Use beforeContent to locate where to make changes.',
    inputSchema: z.object({
      beforeContent: z.string().optional().describe('Text snippet that appears before the location where you want to make changes. Leave empty to append to end.'),
      deleteContent: z.string().optional().describe('Text content to delete (if any)'),
      insertContent: z.array(z.any()).describe('Array of Tiptap nodes to insert (headings, paragraphs, code blocks, etc.)'),
    }),
    execute: async ({ beforeContent, deleteContent, insertContent }) => {
      const currentDoc = context.documentState.getDocument();

      const result = applyDiff(
        currentDoc,
        beforeContent || null,
        deleteContent || null,
        insertContent
      );

      if (!result.success) {
        return result.message;
      }

      // Validate the updated document
      const validation = validateDocument(result.document);
      if (!validation.valid) {
        return `Document validation failed: ${validation.errors.join(', ')}`;
      }

      // Update document state
      context.documentState.updateDocument(result.document);

      return result.message;
    },
  });
}

/**
 * Replace document tool - replace entire document at once
 */
export function createReplaceDocumentTool(context: ToolExecutionContext) {
  return tool({
    description: 'Replace the entire document with new content. Use this to start fresh or rewrite completely.',
    inputSchema: z.object({
      newDocument: z.object({
        type: z.literal('doc'),
        content: z.array(z.any()),
      }).describe('Complete new Tiptap document'),
    }),
    execute: async ({ newDocument }) => {
      const validation = validateDocument(newDocument);

      if (!validation.valid) {
        return `Invalid document: ${validation.errors.join(', ')}`;
      }

      context.documentState.replaceDocument(newDocument);

      return `Document replaced with ${newDocument.content.length} top-level nodes`;
    },
  });
}

/**
 * Create all edit tools with context
 */
export function createEditTools(context: ToolExecutionContext) {
  return {
    apply_diff: createApplyDiffTool(context),
    replace_document: createReplaceDocumentTool(context),
  };
}
