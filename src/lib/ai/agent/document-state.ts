/**
 * Document State Manager
 *
 * Manages the current Tiptap document, lessons, and sections.
 * Supports the 3-level hierarchy: Course → Lessons → Sections
 */

import type { TiptapDocument } from '../tiptap-schema';
import type { DocumentChunk, DocumentState as IDocumentState, Lesson, LessonSection } from './types';
import { chunkDocument, getChunk, rechunkDocument } from './chunker';

const DEFAULT_CHUNK_SIZE = 32000;

export class DocumentState implements IDocumentState {
  document: TiptapDocument;
  chunks: DocumentChunk[];
  currentChunkIndex: number;
  chunkSize: number;

  // Lesson management (Level 2)
  private lessons: Lesson[];
  private currentLessonIndex: number;

  // Section tracking within current lesson (Level 3)
  private currentSectionIndex: number;

  constructor(chunkSize: number = DEFAULT_CHUNK_SIZE) {
    this.document = { type: 'doc', content: [] };
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.chunkSize = chunkSize;
    this.lessons = [];
    this.currentLessonIndex = -1;
    this.currentSectionIndex = -1;
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
    cloned.lessons = JSON.parse(JSON.stringify(this.lessons));
    cloned.currentLessonIndex = this.currentLessonIndex;
    cloned.currentSectionIndex = this.currentSectionIndex;
    return cloned;
  }

  // ============================================================================
  // Lesson Management Methods (Level 2)
  // ============================================================================

  /**
   * Create a new lesson (Level 2)
   */
  createLesson(title: string, slug: string, description: string = ''): void {
    const lesson: Lesson = {
      slug,
      title,
      description,
      orderIndex: this.lessons.length,
      sections: [],
    };

    this.lessons.push(lesson);
    this.currentLessonIndex = this.lessons.length - 1;
    this.currentSectionIndex = -1; // Reset section index for new lesson
  }

  /**
   * Get the current active lesson
   */
  getCurrentLesson(): Lesson | null {
    if (this.currentLessonIndex < 0 || this.currentLessonIndex >= this.lessons.length) {
      return null;
    }
    return this.lessons[this.currentLessonIndex];
  }

  /**
   * Get a lesson by slug
   */
  getLessonBySlug(slug: string): Lesson | null {
    return this.lessons.find(l => l.slug === slug) || null;
  }

  /**
   * Get all lessons
   */
  getAllLessons(): Lesson[] {
    return this.lessons;
  }

  /**
   * Check if any lessons exist
   */
  hasLessons(): boolean {
    return this.lessons.length > 0;
  }

  /**
   * Get lesson count
   */
  getLessonCount(): number {
    return this.lessons.length;
  }

  // ============================================================================
  // Section Management Methods (Level 3 - within current lesson)
  // ============================================================================

  /**
   * Create a new section within the current lesson
   */
  createSection(title: string, slug: string): void {
    const currentLesson = this.getCurrentLesson();
    if (!currentLesson) {
      throw new Error('No active lesson. Create a lesson first using create_lesson.');
    }

    const section: LessonSection = {
      slug,
      title,
      orderIndex: currentLesson.sections.length,
      document: { type: 'doc', content: [] },
    };

    currentLesson.sections.push(section);
    this.currentSectionIndex = currentLesson.sections.length - 1;
  }

  /**
   * Get the current active section (within current lesson)
   */
  getCurrentSection(): LessonSection | null {
    const currentLesson = this.getCurrentLesson();
    if (!currentLesson) {
      return null;
    }
    if (this.currentSectionIndex < 0 || this.currentSectionIndex >= currentLesson.sections.length) {
      return null;
    }
    return currentLesson.sections[this.currentSectionIndex];
  }

  /**
   * Get a section by slug (within current lesson)
   */
  getSectionBySlug(slug: string): LessonSection | null {
    const currentLesson = this.getCurrentLesson();
    if (!currentLesson) {
      return null;
    }
    return currentLesson.sections.find(s => s.slug === slug) || null;
  }

  /**
   * Get the document for a specific section (within current lesson)
   */
  getSectionDocument(slug: string): TiptapDocument {
    const section = this.getSectionBySlug(slug);
    if (!section) {
      throw new Error(`Section not found: ${slug}`);
    }
    return section.document;
  }

  /**
   * Update a section's document (within current lesson)
   */
  updateSectionDocument(slug: string, document: TiptapDocument): void {
    const currentLesson = this.getCurrentLesson();
    if (!currentLesson) {
      throw new Error('No active lesson.');
    }
    const section = currentLesson.sections.find(s => s.slug === slug);
    if (!section) {
      throw new Error(`Section not found: ${slug}`);
    }
    section.document = document;
  }

  /**
   * Get all sections (within current lesson)
   */
  getAllSections(): LessonSection[] {
    const currentLesson = this.getCurrentLesson();
    if (!currentLesson) {
      return [];
    }
    return currentLesson.sections;
  }

  /**
   * Check if any sections exist (within current lesson)
   */
  hasSections(): boolean {
    const currentLesson = this.getCurrentLesson();
    return currentLesson ? currentLesson.sections.length > 0 : false;
  }

  /**
   * Get section count (within current lesson)
   */
  getSectionCount(): number {
    const currentLesson = this.getCurrentLesson();
    return currentLesson ? currentLesson.sections.length : 0;
  }
}
