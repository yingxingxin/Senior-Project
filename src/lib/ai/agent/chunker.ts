/**
 * Document Chunker
 *
 * Splits Tiptap documents into chunks for processing large documents.
 * Preserves node boundaries and structure integrity.
 */

import type { TiptapDocument, TiptapBlockNode } from '../tiptap-schema';
import type { DocumentChunk } from './types';

const DEFAULT_CHUNK_SIZE = 32000; // ~32k characters per chunk

/**
 * Count characters in a Tiptap node
 */
function countNodeCharacters(node: any): number {
  if (node.type === 'text') {
    return node.text?.length || 0;
  }

  if (node.content && Array.isArray(node.content)) {
    return node.content.reduce((sum: number, child: any) => sum + countNodeCharacters(child), 0);
  }

  return 0;
}

/**
 * Split Tiptap document into chunks
 *
 * Algorithm:
 * 1. Iterate through top-level nodes
 * 2. Accumulate nodes until chunk size is reached
 * 3. Create new chunk when size exceeded
 * 4. Preserve node boundaries (never split a node)
 */
export function chunkDocument(
  document: TiptapDocument,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  if (!document.content || document.content.length === 0) {
    // Empty document - return single empty chunk
    return [{
      index: 0,
      totalChunks: 1,
      content: { type: 'doc', content: [] },
      characterCount: 0,
      startNodeIndex: 0,
      endNodeIndex: 0,
    }];
  }

  let currentChunkNodes: any[] = [];
  let currentChunkCharCount = 0;
  let startNodeIndex = 0;

  document.content.forEach((node: any, nodeIndex: number) => {
    const nodeCharCount = countNodeCharacters(node);

    // If adding this node would exceed chunk size AND we have content, create chunk
    if (currentChunkCharCount + nodeCharCount > chunkSize && currentChunkNodes.length > 0) {
      chunks.push({
        index: chunks.length,
        totalChunks: 0, // Will be updated later
        content: {
          type: 'doc',
          content: currentChunkNodes,
        },
        characterCount: currentChunkCharCount,
        startNodeIndex,
        endNodeIndex: nodeIndex - 1,
      });

      // Start new chunk
      currentChunkNodes = [];
      currentChunkCharCount = 0;
      startNodeIndex = nodeIndex;
    }

    // Add node to current chunk
    currentChunkNodes.push(node);
    currentChunkCharCount += nodeCharCount;
  });

  // Add final chunk if it has content
  if (currentChunkNodes.length > 0) {
    chunks.push({
      index: chunks.length,
      totalChunks: 0,
      content: {
        type: 'doc',
        content: currentChunkNodes,
      },
      characterCount: currentChunkCharCount,
      startNodeIndex,
      endNodeIndex: document.content.length - 1,
    });
  }

  // Update totalChunks for all chunks
  const totalChunks = chunks.length;
  chunks.forEach(chunk => {
    chunk.totalChunks = totalChunks;
  });

  return chunks;
}

/**
 * Get a specific chunk by index
 */
export function getChunk(chunks: DocumentChunk[], index: number): DocumentChunk | null {
  if (index < 0 || index >= chunks.length) {
    return null;
  }
  return chunks[index];
}

/**
 * Get the full document from chunks
 */
export function mergeChunks(chunks: DocumentChunk[]): TiptapDocument {
  const allNodes: any[] = [];

  chunks.forEach(chunk => {
    if (chunk.content.content) {
      allNodes.push(...chunk.content.content);
    }
  });

  return {
    type: 'doc',
    content: allNodes,
  };
}

/**
 * Re-chunk document after modifications
 *
 * When the document is modified, we need to re-chunk it
 * to maintain proper chunk sizes.
 */
export function rechunkDocument(
  document: TiptapDocument,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): DocumentChunk[] {
  return chunkDocument(document, chunkSize);
}
