/**
 * Meta Tools
 *
 * Tools for planning, completion, and user interaction.
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { AgentTool, ToolExecutionContext, ToolResult } from '../types';

/**
 * Plan tool - create a structured plan for the lesson
 */
export function createPlanTool(): AgentTool {
  return {
    name: 'plan',
    description: 'Create a structured plan for building the lesson. Outline the sections and content you will create. Always use this as the first step.',
    parameters: z.object({
      sections: z.array(z.object({
        title: z.string().describe('Section title'),
        topics: z.array(z.string()).describe('Key topics to cover'),
        interactiveElements: z.array(z.string()).describe('Interactive elements to include (callouts, code blocks, quizzes, etc.)'),
        estimatedLength: z.string().describe('Estimated length (e.g., "2 paragraphs", "3 code examples")'),
      })).describe('Ordered list of lesson sections to create'),
      estimatedDuration: z.number().describe('Estimated total duration in minutes'),
    }),
    execute: async (
      args: {
        sections: Array<{
          title: string;
          topics: string[];
          interactiveElements: string[];
          estimatedLength: string;
        }>;
        estimatedDuration: number;
      },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      // Format the plan as markdown
      const planLines = [
        '# Lesson Plan',
        '',
        `**Estimated Duration:** ${args.estimatedDuration} minutes`,
        `**Total Sections:** ${args.sections.length}`,
        '',
      ];

      args.sections.forEach((section, index) => {
        planLines.push(`## ${index + 1}. ${section.title}`);
        planLines.push(`**Topics:** ${section.topics.join(', ')}`);
        planLines.push(`**Interactive:** ${section.interactiveElements.join(', ')}`);
        planLines.push(`**Length:** ${section.estimatedLength}`);
        planLines.push('');
      });

      const planMarkdown = planLines.join('\n');

      // Store plan in conversation metadata
      context.conversationState.metadata.plan = {
        sections: args.sections,
        estimatedDuration: args.estimatedDuration,
        markdown: planMarkdown,
      };

      return {
        success: true,
        result: `Plan created with ${args.sections.length} sections:\n\n${planMarkdown}`,
        metadata: {
          sectionCount: args.sections.length,
          estimatedDuration: args.estimatedDuration,
        },
      };
    },
  };
}

/**
 * Finish with summary tool - marks task as completed
 */
export function createFinishWithSummaryTool(): AgentTool {
  return {
    name: 'finish_with_summary',
    description: 'Mark the lesson creation as complete and provide a summary of what was created. Use this as the final step after building all content.',
    parameters: z.object({
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
    isFinal: true, // This marks the agent run as complete
    execute: async (
      args: {
        summary: string;
        wordCount: number;
        sectionsCompleted: number;
        interactiveElementsAdded: {
          callouts?: number;
          codeBlocks?: number;
          quizzes?: number;
          flipCards?: number;
        };
      },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      const summaryLines = [
        '# Lesson Creation Complete',
        '',
        args.summary,
        '',
        '**Statistics:**',
        `- Word Count: ~${args.wordCount}`,
        `- Sections: ${args.sectionsCompleted}`,
      ];

      if (args.interactiveElementsAdded.callouts) {
        summaryLines.push(`- Callouts: ${args.interactiveElementsAdded.callouts}`);
      }
      if (args.interactiveElementsAdded.codeBlocks) {
        summaryLines.push(`- Code Blocks: ${args.interactiveElementsAdded.codeBlocks}`);
      }
      if (args.interactiveElementsAdded.quizzes) {
        summaryLines.push(`- Quizzes: ${args.interactiveElementsAdded.quizzes}`);
      }
      if (args.interactiveElementsAdded.flipCards) {
        summaryLines.push(`- Flip Cards: ${args.interactiveElementsAdded.flipCards}`);
      }

      const formattedSummary = summaryLines.join('\n');

      // Store summary in conversation metadata
      context.conversationState.metadata.finalSummary = {
        summary: args.summary,
        wordCount: args.wordCount,
        sectionsCompleted: args.sectionsCompleted,
        interactiveElements: args.interactiveElementsAdded,
      };

      return {
        success: true,
        result: formattedSummary,
        metadata: {
          wordCount: args.wordCount,
          sectionsCompleted: args.sectionsCompleted,
          completed: true,
        },
      };
    },
  };
}

/**
 * Ask user tool - ask clarifying questions (future feature)
 */
export function createAskUserTool(): AgentTool {
  return {
    name: 'ask_user',
    description: 'Ask the user a clarifying question if the requirements are unclear. Note: In current implementation, this will use reasonable defaults.',
    parameters: z.object({
      question: z.string().describe('The question to ask the user'),
      suggestedDefault: z.string().describe('Suggested default answer if user does not respond'),
    }),
    execute: async (
      args: {
        question: string;
        suggestedDefault: string;
      },
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      // In current implementation, we just use the default
      // In future, this could pause execution and wait for user input

      return {
        success: true,
        result: `Question noted: "${args.question}". Using default: "${args.suggestedDefault}"`,
        metadata: {
          question: args.question,
          answer: args.suggestedDefault,
        },
      };
    },
  };
}

/**
 * All meta tools
 */
export const metaTools = {
  plan: createPlanTool(),
  finish_with_summary: createFinishWithSummaryTool(),
  ask_user: createAskUserTool(),
};
