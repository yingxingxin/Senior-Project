/**
 * Meta Tools
 *
 * Tools for planning, completion, and user interaction.
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { ToolExecutionContext } from '../types';

/**
 * Plan tool - create a structured plan for the course
 *
 * Creates a 3-level hierarchy:
 * - Level 1: Course (top-level container) - defined by course metadata
 * - Level 2: Lessons (navigable units within the course)
 * - Level 3: Sections (content chunks within a lesson, what users "Next" through)
 */
export function createPlanTool(context: ToolExecutionContext) {
  return tool({
    description: `Create a structured plan for building the course content. This defines the hierarchy:
- Course: The overall topic (e.g., "Mastering React Hooks")
- Lessons: Major topics within the course (2-4 lessons, shown on course overview page)
- Sections: Content chunks within each lesson (3-5 sections per lesson, what users navigate through with "Next")

Always use this as the FIRST step before creating any content.`,
    inputSchema: z.object({
      lessons: z.array(z.object({
        title: z.string().describe('Lesson title (e.g., "Understanding useState")'),
        slug: z.string().describe('URL-friendly slug (e.g., "understanding-usestate")'),
        description: z.string().describe('Brief description of what this lesson covers'),
        sections: z.array(z.object({
          title: z.string().describe('Section title'),
          slug: z.string().describe('URL-friendly slug for the section'),
          topics: z.array(z.string()).describe('Key topics to cover in this section'),
          interactiveElements: z.array(z.string()).describe('Interactive elements (callouts, code blocks, quizzes)'),
        })).min(3).max(5).describe('Sections within this lesson (3-5 sections per lesson)'),
      })).min(2).max(4).describe('Lessons within the course (2-4 lessons)'),
      estimatedDuration: z.number().describe('Estimated total duration in minutes'),
    }),
    execute: async ({ lessons, estimatedDuration }) => {
      // Count total sections
      const totalSections = lessons.reduce((sum, lesson) => sum + lesson.sections.length, 0);

      // Format the plan as markdown
      const planLines = [
        '# Course Plan',
        '',
        `**Estimated Duration:** ${estimatedDuration} minutes`,
        `**Total Lessons:** ${lessons.length}`,
        `**Total Sections:** ${totalSections}`,
        '',
      ];

      lessons.forEach((lesson, lessonIndex) => {
        planLines.push(`## Lesson ${lessonIndex + 1}: ${lesson.title}`);
        planLines.push(`**Slug:** ${lesson.slug}`);
        planLines.push(`**Description:** ${lesson.description}`);
        planLines.push('');
        planLines.push('**Sections:**');

        lesson.sections.forEach((section, sectionIndex) => {
          planLines.push(`  ${sectionIndex + 1}. **${section.title}** (${section.slug})`);
          planLines.push(`     Topics: ${section.topics.join(', ')}`);
          planLines.push(`     Interactive: ${section.interactiveElements.join(', ')}`);
        });
        planLines.push('');
      });

      const planMarkdown = planLines.join('\n');

      // Store plan with tracking info for progress monitoring
      // Each lesson tracks: created (bool), plannedSectionCount, createdSectionCount
      context.conversationState.metadata.plan = {
        lessons: lessons.map(lesson => ({
          title: lesson.title,
          slug: lesson.slug,
          description: lesson.description,
          plannedSectionCount: lesson.sections.length,
          createdSectionCount: 0,
          created: false,
        })),
        estimatedDuration,
        markdown: planMarkdown,
      };

      // Build full state feedback
      const remainingList = lessons.map(l => `- Lesson "${l.slug}" (${l.sections.length} sections)`).join('\n');

      return `Plan created with ${lessons.length} lessons and ${totalSections} sections.

${planMarkdown}

## Current State
- Lessons: 0/${lessons.length} created
- Sections: 0/${totalSections} created

## Next Steps
Create lesson "${lessons[0].slug}" using create_lesson

## Remaining
${remainingList}`;
    },
  });
}

/**
 * Finish with summary tool - marks task as completed
 */
export function createFinishWithSummaryTool(context: ToolExecutionContext) {
  return tool({
    description: 'Mark the lesson creation as complete and provide lesson metadata and summary. Use this as the final step after building all content.',
    inputSchema: z.object({
      lessonTitle: z.string().describe('Main lesson title (e.g., "Mastering React Hooks")'),
      lessonSlug: z.string().describe('URL-friendly lesson slug using lowercase letters, numbers, and hyphens only (e.g., "mastering-react-hooks")'),
      description: z.string().optional().describe('Short description of the lesson (1-2 sentences)'),
      summary: z.string().describe('Summary of the lesson content created'),
      wordCount: z.number().optional().describe('Approximate total word count'),
      sectionsCompleted: z.number().optional().describe('Number of sections completed'),
      interactiveElementsAdded: z.object({
        callouts: z.number().optional(),
        codeBlocks: z.number().optional(),
        quizzes: z.number().optional(),
        flipCards: z.number().optional(),
      }).optional().describe('Count of interactive elements added'),
    }),
    execute: async ({ lessonTitle, lessonSlug, description, summary, wordCount, sectionsCompleted, interactiveElementsAdded }) => {
      // Validate lesson slug format
      if (!/^[a-z0-9-]+$/.test(lessonSlug)) {
        return 'Error: lessonSlug must contain only lowercase letters, numbers, and hyphens. No spaces or special characters.';
      }

      // Validate no empty lessons - this is the key fix for the empty lessons bug
      const allLessons = context.documentState.getAllLessons();
      const emptyLessons = allLessons.filter(l => l.sections.length === 0);

      if (emptyLessons.length > 0) {
        // Get plan data for expected section counts
        const plan = context.conversationState.metadata.plan as {
          lessons: Array<{ slug: string; plannedSectionCount: number }>;
        } | undefined;

        const emptyLessonDetails = emptyLessons.map(l => {
          const planned = plan?.lessons.find(p => p.slug === l.slug);
          return `- "${l.slug}": 0/${planned?.plannedSectionCount || '?'} sections`;
        }).join('\n');

        return `Error: Cannot finish - ${emptyLessons.length} lesson(s) have 0 sections:
${emptyLessonDetails}

## Action Required
Create sections for each empty lesson using create_section with the appropriate lesson_slug.

Example: create_section with lesson_slug="${emptyLessons[0].slug}"`;
      }

      const summaryLines = [
        '# Lesson Creation Complete',
        '',
        `**Title:** ${lessonTitle}`,
        `**Slug:** ${lessonSlug}`,
        '',
        summary,
        '',
        '**Statistics:**',
      ];

      if (wordCount) {
        summaryLines.push(`- Word Count: ~${wordCount}`);
      }
      if (sectionsCompleted) {
        summaryLines.push(`- Sections: ${sectionsCompleted}`);
      }

      if (interactiveElementsAdded) {
        if (interactiveElementsAdded.callouts) {
          summaryLines.push(`- Callouts: ${interactiveElementsAdded.callouts}`);
        }
        if (interactiveElementsAdded.codeBlocks) {
          summaryLines.push(`- Code Blocks: ${interactiveElementsAdded.codeBlocks}`);
        }
        if (interactiveElementsAdded.quizzes) {
          summaryLines.push(`- Quizzes: ${interactiveElementsAdded.quizzes}`);
        }
        if (interactiveElementsAdded.flipCards) {
          summaryLines.push(`- Flip Cards: ${interactiveElementsAdded.flipCards}`);
        }
      }

      const formattedSummary = summaryLines.join('\n');

      // Store lesson metadata in conversation metadata
      context.conversationState.metadata.lessonTitle = lessonTitle;
      context.conversationState.metadata.lessonSlug = lessonSlug;
      context.conversationState.metadata.description = description || summary;
      context.conversationState.metadata.summary = summary;
      context.conversationState.metadata.finalSummary = {
        summary,
        wordCount,
        sectionsCompleted,
        interactiveElements: interactiveElementsAdded,
      };

      return formattedSummary;
    },
  });
}

/**
 * Create all meta tools with context
 */
export function createMetaTools(context: ToolExecutionContext) {
  return {
    plan: createPlanTool(context),
    finish_with_summary: createFinishWithSummaryTool(context),
  };
}
