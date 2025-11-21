/**
 * Document State Manager
 *
 * Manages the current Tiptap document, its chunks, and navigation.
 */

import type { TiptapDocument } from '../tiptap-schema';
import type { DocumentChunk, DocumentState as IDocumentState } from './types';
import { chunkDocument, getChunk, mergeChunks, rechunkDocument } from './chunker';

const DEFAULT_CHUNK_SIZE = 32000;

export class DocumentState implements IDocumentState {
  document: TiptapDocument;
  chunks: DocumentChunk[];
  currentChunkIndex: number;
  chunkSize: number;

  constructor(chunkSize: number = DEFAULT_CHUNK_SIZE) {
    this.document = { type: 'doc', content: [] };
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.chunkSize = chunkSize;
  }

  /**
   * Initialize with an empty or existing document
   */
  initialize(document: TiptapDocument = { type: 'doc', content: [] }): void {
    this.document = document;
    this.chunks = chunkDocument(document, this.chunkSize);
    this.currentChunkIndex = 0;
  }

  /**
   * Get the current chunk
   */
  getCurrentChunk(): DocumentChunk | null {
    return getChunk(this.chunks, this.currentChunkIndex);
  }

  /**
   * Navigate to first chunk
   */
  readFirstChunk(): DocumentChunk | null {
    this.currentChunkIndex = 0;
    return this.getCurrentChunk();
  }

  /**
   * Navigate to next chunk
   */
  readNextChunk(): DocumentChunk | null {
    if (this.currentChunkIndex < this.chunks.length - 1) {
      this.currentChunkIndex++;
      return this.getCurrentChunk();
    }
    return null;
  }

  /**
   * Navigate to previous chunk
   */
  readPreviousChunk(): DocumentChunk | null {
    if (this.currentChunkIndex > 0) {
      this.currentChunkIndex--;
      return this.getCurrentChunk();
    }
    return null;
  }

  /**
   * Replace entire document
   */
  replaceDocument(newDocument: TiptapDocument): void {
    this.document = newDocument;
    this.chunks = rechunkDocument(newDocument, this.chunkSize);
    this.currentChunkIndex = 0;
  }

  /**
   * Update document (used after apply_diff)
   */
  updateDocument(updatedDocument: TiptapDocument): void {
    this.document = updatedDocument;
    // Re-chunk after modification
    const oldChunkIndex = this.currentChunkIndex;
    this.chunks = rechunkDocument(updatedDocument, this.chunkSize);

    // Try to maintain similar chunk position
    // If old index is out of bounds, go to last chunk
    this.currentChunkIndex = Math.min(oldChunkIndex, this.chunks.length - 1);
  }

  /**
   * Get full document
   */
  getDocument(): TiptapDocument {
    return this.document;
  }

  /**
   * Get chunk information for display
   */
  getChunkInfo(): {
    currentIndex: number;
    totalChunks: number;
    currentCharCount: number;
    totalCharCount: number;
  } {
    const currentChunk = this.getCurrentChunk();
    const totalCharCount = this.chunks.reduce((sum, chunk) => sum + chunk.characterCount, 0);

    return {
      currentIndex: this.currentChunkIndex,
      totalChunks: this.chunks.length,
      currentCharCount: currentChunk?.characterCount || 0,
      totalCharCount,
    };
  }

  /**
   * Check if document is empty
   */
  isEmpty(): boolean {
    return !this.document.content || this.document.content.length === 0;
  }

  /**
   * Get document as text (for debugging)
   */
  getDocumentText(): string {
    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || '';
      }
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('');
      }
      return '';
    };

    return this.document.content?.map(extractText).join('\n') || '';
  }

  /**
   * Clone the state (for checkpoints)
   */
  clone(): DocumentState {
    const cloned = new DocumentState(this.chunkSize);
    cloned.document = JSON.parse(JSON.stringify(this.document));
    cloned.chunks = JSON.parse(JSON.stringify(this.chunks));
    cloned.currentChunkIndex = this.currentChunkIndex;
    return cloned;
  }
}
