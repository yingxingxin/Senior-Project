/**
 * Read Tools
 *
 * Tools for reading and navigating document chunks.
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { ToolExecutionContext, DocumentChunk } from '../types';

/**
 * Serialize Tiptap document chunk to text for AI
 */
function serializeChunkForAI(chunk: DocumentChunk | null): string {
  if (!chunk || !chunk.content || !chunk.content.content) {
    return '[Empty chunk]';
  }

  const lines: string[] = [];
  lines.push(`=== Chunk ${chunk.index + 1} of ${chunk.totalChunks} ===`);
  lines.push(`Characters: ${chunk.characterCount}`);
  lines.push('');
  lines.push('Content (Tiptap JSON):');
  lines.push(JSON.stringify(chunk.content, null, 2));
  lines.push('');

  return lines.join('\n');
}

/**
 * Read first chunk tool
 */
export function createReadFirstChunkTool(context: ToolExecutionContext) {
  return tool({
    description: 'Start reading the document from the beginning. Returns the first chunk of content.',
    inputSchema: z.object({}),
    execute: async () => {
      const chunk = context.documentState.readFirstChunk();

      if (!chunk) {
        return 'Document is empty';
      }

      return serializeChunkForAI(chunk);
    },
  });
}

/**
 * Read next chunk tool
 */
export function createReadNextChunkTool(context: ToolExecutionContext) {
  return tool({
    description: 'Navigate to and read the next chunk of the document. Use this after reading the first chunk to continue reading.',
    inputSchema: z.object({}),
    execute: async () => {
      const chunk = context.documentState.readNextChunk();

      if (!chunk) {
        const currentChunk = context.documentState.getCurrentChunk();
        return `Already at the last chunk (${(currentChunk?.index ?? 0) + 1} of ${currentChunk?.totalChunks ?? 1})`;
      }

      return serializeChunkForAI(chunk);
    },
  });
}

/**
 * Read previous chunk tool
 */
export function createReadPreviousChunkTool(context: ToolExecutionContext) {
  return tool({
    description: 'Navigate to and read the previous chunk of the document. Use this to go back and review earlier content.',
    inputSchema: z.object({}),
    execute: async () => {
      const chunk = context.documentState.readPreviousChunk();

      if (!chunk) {
        return 'Already at the first chunk';
      }

      return serializeChunkForAI(chunk);
    },
  });
}

/**
 * Create all read tools with context
 */
export function createReadTools(context: ToolExecutionContext) {
  return {
    read_first_chunk: createReadFirstChunkTool(context),
    read_next_chunk: createReadNextChunkTool(context),
    read_previous_chunk: createReadPreviousChunkTool(context),
  };
}
