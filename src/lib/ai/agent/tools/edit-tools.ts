/**
 * Edit Tools
 *
 * Tools for modifying the Tiptap document using diffs.
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { AgentTool, ToolExecutionContext, ToolResult } from '../types';
import { applyDiff, validateDocument } from '../diff-applier';

/**
 * Apply diff tool - main editing tool
 */
export function createApplyDiffTool(): AgentTool {
  return {
    name: 'apply_diff',
    description: 'Apply changes to the document by specifying what to delete and what to insert. Use beforeContent to locate where to make changes.',
    parameters: z.object({
      beforeContent: z.string().optional().describe('Text snippet that appears before the location where you want to make changes. Leave empty to append to end.'),
      deleteContent: z.string().optional().describe('Text content to delete (if any)'),
      insertContent: z.array(z.any()).describe('Array of Tiptap nodes to insert (headings, paragraphs, code blocks, etc.)'),
    }),
    execute: async (
      args: {
        beforeContent?: string;
        deleteContent?: string;
        insertContent: any[];
      },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      const currentDoc = context.documentState.getDocument();

      const result = applyDiff(
        currentDoc,
        args.beforeContent || null,
        args.deleteContent || null,
        args.insertContent
      );

      if (!result.success) {
        return {
          success: false,
          result: result.message,
        };
      }

      // Validate the updated document
      const validation = validateDocument(result.document);
      if (!validation.valid) {
        return {
          success: false,
          result: `Document validation failed: ${validation.errors.join(', ')}`,
        };
      }

      // Update document state
      context.documentState.updateDocument(result.document);

      return {
        success: true,
        result: result.message,
        metadata: {
          nodesInserted: args.insertContent.length,
          documentSize: result.document.content?.length || 0,
        },
      };
    },
  };
}

/**
 * Replace document tool - replace entire document at once
 */
export function createReplaceDocumentTool(): AgentTool {
  return {
    name: 'replace_document',
    description: 'Replace the entire document with new content. Use this to start fresh or rewrite completely.',
    parameters: z.object({
      newDocument: z.object({
        type: z.literal('doc'),
        content: z.array(z.any()),
      }).describe('Complete new Tiptap document'),
    }),
    execute: async (
      args: {
        newDocument: { type: 'doc'; content: any[] };
      },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      const validation = validateDocument(args.newDocument);

      if (!validation.valid) {
        return {
          success: false,
          result: `Invalid document: ${validation.errors.join(', ')}`,
        };
      }

      context.documentState.replaceDocument(args.newDocument);

      return {
        success: true,
        result: `Document replaced with ${args.newDocument.content.length} top-level nodes`,
        metadata: {
          nodeCount: args.newDocument.content.length,
        },
      };
    },
  };
}

/**
 * All edit tools
 */
export const editTools = {
  apply_diff: createApplyDiffTool(),
  replace_document: createReplaceDocumentTool(),
};
