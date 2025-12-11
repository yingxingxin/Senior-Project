/**
 * Tool Registry
 *
 * Registers all available tools for use with Vercel AI SDK.
 */

import type { ToolExecutionContext } from '../types';
import { createEditTools } from './edit';
import { createMetaTools } from './meta';

/**
 * Wrap a tool to log its execution results and report progress
 * Uses a generic approach that preserves AI SDK tool compatibility
 */
function wrapToolWithLogging<T>(
  toolName: string,
  tool: T,
  stepRef: { current: number },
  context: ToolExecutionContext
): T {
  // Type assertion for the execute property - AI SDK tools have complex union types
  const typedTool = tool as { execute: (...args: unknown[]) => unknown };
  const originalExecute = typedTool.execute;

  // Create a wrapped execute function with logging and progress reporting
  typedTool.execute = async (...args: unknown[]) => {
    // Increment step counter
    stepRef.current++;

    // Report progress BEFORE tool execution
    if (context.onProgress) {
      const plan = context.conversationState.metadata.plan as {
        lessons: Array<{ plannedSectionCount: number; createdSectionCount: number }>;
      } | undefined;

      let percentage = 15;
      let message = `Processing ${toolName}...`;

      if (plan) {
        const total = plan.lessons.reduce((s, l) => s + l.plannedSectionCount, 0);
        const done = plan.lessons.reduce((s, l) => s + l.createdSectionCount, 0);
        // Scale from 15% to 85% based on sections created
        percentage = 15 + Math.floor((done / Math.max(total, 1)) * 70);
        message = toolName === 'create_section'
          ? `Creating section ${done + 1} of ${total}...`
          : toolName === 'create_lesson'
          ? `Creating lesson...`
          : toolName === 'plan'
          ? `Planning course...`
          : `Processing...`;
      }

      await context.onProgress({
        step: 'agent_running',
        percentage,
        message,
        stepNumber: stepRef.current,
        totalSteps: 1,
      });
    }

    const startTime = Date.now();
    try {
      const result = await originalExecute.apply(tool, args);
      const duration = Date.now() - startTime;

      const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
      console.log(`[Agent Step ${stepRef.current}] Tool result for ${toolName}:`, {
        success: true,
        duration: `${duration}ms`,
        result: resultStr.substring(0, 300) + (resultStr.length > 300 ? '...' : ''),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Agent Step ${stepRef.current}] Tool error for ${toolName}:`, {
        success: false,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };

  return tool;
}

/**
 * Get all tools configured for AI SDK
 */
export function getAllTools(context: ToolExecutionContext, userId: number, stepRef: { current: number }) {
  const tools = {
    // Edit tools (create_lesson, create_section)
    ...createEditTools(context),
    // Meta tools (plan, finish_with_summary)
    ...createMetaTools(context),
  };

  // Wrap all tools with logging and progress reporting, preserving their original types
  const toolEntries = Object.entries(tools);
  const wrappedEntries = toolEntries.map(([name, tool]) => [
    name,
    wrapToolWithLogging(name, tool, stepRef, context),
  ]);

  return Object.fromEntries(wrappedEntries) as typeof tools;
}

/**
 * Check if a tool is a final tool (ends execution)
 */
export function isFinalTool(toolName: string): boolean {
  return toolName === 'finish_with_summary';
}

/**
 * Get tool execution context description for system prompt
 */
export function getToolsDescription(): string {
  return `
AVAILABLE TOOLS:

**Planning:**
- plan: Create a structured course plan with lessons and sections (ALWAYS use this first)

**Lesson Management (Level 2):**
- create_lesson: Create a new lesson within the course. Lessons appear on the course overview page.

**Section Management (Level 3):**
- create_section: Create a new section within the CURRENT lesson with Markdown content.

**Completion:**
- finish_with_summary: Provide course metadata (title, slug, description) and mark complete (ALWAYS use this last)

3-LEVEL HIERARCHY:
- Level 1: Course (the overall topic, e.g., "Mastering React Hooks")
- Level 2: Lessons (2-4 major topics shown as cards on course page)
- Level 3: Sections (3-5 content chunks per lesson, what users navigate with "Next")

WORKFLOW:
1. Call "plan" to define the hierarchy: lessons with their sections
2. FOR EACH LESSON in your plan:
   a. Call "create_lesson" with title, slug, description
   b. FOR EACH SECTION in that lesson:
      Call "create_section" with title, slug, AND content (Markdown string)
3. Call "finish_with_summary" with course metadata when ALL lessons and sections complete

SLUG GUIDELINES:
- Course slug: Descriptive (e.g., "mastering-react-hooks")
- Lesson slugs: Clear (e.g., "understanding-usestate", "custom-hooks")
- Section slugs: Short (e.g., "introduction", "examples", "summary")
- Format: lowercase letters, numbers, hyphens only

IMPORTANT:
- You must create a lesson BEFORE creating sections within it
- Each lesson's sections are saved separately to the database
- Build one lesson at a time, completing all its sections before moving to the next
- Write content in EXTENDED MARKDOWN - it will be parsed to Tiptap JSON automatically
`.trim();
}
