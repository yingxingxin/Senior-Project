/**
 * Meta Tools
 *
 * Tools for planning, completion, and user interaction.
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { ToolExecutionContext } from '../types';

/**
 * Plan tool - create a structured plan for the lesson
 */
export function createPlanTool(context: ToolExecutionContext) {
  return tool({
    description: 'Create a structured plan for building the lesson. Outline the sections and content you will create. Always use this as the first step.',
    inputSchema: z.object({
      sections: z.array(z.object({
        title: z.string().describe('Section title'),
        topics: z.array(z.string()).describe('Key topics to cover'),
        interactiveElements: z.array(z.string()).describe('Interactive elements to include (callouts, code blocks, quizzes, etc.)'),
        estimatedLength: z.string().describe('Estimated length (e.g., "2 paragraphs", "3 code examples")'),
      })).describe('Ordered list of lesson sections to create'),
      estimatedDuration: z.number().describe('Estimated total duration in minutes'),
    }),
    execute: async ({ sections, estimatedDuration }) => {
      // Format the plan as markdown
      const planLines = [
        '# Lesson Plan',
        '',
        `**Estimated Duration:** ${estimatedDuration} minutes`,
        `**Total Sections:** ${sections.length}`,
        '',
      ];

      sections.forEach((section, index) => {
        planLines.push(`## ${index + 1}. ${section.title}`);
        planLines.push(`**Topics:** ${section.topics.join(', ')}`);
        planLines.push(`**Interactive:** ${section.interactiveElements.join(', ')}`);
        planLines.push(`**Length:** ${section.estimatedLength}`);
        planLines.push('');
      });

      const planMarkdown = planLines.join('\n');

      // Store plan in conversation metadata
      context.conversationState.metadata.plan = {
        sections,
        estimatedDuration,
        markdown: planMarkdown,
      };

      return `Plan created with ${sections.length} sections:\n\n${planMarkdown}`;
    },
  });
}

/**
 * Finish with summary tool - marks task as completed
 */
export function createFinishWithSummaryTool(context: ToolExecutionContext) {
  return tool({
    description: 'Mark the lesson creation as complete and provide a summary of what was created. Use this as the final step after building all content.',
    inputSchema: z.object({
      summary: z.string().describe('Summary of the lesson content created'),
      wordCount: z.number().describe('Approximate total word count'),
      sectionsCompleted: z.number().describe('Number of sections completed'),
      interactiveElementsAdded: z.object({
        callouts: z.number().optional(),
        codeBlocks: z.number().optional(),
        quizzes: z.number().optional(),
        flipCards: z.number().optional(),
      }).describe('Count of interactive elements added'),
    }),
    execute: async ({ summary, wordCount, sectionsCompleted, interactiveElementsAdded }) => {
      const summaryLines = [
        '# Lesson Creation Complete',
        '',
        summary,
        '',
        '**Statistics:**',
        `- Word Count: ~${wordCount}`,
        `- Sections: ${sectionsCompleted}`,
      ];

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

      const formattedSummary = summaryLines.join('\n');

      // Store summary in conversation metadata
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
 * Ask user tool - ask clarifying questions (future feature)
 */
export function createAskUserTool(context: ToolExecutionContext) {
  return tool({
    description: 'Ask the user a clarifying question if the requirements are unclear. Note: In current implementation, this will use reasonable defaults.',
    inputSchema: z.object({
      question: z.string().describe('The question to ask the user'),
      suggestedDefault: z.string().describe('Suggested default answer if user does not respond'),
    }),
    execute: async ({ question, suggestedDefault }) => {
      // In current implementation, we just use the default
      // In future, this could pause execution and wait for user input

      return `Question noted: "${question}". Using default: "${suggestedDefault}"`;
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
    ask_user: createAskUserTool(context),
  };
}
