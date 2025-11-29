/**
 * Edit Tools
 *
 * Tools for creating lessons and sections in the 3-level hierarchy.
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { ToolExecutionContext } from '../types';
import { validateDocument } from '../lib';
import { parseMarkdownToTiptap } from '../../tiptap';
import type { TiptapDocument } from '../../tiptap';

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
 * Each section contains Tiptap content, written in Markdown.
 */
export function createCreateSectionTool(context: ToolExecutionContext) {
  return tool({
    description: `Create a new section within the CURRENT lesson with Markdown content.
Sections are what users navigate through with "Next" button.
IMPORTANT: You must create a lesson first using create_lesson before creating sections.

Write content in extended Markdown format:
- Standard Markdown: # headings, **bold**, *italic*, \`code\`, lists, code blocks
- Callouts: :::tip, :::warning, :::note, :::info (end with :::)
- Flip cards: ???Front text\\nBack text???
- Quizzes: [quiz: Question | Option A | Option B* | Option C]\\nExplanation (* marks correct)`,
    inputSchema: z.object({
      title: z.string().describe('Section title (e.g., "Introduction")'),
      slug: z.string().describe('URL-friendly slug using lowercase letters, numbers, and hyphens only (e.g., "introduction")'),
      content: z.string().describe('Section content in extended Markdown format. Include headings, paragraphs, callouts, flip cards, quizzes, and code blocks as needed.'),
    }),
    execute: async ({ title, slug, content }) => {
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

      // Parse Markdown to Tiptap JSON
      if (content && content.trim().length > 0) {
        try {
          const parsedDoc = parseMarkdownToTiptap(content) as TiptapDocument;

          // Validate the parsed document
          const validation = validateDocument(parsedDoc);
          if (!validation.valid) {
            return `✓ Section created: "${title}" (slug: ${slug}) in lesson "${currentLesson.title}", but content validation failed: ${validation.errors.join(', ')}`;
          }

          // Update section document with parsed content
          context.documentState.updateSectionDocument(slug, parsedDoc);

          const sectionCount = context.documentState.getSectionCount();
          const nodeCount = parsedDoc.content?.length || 0;
          return `✓ Section ${sectionCount} created: "${title}" (slug: ${slug}) in lesson "${currentLesson.title}" with ${nodeCount} content block(s).`;
        } catch (error) {
          return `✓ Section created: "${title}" (slug: ${slug}) in lesson "${currentLesson.title}", but failed to parse Markdown: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }

      const sectionCount = context.documentState.getSectionCount();
      return `✓ Section ${sectionCount} created: "${title}" (slug: ${slug}) in lesson "${currentLesson.title}". This is now the active section.`;
    },
  });
}

/**
 * Create all edit tools with context
 */
export function createEditTools(context: ToolExecutionContext) {
  return {
    create_lesson: createCreateLessonTool(context),
    create_section: createCreateSectionTool(context),
  };
}
