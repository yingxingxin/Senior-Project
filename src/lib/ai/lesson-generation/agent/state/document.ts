/**
 * Document State Manager
 *
 * Manages the 3-level hierarchy: Course → Lessons → Sections
 */

import type { TiptapDocument, TiptapBlockNode } from '../../../tiptap';
import type { DocumentState as IDocumentState, Lesson, LessonSection } from '../types';

export class DocumentState implements IDocumentState {
  document: TiptapDocument;

  // Lesson management (Level 2)
  private lessons: Lesson[];
  private currentLessonIndex: number;

  // Section tracking within current lesson (Level 3)
  private currentSectionIndex: number;

  constructor() {
    this.document = { type: 'doc', content: [] };
    this.lessons = [];
    this.currentLessonIndex = -1;
    this.currentSectionIndex = -1;
  }

  /**
   * Initialize with an empty or existing document
   */
  initialize(document: TiptapDocument = { type: 'doc', content: [] }): void {
    this.document = document;
  }

  /**
   * Get full document
   */
  getDocument(): TiptapDocument {
    return this.document;
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
    const extractText = (node: TiptapBlockNode | { type: 'text'; text: string }): string => {
      if (node.type === 'text' && 'text' in node) {
        return node.text || '';
      }
      if ('content' in node && node.content && Array.isArray(node.content)) {
        return node.content.map((n) => extractText(n as TiptapBlockNode | { type: 'text'; text: string })).join('');
      }
      return '';
    };

    return this.document.content?.map(extractText).join('\n') || '';
  }

  /**
   * Clone the state (for checkpoints)
   */
  clone(): DocumentState {
    const cloned = new DocumentState();
    cloned.document = JSON.parse(JSON.stringify(this.document));
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
   * Set current lesson by slug (for explicit targeting)
   * Used by create_section to target a specific lesson.
   * Returns false if lesson not found.
   */
  setCurrentLessonBySlug(slug: string): boolean {
    const index = this.lessons.findIndex(l => l.slug === slug);
    if (index === -1) return false;
    this.currentLessonIndex = index;
    this.currentSectionIndex = -1;
    return true;
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
