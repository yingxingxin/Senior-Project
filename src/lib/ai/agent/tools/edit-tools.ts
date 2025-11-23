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
 * Create lesson tool - creates a new lesson (Level 2 in the hierarchy)
 *
 * Lessons are the navigable units that appear on the course overview page.
 * Each lesson contains multiple sections (Level 3).
 */
export function createCreateLessonTool(context: ToolExecutionContext) {
  return tool({
    description: `Create a new lesson within the course. Lessons are shown on the course overview page as clickable cards.
After creating a lesson, use create_section to add sections within it.
IMPORTANT: You must create a lesson before creating sections.`,
    inputSchema: z.object({
      title: z.string().describe('Lesson title (e.g., "Understanding useState")'),
      slug: z.string().describe('URL-friendly slug using lowercase letters, numbers, and hyphens only (e.g., "understanding-usestate")'),
      description: z.string().optional().describe('Brief description of what this lesson covers'),
    }),
    execute: async ({ title, slug, description }) => {
      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return 'Error: Slug must contain only lowercase letters, numbers, and hyphens. No spaces or special characters.';
      }

      // Check for duplicate slug
      if (context.documentState.getLessonBySlug(slug)) {
        return `Error: A lesson with slug "${slug}" already exists. Choose a different slug.`;
      }

      context.documentState.createLesson(title, slug, description || '');

      const lessonCount = context.documentState.getLessonCount();
      return `✓ Lesson ${lessonCount} created: "${title}" (slug: ${slug}). This is now the active lesson. Create sections within it using create_section.`;
    },
  });
}

/**
 * Create section tool - creates a new section within the current lesson (Level 3)
 *
 * Sections are what users navigate through with "Next" and "Previous" buttons.
 * Each section contains Tiptap content.
 */
export function createCreateSectionTool(context: ToolExecutionContext) {
  return tool({
    description: `Create a new section within the CURRENT lesson. Sections are what users navigate through with "Next" button.
IMPORTANT: You must create a lesson first using create_lesson before creating sections.
Optionally provide initialContent to populate the section immediately (recommended).`,
    inputSchema: z.object({
      title: z.string().describe('Section title (e.g., "Introduction")'),
      slug: z.string().describe('URL-friendly slug using lowercase letters, numbers, and hyphens only (e.g., "introduction")'),
      initialContent: z.array(z.any()).optional().describe('Optional: Array of Tiptap nodes to immediately add to the section (headings, paragraphs, code blocks, etc.). Recommended to include all section content here to avoid a separate edit_section call.'),
    }),
    execute: async ({ title, slug, initialContent }) => {
      // Check if there's an active lesson
      const currentLesson = context.documentState.getCurrentLesson();
      if (!currentLesson) {
        return 'Error: No active lesson. Create a lesson first using create_lesson.';
      }

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return 'Error: Slug must contain only lowercase letters, numbers, and hyphens. No spaces or special characters.';
      }

      // Check for duplicate slug within current lesson
      if (context.documentState.getSectionBySlug(slug)) {
        return `Error: A section with slug "${slug}" already exists in the current lesson. Choose a different slug.`;
      }

      context.documentState.createSection(title, slug);

      // If initial content provided, add it immediately
      if (initialContent && initialContent.length > 0) {
        const currentDoc = context.documentState.getSectionDocument(slug);
        const result = applyDiff(currentDoc, null, null, initialContent);

        if (!result.success) {
          return `✓ Section created: "${title}" (slug: ${slug}) in lesson "${currentLesson.title}", but failed to add initial content: ${result.message}`;
        }

        context.documentState.updateSectionDocument(slug, result.document);
        const sectionCount = context.documentState.getSectionCount();
        return `✓ Section ${sectionCount} created: "${title}" (slug: ${slug}) in lesson "${currentLesson.title}" with ${initialContent.length} initial node(s).`;
      }

      const sectionCount = context.documentState.getSectionCount();
      return `✓ Section ${sectionCount} created: "${title}" (slug: ${slug}) in lesson "${currentLesson.title}". This is now the active section. Use edit_section to add content.`;
    },
  });
}

/**
 * Edit section tool - edits the current active section
 */
export function createEditSectionTool(context: ToolExecutionContext) {
  return tool({
    description: 'Edit the current active section by applying changes. Use beforeContent to locate where to insert content.',
    inputSchema: z.object({
      beforeContent: z.string().optional().describe('Text snippet that appears before where you want to insert. Leave empty to append to end.'),
      deleteContent: z.string().optional().describe('Text content to delete (if any)'),
      insertContent: z.array(z.any()).describe('Array of Tiptap nodes to insert (headings, paragraphs, code blocks, etc.)'),
    }),
    execute: async ({ beforeContent, deleteContent, insertContent }) => {
      const currentSection = context.documentState.getCurrentSection();

      if (!currentSection) {
        return 'Error: No active section. Create a section first using create_section.';
      }

      const currentDoc = context.documentState.getSectionDocument(currentSection.slug);

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

      // Update section document
      context.documentState.updateSectionDocument(currentSection.slug, result.document);

      return `✓ ${result.message} (Section: "${currentSection.title}")`;
    },
  });
}

/**
 * Create all edit tools with context
 */
export function createEditTools(context: ToolExecutionContext) {
  return {
    // 3-level hierarchy tools (primary workflow)
    create_lesson: createCreateLessonTool(context),  // Level 2: Lessons
    create_section: createCreateSectionTool(context), // Level 3: Sections
    edit_section: createEditSectionTool(context),
    // Legacy document tools (keep for backward compatibility)
    apply_diff: createApplyDiffTool(context),
    replace_document: createReplaceDocumentTool(context),
  };
}
