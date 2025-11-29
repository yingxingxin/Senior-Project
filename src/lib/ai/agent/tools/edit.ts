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
 * Plan tracking type for state feedback
 */
interface PlanLesson {
  title: string;
  slug: string;
  description: string;
  plannedSectionCount: number;
  createdSectionCount: number;
  created: boolean;
}

interface Plan {
  lessons: PlanLesson[];
  estimatedDuration: number;
  markdown: string;
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
After creating a lesson, use create_section with lesson_slug to add sections to it.
IMPORTANT: You must create a lesson before creating its sections.`,
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

      // Update plan tracking if plan exists
      const plan = context.conversationState.metadata.plan as Plan | undefined;
      if (plan) {
        const plannedLesson = plan.lessons.find(l => l.slug === slug);
        if (plannedLesson) {
          plannedLesson.created = true;
        }
      }

      // Build state feedback
      const lessonsCreated = plan?.lessons.filter(l => l.created).length || context.documentState.getLessonCount();
      const lessonsTotal = plan?.lessons.length || lessonsCreated;
      const sectionsCreated = plan?.lessons.reduce((sum, l) => sum + l.createdSectionCount, 0) || 0;
      const sectionsTotal = plan?.lessons.reduce((sum, l) => sum + l.plannedSectionCount, 0) || 0;

      const plannedLesson = plan?.lessons.find(l => l.slug === slug);
      const expectedSections = plannedLesson?.plannedSectionCount || 3;

      // Find remaining work
      const remainingLessons = plan?.lessons.filter(l => !l.created) || [];
      const incompleteLessons = plan?.lessons.filter(l => l.created && l.createdSectionCount < l.plannedSectionCount) || [];

      // Build remaining list
      let remainingText = '';
      if (incompleteLessons.length > 0) {
        remainingText = incompleteLessons.map(l => `- "${l.slug}": ${l.createdSectionCount}/${l.plannedSectionCount} sections`).join('\n');
      }
      if (remainingLessons.length > 0) {
        if (remainingText) remainingText += '\n\nLessons not yet created:\n';
        else remainingText = 'Lessons not yet created:\n';
        remainingText += remainingLessons.map(l => `- "${l.slug}"`).join('\n');
      }
      if (!remainingText) remainingText = 'None';

      return `Lesson "${title}" created (${slug}).

## Current State
- Lessons: ${lessonsCreated}/${lessonsTotal} created
- Sections: ${sectionsCreated}/${sectionsTotal} created

## Next Steps
Create ${expectedSections} sections for "${slug}" using create_section with lesson_slug="${slug}"

## Remaining
${remainingText}`;
    },
  });
}

/**
 * Create section tool - creates a new section within a SPECIFIC lesson (Level 3)
 *
 * Sections are what users navigate through with "Next" and "Previous" buttons.
 * Each section contains Tiptap content, written in Markdown.
 *
 * IMPORTANT: lesson_slug is REQUIRED to explicitly target a lesson.
 * This prevents the bug where sections would go to the wrong lesson.
 */
export function createCreateSectionTool(context: ToolExecutionContext) {
  return tool({
    description: `Create a section within a SPECIFIC lesson with Markdown content.
REQUIRED: lesson_slug must be provided to specify which lesson this section belongs to.
Sections are navigable content chunks within a lesson.

Write content in extended Markdown format:
- Standard Markdown: # headings, **bold**, *italic*, \`code\`, lists, code blocks
- Callouts: :::tip, :::warning, :::note, :::info (end with :::)
- Flip cards: ???Front text\\nBack text???
- Quizzes: [quiz: Question | Option A | Option B* | Option C]\\nExplanation (* marks correct)`,
    inputSchema: z.object({
      lesson_slug: z.string().describe('REQUIRED: The slug of the lesson this section belongs to'),
      title: z.string().describe('Section title (e.g., "Introduction")'),
      slug: z.string().describe('URL-friendly slug using lowercase letters, numbers, and hyphens only (e.g., "introduction")'),
      content: z.string().describe('Section content in extended Markdown format. Include headings, paragraphs, callouts, flip cards, quizzes, and code blocks as needed.'),
    }),
    execute: async ({ lesson_slug, title, slug, content }) => {
      // Find and switch to target lesson
      const targetLesson = context.documentState.getLessonBySlug(lesson_slug);
      if (!targetLesson) {
        const available = context.documentState.getAllLessons().map(l => l.slug).join(', ');
        return `Error: Lesson "${lesson_slug}" not found. Available: ${available || 'none (create a lesson first)'}`;
      }

      // Switch context to target lesson
      context.documentState.setCurrentLessonBySlug(lesson_slug);

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return 'Error: Slug must contain only lowercase letters, numbers, and hyphens. No spaces or special characters.';
      }

      // Check for duplicate slug within lesson
      if (context.documentState.getSectionBySlug(slug)) {
        return `Error: Section "${slug}" already exists in lesson "${lesson_slug}".`;
      }

      // Create section
      context.documentState.createSection(title, slug);

      // Parse Markdown to Tiptap JSON
      if (content?.trim()) {
        try {
          const parsedDoc = parseMarkdownToTiptap(content) as TiptapDocument;
          const validation = validateDocument(parsedDoc);
          if (validation.valid) {
            context.documentState.updateSectionDocument(slug, parsedDoc);
          }
        } catch {
          // Continue even if parse fails - section still created
        }
      }

      // Update plan tracking
      const plan = context.conversationState.metadata.plan as Plan | undefined;
      if (plan) {
        const plannedLesson = plan.lessons.find(l => l.slug === lesson_slug);
        if (plannedLesson) {
          plannedLesson.createdSectionCount++;
        }
      }

      // Build state feedback
      const currentLesson = context.documentState.getCurrentLesson();
      const sectionCount = currentLesson?.sections.length || 0;
      const plannedLesson = plan?.lessons.find(l => l.slug === lesson_slug);
      const expectedCount = plannedLesson?.plannedSectionCount || sectionCount;
      const lessonComplete = sectionCount >= expectedCount;

      const lessonsCreated = plan?.lessons.filter(l => l.created).length || context.documentState.getLessonCount();
      const lessonsTotal = plan?.lessons.length || lessonsCreated;
      const sectionsCreated = plan?.lessons.reduce((sum, l) => sum + l.createdSectionCount, 0) || sectionCount;
      const sectionsTotal = plan?.lessons.reduce((sum, l) => sum + l.plannedSectionCount, 0) || sectionsCreated;

      // Determine next steps
      let nextSteps = '';
      if (!lessonComplete) {
        const remaining = expectedCount - sectionCount;
        nextSteps = `Create ${remaining} more section(s) for "${lesson_slug}"`;
      } else {
        const nextLesson = plan?.lessons.find(l => !l.created);
        const incompleteLesson = plan?.lessons.find(l => l.created && l.createdSectionCount < l.plannedSectionCount);
        if (nextLesson) {
          nextSteps = `Create lesson "${nextLesson.slug}" using create_lesson`;
        } else if (incompleteLesson) {
          nextSteps = `Complete sections for "${incompleteLesson.slug}"`;
        } else {
          nextSteps = `All content complete! Call finish_with_summary`;
        }
      }

      // Find remaining work
      const incompleteLessons = plan?.lessons.filter(l =>
        l.created && l.createdSectionCount < l.plannedSectionCount
      ) || [];
      const uncreatedLessons = plan?.lessons.filter(l => !l.created) || [];

      // Build remaining text
      let remainingText = '';
      if (incompleteLessons.length > 0) {
        remainingText = incompleteLessons.map(l => `- "${l.slug}": ${l.createdSectionCount}/${l.plannedSectionCount} sections`).join('\n');
      }
      if (uncreatedLessons.length > 0) {
        if (remainingText) remainingText += '\n\nLessons not created:\n';
        else remainingText = 'Lessons not created:\n';
        remainingText += uncreatedLessons.map(l => `- "${l.slug}"`).join('\n');
      }
      if (!remainingText) remainingText = 'All lessons have enough sections';

      return `Section "${title}" created in "${lesson_slug}" [${sectionCount}/${expectedCount}]

## Current State
- Lessons: ${lessonsCreated}/${lessonsTotal} created
- Sections: ${sectionsCreated}/${sectionsTotal} created

## Next Steps
${nextSteps}

## Remaining
${remainingText}`;
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
