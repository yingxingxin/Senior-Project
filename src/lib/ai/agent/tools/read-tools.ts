/**
 * Read Tools
 *
 * Tools for reading and navigating document chunks.
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { AgentTool, ToolExecutionContext, ToolResult } from '../types';

/**
 * Serialize Tiptap document chunk to text for AI
 */
function serializeChunkForAI(chunk: any): string {
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
export function createReadFirstChunkTool(): AgentTool {
  return {
    name: 'read_first_chunk',
    description: 'Start reading the document from the beginning. Returns the first chunk of content.',
    parameters: z.object({}),
    execute: async (args: {}, context: ToolExecutionContext): Promise<ToolResult> => {
      const chunk = context.documentState.readFirstChunk();

      if (!chunk) {
        return {
          success: false,
          result: 'Document is empty',
        };
      }

      return {
        success: true,
        result: serializeChunkForAI(chunk),
        metadata: {
          chunkIndex: chunk.index,
          totalChunks: chunk.totalChunks,
          characterCount: chunk.characterCount,
        },
      };
    },
  };
}

/**
 * Read next chunk tool
 */
export function createReadNextChunkTool(): AgentTool {
  return {
    name: 'read_next_chunk',
    description: 'Navigate to and read the next chunk of the document. Use this after reading the first chunk to continue reading.',
    parameters: z.object({}),
    execute: async (args: {}, context: ToolExecutionContext): Promise<ToolResult> => {
      const chunk = context.documentState.readNextChunk();

      if (!chunk) {
        const currentChunk = context.documentState.getCurrentChunk();
        return {
          success: false,
          result: `Already at the last chunk (${currentChunk?.index + 1} of ${currentChunk?.totalChunks})`,
        };
      }

      return {
        success: true,
        result: serializeChunkForAI(chunk),
        metadata: {
          chunkIndex: chunk.index,
          totalChunks: chunk.totalChunks,
          characterCount: chunk.characterCount,
        },
      };
    },
  };
}

/**
 * Read previous chunk tool
 */
export function createReadPreviousChunkTool(): AgentTool {
  return {
    name: 'read_previous_chunk',
    description: 'Navigate to and read the previous chunk of the document. Use this to go back and review earlier content.',
    parameters: z.object({}),
    execute: async (args: {}, context: ToolExecutionContext): Promise<ToolResult> => {
      const chunk = context.documentState.readPreviousChunk();

      if (!chunk) {
        return {
          success: false,
          result: 'Already at the first chunk',
        };
      }

      return {
        success: true,
        result: serializeChunkForAI(chunk),
        metadata: {
          chunkIndex: chunk.index,
          totalChunks: chunk.totalChunks,
          characterCount: chunk.characterCount,
        },
      };
    },
  };
}

/**
 * All read tools
 */
export const readTools = {
  read_first_chunk: createReadFirstChunkTool(),
  read_next_chunk: createReadNextChunkTool(),
  read_previous_chunk: createReadPreviousChunkTool(),
};
